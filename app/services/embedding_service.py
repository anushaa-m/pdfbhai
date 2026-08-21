from sentence_transformers import SentenceTransformer
import numpy as np

# Small, fast, good-quality embedding model - loads once at import time
_model = SentenceTransformer("all-MiniLM-L6-v2")

EMBEDDING_DIM = 384  # matches all-MiniLM-L6-v2 output size


def embed_texts(texts: list[str]) -> np.ndarray:
    """
    Returns a (N, 384) float32 numpy array of embeddings for the given texts.
    """
    embeddings = _model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    return embeddings.astype("float32")


def embed_text(text: str) -> np.ndarray:
    return embed_texts([text])[0]
