from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    if(os.getenv("DEPOLY_PRODUCTION").lower() == 'true'):
        print("launching database in production mode")
        client = MongoClient(os.getenv("DATABASE_PRODUCTION_URL")) 
        db = client["StyleForge"]
    else:
        print("launching database in development mode")
        client = MongoClient(os.getenv("DATABASE_URI")) 
        db = client["StyleForge"]

    return db
