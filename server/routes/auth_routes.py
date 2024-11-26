from flask import Blueprint
from controllers.auth_controller import signup, login

auth_routes = Blueprint("auth_routes", __name__)

auth_routes.route("/api/signup", methods=["POST"])(signup)
auth_routes.route("/api/login", methods=["POST"])(login)
