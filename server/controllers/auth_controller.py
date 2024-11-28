from flask import jsonify, request
from email_validator import validate_email, EmailNotValidError
import bcrypt
from utils.token_utils import create_token
from config.db_config import get_db

db = get_db()
users_collection = db["Users"]

def signup():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        username = data.get("username")

        if not email or not password or username:
            return jsonify({"success": False, "message": "Email and password and username are required"}), 400

        try:
            valid_email = validate_email(email).email
        except EmailNotValidError as e:
            return jsonify({"success": False, "message": f"Invalid email: {str(e)}"}), 400

        if users_collection.find_one({"email": valid_email}):
            return jsonify({"success": False, "message": "Email already exists"}), 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
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

def signup():
    """
    Adds a user to the 'users' collection in the 'users' database.
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

        # Check if email already exists
        if users_collection.find_one({"email": valid_email}):
            return jsonify({"success": False, "message": "Email already exists"}), 409

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Insert into MongoDB
        user_data = {"email": valid_email, "password": hashed_password.decode('utf-8')}
        user = users_collection.insert_one(user_data)
        token = create_token(str(user.inserted_id))
        response = {"email": valid_email, "token": token}

        return jsonify({"success": True, "message": "User added successfully", "data": response}), 201
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
