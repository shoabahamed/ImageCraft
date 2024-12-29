from flask import jsonify, request, g
import os 
from config.db_config import get_db
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import json

db = get_db()
projects_collection = db["Projects"]
UPLOAD_FOLDER = 'C:/Shoab/PROJECTS/StyleForge/static/uploads'



def save_project():
    try:
        user_id = str(g._id)  # Extracted by the middleware
        canvas_id = request.form.get('canvasId')
        canvas_data = request.form.get('canvasData')  # JSON string
        image_file = request.files.get('image')  # Get the image file from the form

        
        if not canvas_data or not image_file:
            return jsonify({"success": False, "message": "Missing canvas data or image file"}), 400
        
                # Parse the canvas_data (JSON string) to a Python dictionary
        try:
            canvas_data = json.loads(canvas_data)  # Convert the string to a JSON object
        except json.JSONDecodeError:
            return jsonify({"success": False, "message": "Invalid canvas data format"}), 400
        
        
        # Secure the filename and save it
        image_filename = secure_filename(f"{canvas_id}.png") 
        image_path = f"{UPLOAD_FOLDER}/{image_filename}"
        
        image_file.save(image_path)
        
        #  Update the image URL in canvas JSON
        for obj in canvas_data.get("objects", []):
            if obj.get("type").lower() == "image":
                obj["src"] = image_path


        # Check if a project with the given project_id already exists
        existing_project = projects_collection.find_one({"project_id": canvas_id, "user_id": user_id})
        if existing_project:
            # Update the existing project
            projects_collection.update_one(
                {"project_id": canvas_id, "user_id": user_id}, 
                {"$set": {"project_data": canvas_data}}
            )
            response_message = "Project updated successfully"
            status_code = 200
        else:
            # Create a new project
            new_project = {
                "user_id": user_id,
                "project_id": canvas_id,
                "project_data": canvas_data,
                "image_url": image_path
            }
            projects_collection.insert_one(new_project)
            response_message = "Project created successfully"
            status_code = 201

        # Prepare the response
        response = {"user_id": user_id, "project_id": canvas_id}
        return jsonify({"success": True, "message": response_message, "data": response}), status_code

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

def get_projects():
  try:

    # data = request.get_json()
    
    user_id = str(g._id)  # Extracted by the middleware

    # Query the database for projects, excluding the `_id` field
    projects_cursor = projects_collection.find({"user_id": user_id})
    
    # Convert the cursor to a list of dictionaries
    projects = list(projects_cursor)
    
    # Convert the MongoDB ObjectId to string for JSON serialization
    for project in projects:
        project["_id"] = str(project["_id"])  # MongoDB ObjectId needs to be converted to string


    response = {"projects": projects}
    print(len(projects))
    return jsonify({"success": True, "message": "Projects retrieved successfully", "data": response}), 201
  
  except Exception as e:
    return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
 