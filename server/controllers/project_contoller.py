from flask import jsonify, request, g
from config.db_config import get_db

db = get_db()
projects_collection = db["Projects"]

def save_project():
    try:
        data = request.get_json()
        user_id = str(g._id)  # Extracted by the middleware
        project_data = data.get("canvasData")
        project_id = str(data.get("canvasId"))
        

        if not project_id or not project_data:
            return jsonify({"success": False, "message": "Invalid project data"}), 400

        # Check if a project with the given project_id already exists
        existing_project = projects_collection.find_one({"project_id": project_id, "user_id": user_id})

        if existing_project:
            # Update the existing project
            projects_collection.update_one(
                {"project_id": project_id, "user_id": user_id},
                {"$set": {"project_data": project_data}}
            )
            response_message = "Project updated successfully"
            status_code = 200
        else:
            # Create a new project
            new_project = {
                "user_id": user_id,
                "project_id": project_id,
                "project_data": project_data
            }
            projects_collection.insert_one(new_project)
            response_message = "Project created successfully"
            status_code = 201

        # Prepare the response
        response = {"user_id": user_id, "project_id": project_id}
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
 