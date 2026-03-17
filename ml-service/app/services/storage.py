from functools import lru_cache
import os

from pymongo import MongoClient


@lru_cache(maxsize=1)
def get_collection():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/mindtrack-ai")
    db_name = os.getenv("MONGO_DB_NAME", "mindtrack-ai")
    collection_name = os.getenv("TRAINING_COLLECTION", "ml_training_samples")

    client = MongoClient(mongo_uri)
    db = client[db_name]
    return db[collection_name]
