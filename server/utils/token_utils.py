import jwt
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# def create_token(_id):
#     expiration_time = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
#     payload = {
#         "_id": _id,
#         "exp": expiration_time
#     }
#     return jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")


def create_token(_id, role="user"):
    
    # Define the payload with expiration time
    payload = {
        "_id": _id,
        "role": role
    }

    # Create the JWT token
    token = jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

    return token