from flask import Blueprint, g, jsonify, request
from middleware.auth import auth_middleware
from controllers.text_contoller import parse_text_command


text_proc_routes = Blueprint("text_processing", __name__)


# Attach the middleware to the blueprint
@text_proc_routes.before_request
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
@text_proc_routes.route("/api/text/parse_command", methods=["OPTIONS", "POST"])
def parse_text_command_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return parse_text_command()


