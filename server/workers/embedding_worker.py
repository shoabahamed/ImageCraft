import json
import logging
import os
import threading
import time
from datetime import datetime
from io import BytesIO

import pika
import requests
from dotenv import load_dotenv
from PIL import Image
from werkzeug.utils import secure_filename

# Load local .env values before importing application configuration.
load_dotenv()

from config.db_config import get_db
from utils.common import get_user_paths
from utils.embedding_queue import (
    DEAD_QUEUE_NAME,
    MAX_RETRIES,
    QUEUE_NAME,
    connection_parameters,
    declare_embedding_queues,
    retry_delay_ms,
    retry_queue_name,
)
from utils.image_embedding import embed_pil_image


logger = logging.getLogger(__name__)
projects_collection = get_db()["Projects"]

# These variables ensure this process starts only one worker thread.
_worker_thread = None
_worker_lock = threading.Lock()


def _load_canvas_image(project):
    """Load the already-saved canvas image as a PIL RGB image."""

    if os.getenv("DEPLOY_PRODUCTION", "false").lower() == "true":
        # Production projects store their canvas image at a Cloudinary URL.
        image_url = project.get("canvas_image_url")
        if not image_url:
            raise ValueError("Project has no canvas_image_url")

        # The timeout tuple means: 5 seconds to connect, 60 seconds to receive.
        response = requests.get(image_url, timeout=(5, 60))
        response.raise_for_status()

        # Convert to RGB so the embedding code receives a consistent format.
        with Image.open(BytesIO(response.content)) as image:
            return image.convert("RGB")

    # Development projects use the local canvas image saved by save_project().
    _, _, canvas_folder, _ = get_user_paths(
        os.getenv("USER_COMMON_PATH"),
        project["user_id"],
    )

    filename = secure_filename(f"{project['project_id']}.png")
    path = os.path.join(canvas_folder, filename)

    with Image.open(path) as image:
        return image.convert("RGB")


def _task_match(task):
    """Return the MongoDB filter for this exact project save/job."""
    return {
        "user_id": task["user_id"],
        "project_id": task["project_id"],
        "embedding_job_id": task["job_id"],
    }


def _mark_retrying(task, error, retry_count):
    """Record that another attempt has been scheduled."""

    if not isinstance(task, dict):
        return

    if not task.get("user_id") or not task.get("project_id") or not task.get("job_id"):
        return

    projects_collection.update_one(
        _task_match(task),
        {
            "$set": {
                "embedding_status": "retrying",
                "embedding_error": str(error)[:1000],
                "embedding_retry_count": retry_count,
            }
        },
    )


def _mark_failed(task, error, retry_count):
    """Record that the job has exhausted its retries."""

    if not isinstance(task, dict):
        return

    if not task.get("user_id") or not task.get("project_id") or not task.get("job_id"):
        return

    projects_collection.update_one(
        _task_match(task),
        {
            "$set": {
                "embedding_status": "failed",
                "embedding_error": str(error)[:1000],
                "embedding_retry_count": retry_count,
            }
        },
    )


def process_embedding_task(task):
    """Generate and store one project's image embedding."""

    match = _task_match(task)

    # The job ID makes sure an old job cannot overwrite a newer project save.
    project = projects_collection.find_one(match)

    # The project may have been deleted or saved again since this job was queued.
    if not project:
        logger.info(
            "Ignoring stale embedding job for project %s",
            task.get("project_id"),
        )
        return

    # A duplicate delivery after a completed job needs no further work.
    if project.get("embedding_status") == "ready":
        return

    projects_collection.update_one(
        match,
        {
            "$set": {
                "embedding_status": "processing",
                "embedding_error": None,
            }
        },
    )

    # Load the persisted image, then call Voyage AI.
    image = _load_canvas_image(project)
    embedding = embed_pil_image(image).tolist()

    # Save the result only if this is still the project's current job.
    result = projects_collection.update_one(
        match,
        {
            "$set": {
                "embedding": embedding,
                "embedding_status": "ready",
                "embedding_error": None,
                "embedding_completed_at": datetime.utcnow(),
            }
        },
    )

    if result.matched_count == 0:
        logger.info(
            "Embedding result became stale for project %s",
            task.get("project_id"),
        )


def _get_retry_count(properties):
    """Read this message's retry count from its RabbitMQ headers."""

    headers = properties.headers or {}

    try:
        # The initial producer message sets this to zero.
        return max(0, int(headers.get("x-retry-count", 0)))
    except (TypeError, ValueError):
        # Treat a missing or invalid header as a new job.
        return 0


