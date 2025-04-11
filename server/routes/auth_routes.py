from flask import Blueprint
from controllers.auth_controller import signup, login, google_login, callback, get_user_info, update_profile_image

auth_routes = Blueprint("auth_routes", __name__)

auth_routes.route("/api/signup", methods=["POST"])(signup)
auth_routes.route("/api/login", methods=["POST"])(login)


auth_routes.route("/api/google_login", methods=["GET"])(google_login)
auth_routes.route("/api/callback")(callback)

auth_routes.route("/api/user_info/<user_id>", methods=['GET'])(get_user_info)
auth_routes.route("/api/update_profile_image/<user_id>", methods=['POST'])(update_profile_image)

