from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_routes

app = Flask(__name__)
CORS(app, origins="*")

# Register Blueprints
app.register_blueprint(auth_routes)

if __name__ == "__main__":
    app.run(debug=True, port=8080)
