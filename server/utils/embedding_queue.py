import json
import os

import pika


QUEUE_NAME = "styleforge.embedding"
DEAD_QUEUE_NAME = "styleforge.embedding.dead"

# The first retry waits 30 seconds. Later delays double:
# retry 1 = 30 seconds, retry 2 = 60 seconds, retry 3 = 120 seconds.
RETRY_DELAY_MS = 30_000

# This is the number of retries after the initial attempt.
MAX_RETRIES = 3


def retry_queue_name(retry_number):
    """Return the queue name for retry number 1, 2, or 3."""
    if retry_number < 1 or retry_number > MAX_RETRIES:
        raise ValueError(f"Invalid retry number: {retry_number}")

    return f"{QUEUE_NAME}.retry.{retry_number}"


def retry_delay_ms(retry_number):
    """Calculate exponential delay: base delay * 2 ** (retry_number - 1)."""
    return RETRY_DELAY_MS * (2 ** (retry_number - 1))


def declare_embedding_queues(channel):
    """
    Declare the main, retry, and dead-letter queues.

    Each retry queue waits for its configured TTL, then RabbitMQ routes
    the message back to the main queue.
    """

    # Main queue: receives new jobs and jobs returning from retry queues.
    channel.queue_declare(
        queue=QUEUE_NAME,
        durable=True,
    )

    # One retry queue per retry attempt, each with a longer delay.
    for retry_number in range(1, MAX_RETRIES + 1):
        channel.queue_declare(
            queue=retry_queue_name(retry_number),
            durable=True,
            arguments={
                # Keep the message in this retry queue for this long.
                "x-message-ttl": retry_delay_ms(retry_number),

                # After the TTL expires, send the message through RabbitMQ's
                # default exchange.
                "x-dead-letter-exchange": "",

                # The default exchange routes to a queue with this name.
                # Send the expired message back to the main queue.
                "x-dead-letter-routing-key": QUEUE_NAME,
            },
        )

    # Jobs go here after they have used all their retries.
    # This queue is not consumed by the worker; it preserves failed jobs.
    channel.queue_declare(
        queue=DEAD_QUEUE_NAME,
        durable=True,
    )


def connection_parameters():
    url = os.getenv("CLOUDAMQP_URL")
    if not url:
        raise RuntimeError("CLOUDAMQP_URL is not configured")

    params = pika.URLParameters(url)

    # Heartbeats help detect a lost RabbitMQ connection.
    params.heartbeat = 60

    # Give RabbitMQ up to 30 seconds to unblock a blocked connection.
    params.blocked_connection_timeout = 30

    return params


def publish_embedding_task(task):
    """Publish a new embedding job to the main queue."""

    # A new connection per publish is simple for a low-volume hobby app.
    # Do not share a Pika connection or channel between Flask request threads.
    connection = pika.BlockingConnection(connection_parameters())

    try:
        channel = connection.channel()

        # Ensure the main queue exists before publishing.
        channel.queue_declare(
            queue=QUEUE_NAME,
            durable=True,
        )

        # Ask RabbitMQ to confirm that it accepted the message.
        channel.confirm_delivery()

        channel.basic_publish(
            exchange="",  # The default exchange routes by queue name.
            routing_key=QUEUE_NAME,
            body=json.dumps(task).encode("utf-8"),
            properties=pika.BasicProperties(
                # Persistent message; used with a durable queue.
                delivery_mode=2,

                # Metadata describing the message body.
                content_type="application/json",

                # Useful for identifying the job in logs and RabbitMQ.
                message_id=task["job_id"],

                # A new job has not been retried yet.
                headers={"x-retry-count": 0},
            ),
            # Ask RabbitMQ to return the message if it cannot route it.
            mandatory=True,
        )

    finally:
        if connection.is_open:
            connection.close()