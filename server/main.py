from flask import Flask, send_from_directory, request
from flask_cors import CORS
from routes.auth_routes import auth_routes
from routes.project_routes import project_routes
from routes.report_routes import report_routes
from routes.image_proc_routes import image_proc_routes
from routes.text_proc_routes import text_proc_routes
from dotenv import load_dotenv
import os 
load_dotenv()


app = Flask(__name__)
app.config['DEBUG'] = True

app.config['MAX_CONTENT_LENGTH'] = 300 * 1024 * 1024  # ✅ Allow 50MB file uploads


app.secret_key = os.getenv("APP_SECRET")
app.config['STYLE_IMG_FOLDER'] = 'C:/Shoab/PROJECTS/StyleForge/server/static/style'


CORS(app, resources={r"/server/static/*": {"origins": "*"}})
# os.makedirs(app.config['ORG_IMG_FOLDER'], exist_ok=True)

@app.route('/server/static/<string:user_id>/original/<string:filename>')
def get_original_image(user_id, filename):
    path = os.getenv("USER_COMMON_PATH") + user_id + "/" + "original/" 
    return send_from_directory(path, filename, as_attachment=False)

@app.route('/server/static/<string:user_id>/canvas/<string:filename>')
def get_canvas_image(user_id, filename):
    path = os.getenv("USER_COMMON_PATH") + user_id + "/" + "canvas/" 
    return send_from_directory(path, filename, as_attachment=False)

@app.route('/server/static/inter/<string:filename>')
def get_inter_image(filename):
    return send_from_directory(app.config['INTER_IMG_FOLDER'], filename, as_attachment=False)


@app.route('/server/static/<string:user_id>/inter/<string:filename>')
def get_user_inter_image(user_id, filename):
    path = os.getenv("USER_COMMON_PATH") + user_id + "/" + "inter/" 
    return send_from_directory(path,filename, as_attachment=False)


@app.route('/server/static/style/<string:filename>')
def get_style_image(filename):
    return send_from_directory(app.config['STYLE_IMG_FOLDER'], filename, as_attachment=False)



# Register Blueprints
app.register_blueprint(auth_routes)
app.register_blueprint(project_routes)
app.register_blueprint(report_routes)
app.register_blueprint(image_proc_routes)
app.register_blueprint(text_proc_routes)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
