from flask import Blueprint, g, request, jsonify
from controllers.project_contoller import save_project, get_projects, get_all_projects, get_project_by_id, delete_project, update_project_visibility, update_project_bookmark, rate_project, update_project_view_count, get_bookmark_projects
from middleware.auth import auth_middleware

project_routes = Blueprint("project_routes", __name__)

# Attach the middleware to the blueprint
@project_routes.before_request
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
@project_routes.route("/api/save_project", methods=["OPTIONS", "POST"])
def save_project_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return save_project()


@project_routes.route("/api/get_projects/<user_id>", methods=["GET"])
def get_projects_route(user_id):
    # Access `g.user_id` for user ID extracted from the token
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    
    return get_projects(user_id)


@project_routes.route("/api/bookmark_projects/<user_id>", methods=["GET"])
def get_bookmark_projects_route(user_id):
    
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    
    return get_bookmark_projects(user_id)


@project_routes.route("/api/get_all_projects", methods=["GET"])
def get_all_projects_route():
    # Access `g.user_id` for user ID extracted from the token
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    
    return get_all_projects()



@project_routes.route("/api/get_project_by_id/<project_id>", methods=["GET"])
def get_project_by_id_route(project_id):
    # Access `g.user_id` for user ID extracted from the token
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    
    return get_project_by_id(project_id)


@project_routes.route("/api/delete_project/<project_id>", methods=["OPTIONS", "DELETE"])
def delete_project_route(project_id):
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    return delete_project(project_id)


# Define routes
@project_routes.route("/api/projects/update_visibility", methods=["OPTIONS", "POST"])
def update_project_visiblity_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return update_project_visibility()



# Define routes
@project_routes.route("/api/projects/toggle_bookmark", methods=["OPTIONS", "POST"])
def update_project_bookmark_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return update_project_bookmark()


@project_routes.route("/api/projects/rate", methods=["OPTIONS", "POST"])
def rate_project_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return rate_project()



@project_routes.route("/api/projects/update_views", methods=["OPTIONS", "POST"])
def update_project_view_count_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_project logic
    return update_project_view_count()




