from flask import Blueprint, g, request, jsonify
from controllers.report_controller import submit_report, get_all_reports, resolve_report, delete_report, grant_logs, get_user_reports, delete_report_project,  send_message, get_project_log, add_style_img, get_all_style_img, delete_style_img, get_all_users, send_notice, get_user_notices, delete_user
from middleware.auth import auth_middleware

report_routes = Blueprint("report_routes", __name__)

# Attach the middleware to the blueprint
@report_routes.before_request
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
@report_routes.route("/api/submit_report", methods=["OPTIONS", "POST"])
def save_report_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return submit_report()

@report_routes.route("/api/get_all_reports", methods=["OPTIONS", "GET"])
def get_all_report_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return get_all_reports()


@report_routes.route("/api/get_user_reports/<user_id>", methods=["OPTIONS", "GET"])
def get_user_report_route(user_id):
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return get_user_reports(user_id)



@report_routes.route("/api/resolve_report", methods=["OPTIONS", "POST"])
def resolve_report_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return resolve_report()



@report_routes.route("/api/delete_report/<report_id>", methods=["OPTIONS", "DELETE"])
def delete_report_route(report_id):
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    return delete_report(report_id)


@report_routes.route("/api/grant_logs", methods=["OPTIONS", "POST"])
def grant_logs_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return grant_logs()



@report_routes.route("/api/delete_report_project", methods=["OPTIONS", "POST"])
def delete_project_route():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    

    return delete_report_project()



@report_routes.route("/api/send_message", methods=["OPTIONS", "POST"])
def sende_message_route():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    

    return send_message()


@report_routes.route("/api/project_log/<project_id>", methods=["OPTIONS", "GET"])
def get_project_log_route(project_id):
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return get_project_log(project_id)




@report_routes.route("/api/add_style_img", methods=["OPTIONS", "POST"])
def add_style_img_route():

    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return add_style_img()




@report_routes.route("/api/all_style_img", methods=["OPTIONS", "GET"])
def get_all_style_img_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return get_all_style_img()





@report_routes.route("/api/delete_style_img/<image_id>", methods=["OPTIONS", "DELETE"])
def delete_style_image_route(image_id):
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    return delete_style_img(image_id)


# handle users from admin
@report_routes.route("/api/all_users", methods=["OPTIONS", "GET"])
def get_all_users_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return get_all_users()


@report_routes.route("/api/send_notice", methods=["OPTIONS", "POST"])
def sende_notice_route():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    
    return send_notice()


# route for retriving user specific notices
@report_routes.route("/api/user_notices/<user_id>", methods=["OPTIONS", "GET"])
def get_user_notice_route(user_id):
    if request.method == "OPTIONS":
        # Handle preflight request
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204

    # For POST requests, proceed with save_report logic
    return get_user_notices(user_id)


@report_routes.route("/api/delete_user/<user_id>", methods=["OPTIONS", "DELETE"])
def delete_user_route(user_id):
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        return response, 204
    return delete_user(user_id)




