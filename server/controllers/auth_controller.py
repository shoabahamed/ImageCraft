from flask import jsonify, request
from email_validator import validate_email, EmailNotValidError
import bcrypt
from utils.token_utils import create_token
from config.db_config import get_db
import jwt

from bson import ObjectId
import os
import pathlib
from utils.common import get_user_paths, create_user_paths
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


# the routes below all created from user from mainpage. So all the users created this a are always user and 
# does not have the capibility to check admin stuff
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
        role = "user"
        user = users_collection.find_one({"email": email})

        if not user:
            print("creating new user using google account")
            username = id_info['name']
            valid_email = email
            role = "user"
            image_url = ""
            hashed_password = "gmail_login"
            user_data = {"username": username, "email": valid_email, "password": hashed_password, "role": role, "bookmarked": [], "image_url": image_url}
            user = users_collection.insert_one(user_data)
            # Generate JWT token
            token = create_token(str(user.inserted_id), role=role)
            
            user_id = str(user.inserted_id)
            USER_PATH, ORG_PATH, CANVAS_PATH, INTER_PATH = get_user_paths(os.getenv("USER_COMMON_PATH"), str(user.inserted_id))
            print(USER_PATH)
            create_user_paths(USER_PATH, ORG_PATH, CANVAS_PATH, INTER_PATH)
        
        
        else:
            email = user['email']
            role = user['role']
            username = user['username']
            user_id = str(user["_id"])
            image_url = user['image_url']
            # Existing user: Generate token using the user's ObjectId
            token = create_token(str(user["_id"]), role=role)
        
            
        
        # Redirect to the frontend with the email and token as query parameters
        redirect_url = f"http://localhost:5173/?email={email}&token={token}&role={role}&username={username}&userId={user_id}&image_url={image_url}"
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
        role = "user"
        
        if not email or not password or not username:
            return jsonify({"success": False, "message": "Email and password and username are required"}), 400

        try:
            valid_email = validate_email(email).email
        except EmailNotValidError as e:
            return jsonify({"success": False, "message": f"Invalid email: {str(e)}"}), 400

        if users_collection.find_one({"email": valid_email}):
            return jsonify({"success": False, "message": "Email already exists"}), 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        # user_data = {"username": username, "email": valid_email, "password": hashed_password.decode('utf-8')}
        user_data = {"username": username, "email": valid_email, "password": hashed_password.decode('utf-8'), "role": role, "bookmarked": [], "image_url": ""}
        user = users_collection.insert_one(user_data)

        token = create_token(str(user.inserted_id), role=role)
        response = {"email": valid_email, "token": token, "role": role, "username": username, "userId": str(user.inserted_id), "image_url": ""}

        # create a specific directory for the user using user id

        if(os.getenv("DEPOLY_PRODUCTION").lower() == 'false'):
            USER_PATH, ORG_PATH, CANVAS_PATH, INTER_PATH = get_user_paths(os.getenv("USER_COMMON_PATH"), str(user.inserted_id))
            create_user_paths(USER_PATH, ORG_PATH, CANVAS_PATH, INTER_PATH)
            
 
     
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

        role = str(user['role'])
        username = str(user['username'])
        user_id = str(user["_id"])
        image_url = user['image_url']
        # Generate JWT token
        token = create_token(str(user["_id"]), role=role)
        response = {
            "email": valid_email,
            "token": token,
            "role": role,
            'username': username,
            "userId": user_id,
            "image_url": image_url
        }

        return jsonify({"success": True, "message": "Login successful", "data": response}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500



def get_user_info(user_id):
    user = users_collection.find_one({"_id": ObjectId(user_id)}, {"username": 1, "email": 1, "image_url": 1, "_id": 0})

    return jsonify({"success": True, "message": "Data Retrieveal successful", "data": user}), 200


def update_profile_image(user_id):
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token is missing"}), 401

        # Expecting 'Bearer <token>', split and decode
        token_parts = token.split()
        if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
            return jsonify({"success": False, "message": "Invalid token format"}), 401

        token_value = token_parts[1]
        payload = jwt.decode(token_value, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        current_user_id = payload.get("_id")

        if not current_user_id:
            return jsonify({"success": False, "message": "Invalid token payload"}), 
    
        if current_user_id == user_id:
            # Initialize update dictionary and response data
            update_data = {}
            response_data = {"success": True}
            
            # Handle profile image update if provided
            profile_image = request.files.get('profile_image')
            if profile_image:
                filename = "profile_image.png"
                USER_PATH, _, _, _ = get_user_paths(os.getenv("USER_COMMON_PATH"), user_id) 
                USER_PATH = USER_PATH + filename # the actual path stored in the computer
                image_save_path = os.getenv("BACKEND_SERVER") + "/server/static/" + user_id  + "/" + filename # the path used by server to locate the image from database
                
                profile_image.save(USER_PATH)
                update_data["image_url"] = image_save_path
                response_data["image_url"] = image_save_path
                response_data["message"] = "Profile image updated successfully"
            
            # Handle username update if provided
            username = request.form.get('username')
            if username:
                update_data["username"] = username
                response_data["username"] = username
                response_data["message"] = "Username updated successfully" if not profile_image else "Profile updated successfully"
            
            # Only update if there's something to update
            if update_data:
                result = users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
                return jsonify(response_data), 200
            else:
                return jsonify({"success": False, "message": "No updates provided"}), 400
        else:
            return jsonify({"success": False, "message": "You need to sign in first"}), 401
        
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    

# the function below can only be accessed by admin to create a new admin user they are always have admin role


def admin_signup():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token is missing"}), 401

        # Expecting 'Bearer <token>', split and decode
        token_parts = token.split()
        if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
            return jsonify({"success": False, "message": "Invalid token format"}), 401

        token_value = token_parts[1]
        payload = jwt.decode(token_value, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        requester_role =  payload.get("role")
        
        
        
        # only an admin can create another admin. Ideally though we should have a super admin which would create, add, delete new admins.
        if requester_role and requester_role.lower() == 'super admin':
            data = request.get_json()
            email = data.get("email")
            password = data.get("password")
            username = data.get("username")
            role = data.get("role", "admin").lower()  # Default to admin if not specified
            
            # Validate role is one of the allowed types
            if role not in ["admin", "super admin"]:
                role = "admin"  # Default to admin if invalid role provided
            
            if not email or not password or not username:
                return jsonify({"success": False, "message": "Email and password and username are required"}), 400

            try:
                valid_email = validate_email(email).email
            except EmailNotValidError as e:
                return jsonify({"success": False, "message": f"Invalid email: {str(e)}"}), 400

            if users_collection.find_one({"email": valid_email}):
                return jsonify({"success": False, "message": "Email already exists"}), 409

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            user_data = {"username": username, "email": valid_email, "password": hashed_password.decode('utf-8'), "role": role, "bookmarked": [], "image_url": ""}
            user = users_collection.insert_one(user_data)

            token = create_token(str(user.inserted_id), role=role)
            response = {"email": valid_email, "token": token, "role": role, "username": username, "userId": str(user.inserted_id), "image_url": ""}

            # create a specific directory for the user using user id
            USER_PATH, ORG_PATH, CANVAS_PATH, INTER_PATH = get_user_paths(os.getenv("USER_COMMON_PATH"), str(user.inserted_id))
            create_user_paths(USER_PATH, ORG_PATH, CANVAS_PATH, INTER_PATH)
            
            return jsonify({"success": True, "message": "Admin created successfully", "data": response}), 201
        else:
            return jsonify({"success": False, "message": "Unauthorized. Only admins can create admin accounts"}), 403
        
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

  
  
def get_all_admins():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token is missing"}), 401

        # Expecting 'Bearer <token>', split and decode
        token_parts = token.split()
        if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
            return jsonify({"success": False, "message": "Invalid token format"}), 401

        token_value = token_parts[1]
        payload = jwt.decode(token_value, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        requester_role = payload.get("role")
        
        if requester_role and requester_role.lower() == 'super admin':
            # Find all users with role admin or super admin
            admin_users = list(users_collection.find({"role": {"$in": ["admin", "super admin"]}}))
            
            formatted_admins = [
                {
                    "user_id": str(user["_id"]),
                    "username": user['username'],
                    "email": user['email'],
                    "image_url": user['image_url'],
                    "role": user['role']
                }
                for user in admin_users
            ]
            return jsonify({"success": True, "data": formatted_admins}), 200
        else:
            return jsonify({"success": False, "message": "Unauthorized. Only super admins are allowed"}), 403
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

def delete_admin_user(user_id):
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token is missing"}), 401

        # Expecting 'Bearer <token>', split and decode
        token_parts = token.split()
        if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
            return jsonify({"success": False, "message": "Invalid token format"}), 401

        token_value = token_parts[1]
        payload = jwt.decode(token_value, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        requester_role = payload.get("role")
        requester_id = payload.get("_id")
        
        # Only admins can delete users, and users can't delete themselves
        if not requester_role or requester_role.lower() != 'super admin':
            return jsonify({"success": False, "message": "Unauthorized. Only super admins can delete users"})
        
        if requester_id == user_id:
            return jsonify({"success": False, "message": "You cannot delete your own account"}), 403
        
        # Check if user exists
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
            
        # Delete the user
        result = users_collection.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 1:
            return jsonify({"success": True, "message": "User deleted successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Failed to delete user"}), 500
            
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500