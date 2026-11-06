"""
StyleForge image embedding via Voyage AI's multimodal model.

Embeddings are stored directly on the project document in the Projects collection
(one vector per project), so this module only needs a single-image "document" embed.
No batching/rate-limit sleeps are needed here because save_project handles one
canvas render at a time.
"""
import os

import numpy as np
import voyageai

VOYAGE_MODEL = "voyage-multimodal-3"

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = voyageai.Client(api_key=os.environ["VOYAGE_API_KEY"])
    return _client


def embed_pil_image(image):
    """Embed one PIL image for storage ('document' input type). Returns np.ndarray."""
    result = _get_client().multimodal_embed(
        inputs=[[image]],
        model=VOYAGE_MODEL,
        input_type="document",
    )
    return np.array(result.embeddings[0])


def embed_text_query(text):
    """Embed one text string as a 'query' vector, in the same space as the images."""
    result = _get_client().multimodal_embed(
        inputs=[[text]],
        model=VOYAGE_MODEL,
        input_type="query",
    )
    return np.array(result.embeddings[0])
