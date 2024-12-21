from flask import Blueprint
from controllers.auth_controller import signup, login, google_login, callback

auth_routes = Blueprint("auth_routes", __name__)

auth_routes.route("/api/signup", methods=["POST"])(signup)
auth_routes.route("/api/login", methods=["POST"])(login)


auth_routes.route("/api/google_login", methods=["GET"])(google_login)
auth_routes.route("/api/callback")(callback)