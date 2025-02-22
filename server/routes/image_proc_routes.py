from flask import Blueprint, g, jsonify, request
from middleware.auth import auth_middleware
from controllers.image_proc_controller import apply_style_transfer, find_similar_image, apply_super_resolution


image_proc_routes = Blueprint("image_processing", __name__)


# Attach the middleware to the blueprint
@image_proc_routes.before_request
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
@image_proc_routes.route("/api/image_proc/style_transfer", methods=["OPTIONS", "POST"])
def style_transfer_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return apply_style_transfer()


# Define routes
@image_proc_routes.route("/api/image_proc/super_res", methods=["OPTIONS", "POST"])
def super_resolution_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return apply_super_resolution()




# Define routes
@image_proc_routes.route("/api/image_proc/similar_image", methods=["OPTIONS", "POST"])
def find_similar_image_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return find_similar_image()
