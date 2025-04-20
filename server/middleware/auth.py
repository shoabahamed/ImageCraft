import jwt
from flask import request, jsonify, g
import os
from dotenv import load_dotenv

load_dotenv()

def auth_middleware():
    def middleware():
        token = request.headers.get("Authorization")
        # print(f"Authorization header: {token}")

        if not token:
            return jsonify({"success": False, "message": "Token is missing"}), 401

        try:
            # Expecting 'Bearer <token>', split and decode
            token_parts = token.split()
            if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
                return jsonify({"success": False, "message": "Invalid token format"}), 401

            token_value = token_parts[1]
            payload = jwt.decode(token_value, os.getenv("JWT_SECRET"), algorithms=["HS256"])
            user_id = payload.get("_id")
            role = payload.get('role')
            if not user_id:
                return jsonify({"success": False, "message": "Invalid token payload"}), 401

            # Attach `_id` to `g` for downstream use
            g._id = user_id
            g.role = role

        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401

    return middleware
