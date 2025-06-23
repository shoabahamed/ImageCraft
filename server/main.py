from flask import Flask, send_from_directory, request
from flask_cors import CORS
from routes.auth_routes import auth_routes
from routes.project_routes import project_routes
from routes.report_routes import report_routes
from routes.image_proc_routes import image_proc_routes
from routes.text_proc_routes import text_proc_routes
from dotenv import load_dotenv
import os 
import cloudinary

load_dotenv()



app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 300 * 1024 * 1024  # ✅ Allow 50MB file uploads


# app.secret_key = os.getenv("APP_SECRET")


cloudinary.config( 
    cloud_name = "dx9gej2lc", 
    api_key = "988347957788346", 
    api_secret = os.getenv("CLOUDNARY_API_SECRET_KEY"),
    secure=True
)


# sets the cors policy for the files in the static folder
# CORS(app, resources={r"/server/static/*": {"origins": "*"}})
CORS(app, resources={
    r"/server/static/*": {"origins": "*"},  # Open CORS for static files
    r"/*": {"origins": [os.getenv("FRONTEND_SERVER", "https://pixeltune-theta.vercel.app")]}  # Restrict all other routes (e.g., /api/*)
}, supports_credentials=True)


@app.route('/')
def index():
    return "<h1>Hello World</h1>"


# gets the original image from the static folder
@app.route('/server/static/<string:user_id>/original/<string:filename>')
def get_original_image(user_id, filename):
    path = os.getenv("USER_COMMON_PATH") + user_id + "/" + "original/" 
    return send_from_directory(path, filename, as_attachment=False)

# gets the canvas image from the static folder
@app.route('/server/static/<string:user_id>/canvas/<string:filename>')
def get_canvas_image(user_id, filename):
    path = os.getenv("USER_COMMON_PATH") + user_id + "/" + "canvas/" 
    return send_from_directory(path, filename, as_attachment=False)

# gets the intermediate image from the static folder
@app.route('/server/static/inter/<string:filename>')
def get_inter_image(filename):
    return send_from_directory(app.config['INTER_IMG_FOLDER'], filename, as_attachment=False)

# gets the intermediate image from the static folder
@app.route('/server/static/<string:user_id>/inter/<string:filename>')
def get_user_inter_image(user_id, filename):
    path = os.getenv("USER_COMMON_PATH") + user_id + "/" + "inter/" 
    return send_from_directory(path,filename, as_attachment=False)

# gets the style image from the static folder
@app.route('/server/static/style/<string:filename>')
def get_style_image(filename):
    path = os.getenv("USER_COMMON_PATH") + "style/" 
    return send_from_directory(path, filename, as_attachment=False)

# gets the general image from the static folder
@app.route('/api/server/static/general/<string:filename>')
def get_general_image(filename):
    path = os.getenv("USER_COMMON_PATH") + "general/" 
    return send_from_directory(path, filename, as_attachment=False)

# gets the profile image from the static folder
@app.route('/server/static/<string:user_id>/<string:filename>')
def get_profile_image(user_id, filename):
    path = os.getenv("USER_COMMON_PATH") + user_id + "/" 
    return send_from_directory(path,filename, as_attachment=False)



# Register Blueprints for the routes
app.register_blueprint(auth_routes)
app.register_blueprint(project_routes)
app.register_blueprint(report_routes)
app.register_blueprint(image_proc_routes)
app.register_blueprint(text_proc_routes)

# runs the server on port 5000
if __name__ == "__main__":
    if(os.getenv("DEPLOY_PRODUCTION").lower() == 'true'):
        print("launching server in production mode")
        app.run(debug=False)
    else:
        print("launching server in development mode")
        app.run(debug=True, port=5000)
