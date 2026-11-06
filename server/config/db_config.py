from pymongo import MongoClient
from pymongo.operations import SearchIndexModel
import os
from dotenv import load_dotenv

load_dotenv()

VECTOR_INDEX_NAME = "vector_index"
EMBEDDING_DIM = 1024  # voyage-multimodal-3 output dimensionality

def get_db():
    if(os.getenv("DEPLOY_PRODUCTION").lower() == 'true'):
        print("launching database in production mode")
        client = MongoClient(os.getenv("DATABASE_PRODUCTION_URL")) 
        db = client["StyleForge"]
    else:
        print("launching database in development mode")
        client = MongoClient(os.getenv("DATABASE_URI"))
        db = client["StyleForge"]

    return db


def ensure_vector_search_index(collection_name="Projects"):
    """
    Create the Atlas Vector Search index on <collection>.embedding if it doesn't
    already exist. Idempotent. Only supported on MongoDB Atlas — a local/community
    MongoDB raises, which the caller is expected to catch.
    """
    collection = get_db()[collection_name]
    existing = list(collection.list_search_indexes())
    if any(ix.get("name") == VECTOR_INDEX_NAME for ix in existing):
        print(f"Vector index '{VECTOR_INDEX_NAME}' already exists — skipping.")
        return

    search_index_model = SearchIndexModel(
        definition={
            "fields": [
                {
                    "type": "vector",
                    "path": "embedding",
                    "numDimensions": EMBEDDING_DIM,
                    "similarity": "cosine",
                },
                {"type": "filter", "path": "is_public"},
            ]
        },
        name=VECTOR_INDEX_NAME,
        type="vectorSearch",
    )

    collection.create_search_index(model=search_index_model)
    print(f"Created vector index '{VECTOR_INDEX_NAME}' on '{collection_name}'.")
