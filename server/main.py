from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.auth_routes import auth_routes
from routes.project_routes import project_routes
from routes.report_routes import report_routes
from dotenv import load_dotenv
import os 
load_dotenv()


app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET")
# CORS(app, origins="*", supports_credentials=True, 
#      allow_headers=["Authorization", "Content-Type", "Access-Control-Allow-Headers"], 
#      expose_headers=["Authorization"])

app = Flask(__name__)
app.config['ORG_IMG_FOLDER'] = 'C:/Shoab/PROJECTS/StyleForge/static/original'
app.config['CANVAS_IMG_FOLDER'] = 'C:/Shoab/PROJECTS/StyleForge/static/canvas'

# os.makedirs(app.config['ORG_IMG_FOLDER'], exist_ok=True)

@app.route('/static/original/<string:filename>')
def get_original_image(filename):
    print(filename)
    return send_from_directory(app.config['ORG_IMG_FOLDER'], filename, as_attachment=False)

@app.route('/static/canvas/<string:filename>')
def get_canvas_image(filename):
    print(filename)
    return send_from_directory(app.config['CANVAS_IMG_FOLDER'], filename, as_attachment=False)



# Register Blueprints
app.register_blueprint(auth_routes)
app.register_blueprint(project_routes)
app.register_blueprint(report_routes)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
