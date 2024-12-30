from flask import Blueprint, g, request, jsonify
from controllers.report_controller import submit_report, get_all_reports, resolve_report, delete_report
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