def _publish_recovery_message(
    channel,
    queue_name,
    body,
    original_properties,
    retry_count,
):
    """
    Publish a copy to a retry or dead-letter queue.

    The original message is acknowledged only after this publish succeeds.
    """

    # Preserve existing headers and update the retry counter.
    headers = dict(original_properties.headers or {})
    headers["x-retry-count"] = retry_count

    new_properties = pika.BasicProperties(
        content_type=original_properties.content_type or "application/json",
        delivery_mode=2,
        message_id=original_properties.message_id,
        headers=headers,
    )

    channel.basic_publish(
        exchange="",
        routing_key=queue_name,
        body=body,
        properties=new_properties,
        mandatory=True,
    )


def _on_message(channel, method, properties, body):
    """Handle one message delivered by RabbitMQ."""

    task = None

    try:
        # RabbitMQ delivers the body as bytes; parse it into a Python object.
        task = json.loads(body)

        if not isinstance(task, dict):
            raise ValueError("Embedding job message must be a JSON object")

        # Image loading, Voyage embedding, and MongoDB update happen here.
        process_embedding_task(task)

    except Exception as exc:
        logger.exception("Embedding job failed")

        current_retry_count = _get_retry_count(properties)

        if current_retry_count < MAX_RETRIES:
            # Schedule the next exponential-backoff retry.
            next_retry_count = current_retry_count + 1
            target_queue = retry_queue_name(next_retry_count)
        else:
            # No retries remain. Preserve the job in the dead queue.
            next_retry_count = current_retry_count
            target_queue = DEAD_QUEUE_NAME

        try:
            # This publishes a replacement message to the retry/dead queue.
            _publish_recovery_message(
                channel=channel,
                queue_name=target_queue,
                body=body,
                original_properties=properties,
                retry_count=next_retry_count,
            )

        except Exception:
            logger.exception(
                "Could not publish the retry/dead-letter message"
            )

            # The replacement was not confirmed, so keep the original message.
            # This is only a fallback; normal retries go through delayed queues.
            channel.basic_nack(
                delivery_tag=method.delivery_tag,
                requeue=True,
            )
            return

        if target_queue == DEAD_QUEUE_NAME:
            # The message is safely in the dead queue; now record the final error.
            try:
                _mark_failed(
                    task,
                    exc,
                    retry_count=current_retry_count,
                )
            except Exception:
                logger.exception("Could not record final embedding failure")

            logger.error(
                "Embedding job exhausted %s retries; sent to %s",
                MAX_RETRIES,
                DEAD_QUEUE_NAME,
            )

        else:
            # The message is safely in its delayed retry queue.
            try:
                _mark_retrying(
                    task,
                    exc,
                    retry_count=next_retry_count,
                )
            except Exception:
                logger.exception("Could not record retry status")

            delay_seconds = retry_delay_ms(next_retry_count) / 1000
            logger.warning(
                "Scheduled retry %s of %s in %s seconds",
                next_retry_count,
                MAX_RETRIES,
                delay_seconds,
            )

        # The replacement message was confirmed, so remove the original
        # delivery from the main queue.
        channel.basic_ack(delivery_tag=method.delivery_tag)

    else:
        # The job succeeded, or was identified as stale. Remove the message.
        channel.basic_ack(delivery_tag=method.delivery_tag)


def _consume_forever():
    """Connect to RabbitMQ and keep consuming, reconnecting after errors."""

    while True:
        connection = None

        try:
            connection = pika.BlockingConnection(connection_parameters())
            channel = connection.channel()

            # Create the main, retry, and dead-letter queues if needed.
            declare_embedding_queues(channel)

            # Confirm recovery messages before acknowledging their originals.
            channel.confirm_delivery()

            # Give this consumer one unacknowledged job at a time.
            channel.basic_qos(prefetch_count=1)

            channel.basic_consume(
                queue=QUEUE_NAME,
                on_message_callback=_on_message,

                # The callback must explicitly ack or nack each message.
                auto_ack=False,
            )

            logger.info("Listening on RabbitMQ queue %s", QUEUE_NAME)
            channel.start_consuming()

        except Exception:
            logger.exception(
                "Embedding consumer disconnected; reconnecting shortly"
            )
            time.sleep(5)

        finally:
            if connection and connection.is_open:
                try:
                    connection.close()
                except Exception:
                    logger.exception("Error closing RabbitMQ connection")


def start_embedding_worker():
    """Start one consumer thread in this Python process."""

    global _worker_thread

    # The Flask before_request hook may call this for every request.
    # The lock and alive check prevent starting multiple threads in this process.
    with _worker_lock:
        if _worker_thread and _worker_thread.is_alive():
            return

        _worker_thread = threading.Thread(
            target=_consume_forever,
            name="embedding-consumer",

            # A daemon thread does not prevent the web process from exiting.
            daemon=True,
        )
        _worker_thread.start()


if __name__ == "__main__":
    # You can later run a separate worker with:
    # python -m workers.embedding_worker
    _consume_forever()