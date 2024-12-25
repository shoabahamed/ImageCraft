from flask import jsonify, request
from email_validator import validate_email, EmailNotValidError
import bcrypt
from utils.token_utils import create_token
from config.db_config import get_db


import os
import pathlib

import requests
from flask import session, abort, redirect, request
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests
from dotenv import load_dotenv
load_dotenv()

db = get_db()
users_collection = db["Users"]

client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "client_secret.json")

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
    redirect_uri="http://127.0.0.1:5000/api/callback"
)

def google_login():
    authorization_url, state = flow.authorization_url()
    # session["state"] = state
    return jsonify({"authorization_url": authorization_url})


def callback():
    try:
        # Fetch token using the authorization response (URL with `code` and `state`)
        flow.fetch_token(authorization_response=request.url)

        # Token verification and user information extraction
        credentials = flow.credentials
        request_session = requests.session()
        cached_session = cachecontrol.CacheControl(request_session)
        token_request = google.auth.transport.requests.Request(session=cached_session)

        id_info = id_token.verify_oauth2_token(
            id_token=credentials._id_token,
            request=token_request,
            audience=os.getenv("GOOGLE_CLIENT_ID")
        )

        
        # Extract user email
        email = id_info["email"]
        user = users_collection.find_one({"email": email})
        if not user:
            username = id_info['name']
            valid_email = email
            
            hashed_password = "gmail_login"
            user_data = {"username": username, "email": valid_email, "password": hashed_password}
            user = users_collection.insert_one(user_data)
            # Generate JWT token
            token = create_token(str(user.inserted_id))

        # Redirect to the frontend with the email and token as query parameters
        redirect_url = f"http://localhost:5173/?email={email}&token={token}"
        return redirect(redirect_url)

    except Exception as e:
        print(f"Error in callback: {str(e)}")  # Log the error for debugging
        return jsonify({"error": str(e)}), 500



def signup():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        username = data.get("username")
        
        if not email or not password or not username:
            return jsonify({"success": False, "message": "Email and password and username are required"}), 400

        try:
            valid_email = validate_email(email).email
        except EmailNotValidError as e:
            return jsonify({"success": False, "message": f"Invalid email: {str(e)}"}), 400

        if users_collection.find_one({"email": valid_email}):
            return jsonify({"success": False, "message": "Email already exists"}), 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        user_data = {"username": username, "email": valid_email, "password": hashed_password.decode('utf-8')}
        user_data = {"username": username, "email": valid_email, "password": hashed_password.decode('utf-8')}
        user = users_collection.insert_one(user_data)

        token = create_token(str(user.inserted_id))
        response = {"email": valid_email, "token": token}

        return jsonify({"success": True, "message": "User added successfully", "data": response}), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

def login():
    """
    Authenticates a user by verifying their email and password.
    Expects a JSON body with 'email' and 'password'.
    """
    try:
        # Parse request data
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        # Validate input
        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400

        # Validate email format using email-validator library
        try:
            valid_email = validate_email(email).email  # Validates and normalizes the email
        except EmailNotValidError as e:
            return jsonify({"success": False, "message": f"Invalid email: {str(e)}"}), 400

        # Check if user exists
        user = users_collection.find_one({"email": valid_email})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

        # Generate JWT token
        token = create_token(str(user["_id"]))

        response = {
            "email": valid_email,
            "token": token
        }

        return jsonify({"success": True, "message": "Login successful", "data": response}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500


