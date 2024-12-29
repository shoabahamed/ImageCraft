from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.auth_routes import auth_routes
from routes.project_routes import project_routes
from dotenv import load_dotenv
import os 
load_dotenv()


app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET")
# CORS(app, origins="*", supports_credentials=True, 
#      allow_headers=["Authorization", "Content-Type", "Access-Control-Allow-Headers"], 
#      expose_headers=["Authorization"])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'C:/Shoab/PROJECTS/StyleForge/static/uploads'

@app.route('/static/uploads/<string:filename>')
def download_file(filename):
    print(filename)
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=False)

# Register Blueprints
app.register_blueprint(auth_routes)
app.register_blueprint(project_routes)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
