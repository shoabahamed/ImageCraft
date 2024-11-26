from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    client = MongoClient(os.getenv("DATABASE_URI"))
    db = client["StyleForge"]
    return db
