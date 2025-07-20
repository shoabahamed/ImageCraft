from flask import Blueprint, g, request, jsonify
from middleware.auth import auth_middleware
from controllers.subscription_controller import subscribe_user, get_user_subscription_info, subscription_manage

subscription_routes = Blueprint("subscription_routes", __name__)

# Attach the middleware to the blueprint
@subscription_routes.before_request
def use_auth_middleware():
    # Print method and headers for debugging
    # print(f"Request headers: {request.headers}")

    # Skip middleware for preflight OPTIONS requests
    if request.method == "OPTIONS":
        return '', 204

    # Proceed with auth middleware for other requests
    response = auth_middleware()()
    if response:
        return response


# Define routes
@subscription_routes.route("/api/subscribe", methods=["OPTIONS", "GET"])
def subscribe_user_route():
   
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return subscribe_user()


# Define routes
@subscription_routes.route("/api/subscription_info", methods=["OPTIONS", "GET"])
def get_user_subscription_info_route():
   
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return get_user_subscription_info()


# Define routes
@subscription_routes.route("/api/manage_subscription", methods=["OPTIONS", "GET"])
def subscription_manage_route():
   
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return subscription_manage()
  
  

