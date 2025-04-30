from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    if(os.getenv("DEPOLY_PRODUCTION").lower() == 'true'):
        print("launching server in production mode")
        client = MongoClient(os.getenv("DATABASE_PRODUCTION_URL")) 
        db = client["StyleForge"]
    else:
        print("launching server in development mode")
        client = MongoClient(os.getenv("DATABASE_URI")) 
        db = client["StyleForge"]

    return db
