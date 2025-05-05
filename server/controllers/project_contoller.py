from flask import jsonify, request, g
import os 
from config.db_config import get_db
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import json
from dotenv import load_dotenv
from bson import ObjectId
from PIL import Image
from models.similarity_model import  get_embedding
from torchvision import models
import torch
from model_config import CFG
from utils.preprocessing import  get_similar_image_transform
import datetime
from utils.common import get_user_paths
from cloudinary.uploader import upload

load_dotenv()


db = get_db()
projects_collection = db["Projects"]
users_collection = db["Users"]
embedding_collection = db['Embedding']
ORG_IMG_FOLDER = 'C:/Shoab/PROJECTS/StyleForge/server/static/original'
INTER_IMG_FOLDER = 'C:/Shoab/PROJECTS/StyleForge/server/static/inter'
CANVAS_IMG_FOLDER = 'C:/Shoab/PROJECTS/StyleForge/server/static/canvas'




def save_project():
    try:

        user_id = str(g._id)  # Extracted by the middleware
        print(request.files)     
        
        usename = request.form.get("username")
        canvas_id = request.form.get('canvasId')
      
        is_public = request.form.get("isPublic")
        
        canvas_data = request.form.get('canvasData')
        
        
        canvas_logs = request.form.get('canvasLogs')
        
        original_image_file = request.files.get('originalImage') 
        canvas_image_file = request.files.get('canvasImage')
        inter_image_file = request.files.get("interImage")
        project_name = request.form.get("projectName")
        
        # Retrieve JSON-like data from form fields
        original_image_shape = request.form.get('originalImageShape')
        final_image_shape = request.form.get('finalImageShape')
        download_image_shape = request.form.get('downloadImageShape')
        filter_names = request.form.get("filterNames")
        all_filters_applied = request.form.get('allFiltersApplied')

        filter_names = eval(filter_names)
        all_filters_applied = eval(all_filters_applied)

        # Parse the JSON strings into Python dictionaries (optional)
        original_image_shape = eval(original_image_shape)
        final_image_shape = eval(final_image_shape)
        download_image_shape = eval(download_image_shape)
 

        # whether loaded from saved
        loaded_from_saved = request.form.get("loadedFromSaved")
        
        if not canvas_data or not original_image_file and not canvas_image_file:
            return jsonify({"success": False, "message": "Missing canvas data or image file"}), 400
  
        try:
            canvas_data = json.loads(canvas_data)  # Convert the string to a JSON object
            canvas_logs = json.loads(canvas_logs)
        except json.JSONDecodeError:
            return jsonify({"success": False, "message": "Invalid canvas data format"}), 400
        
        print("after converting string to json")
        
        # Secure the filename and save it
        image_filename = secure_filename(f"{canvas_id}.png") 

     
        # Check if a project with the given project_id already exists
        existing_project = projects_collection.find_one({"project_id": canvas_id, "user_id": user_id})

        if existing_project:
            if(os.getenv("DEPOLY_PRODUCTION").lower() == 'true'):
                # we are in production mode and have to save everything online in cloudnary and mongodb
                _, ORG_IMG_FOLDER,CANVAS_IMG_FOLDER, INTER_IMG_FOLDER=  get_user_paths("", user_id)
                original_image_path = f"{ORG_IMG_FOLDER}/{image_filename}"
                inter_image_path = f"{INTER_IMG_FOLDER}/{image_filename}"
                canvas_image_path = f"{CANVAS_IMG_FOLDER}/{image_filename}"

                cloud_inter_result = upload(
                    inter_image_file,
                    public_id=inter_image_path,  # This sets the folder and filename
                    overwrite=True  # Optional: allows overwriting if file with same ID exists
                )

                cloud_canvas_result = upload(
                    canvas_image_file,
                    public_id=canvas_image_path, # This sets the folder and filename
                    overwrite=True  # Optional: allows overwriting if file with same ID exists
                )

                
                #  Update the image URL in canvas JSON
                for obj in canvas_data.get("objects", []):
                    if obj.get("type").lower() == "image":
                        obj["src"] = cloud_inter_result['secure_url']

                projects_collection.update_one(
                    {"project_id": canvas_id, "user_id": user_id}, 
                    {"$set": {
                        "project_data": canvas_data,
                        "project_logs": canvas_logs, 
                        "final_image_shape": final_image_shape, 
                        "download_image_shape": download_image_shape,
                        "filter_names": filter_names,
                        "all_filters_applied": all_filters_applied,
                        "project_name": project_name,
                        "updated_at": datetime.datetime.utcnow()  # ✅ Update timestamp
                    }}
                )
                response_message = "Project updated successfully"
                status_code = 200


            else:
                _, ORG_IMG_FOLDER,CANVAS_IMG_FOLDER, INTER_IMG_FOLDER=  get_user_paths(os.getenv("USER_COMMON_PATH"), user_id)
                original_image_path = f"{ORG_IMG_FOLDER}/{image_filename}"
                inter_image_path = f"{INTER_IMG_FOLDER}/{image_filename}"
                canvas_image_path = f"{CANVAS_IMG_FOLDER}/{image_filename}"

                # Update the existing project
                inter_image_file.save(inter_image_path)
                canvas_image_file.save(canvas_image_path)

                #  Update the image URL in canvas JSON
                for obj in canvas_data.get("objects", []):
                    if obj.get("type").lower() == "image":
                        obj["src"] = os.getenv("BACKEND_SERVER") + "/server/static/" + user_id +  "/inter/" + image_filename

                projects_collection.update_one(
                    {"project_id": canvas_id, "user_id": user_id}, 
                    {"$set": {
                        "project_data": canvas_data,
                        "project_logs": canvas_logs, 
                        "final_image_shape": final_image_shape, 
                        "download_image_shape": download_image_shape,
                        "filter_names": filter_names,
                        "all_filters_applied": all_filters_applied,
                        "project_name": project_name,
                        "updated_at": datetime.datetime.utcnow()  # ✅ Update timestamp
                    }}
                )
                response_message = "Project updated successfully"
                status_code = 200
                
        else:
            if(os.getenv("DEPOLY_PRODUCTION").lower() == 'true'):
                # we are in production mode and have to save everything online in cloudnary and mongodb
                _, ORG_IMG_FOLDER,CANVAS_IMG_FOLDER, INTER_IMG_FOLDER=  get_user_paths("", user_id)
                original_image_path = f"{ORG_IMG_FOLDER}/{image_filename}"
                inter_image_path = f"{INTER_IMG_FOLDER}/{image_filename}"
                canvas_image_path = f"{CANVAS_IMG_FOLDER}/{image_filename}"

                cloud_org_result = upload(
                    original_image_file,
                    public_id=original_image_path,  # This sets the folder and filename
                    overwrite=True  # Optional: allows overwriting if file with same ID exists
                )

                cloud_inter_result = upload(
                    inter_image_file,
                    public_id=inter_image_path,  # This sets the folder and filename
                    overwrite=True  # Optional: allows overwriting if file with same ID exists
                )

                cloud_canvas_result = upload(
                    canvas_image_file,
                    public_id=canvas_image_path,  # This sets the folder and filename
                    overwrite=True  # Optional: allows overwriting if file with same ID exists
                )

                #  Update the image URL in canvas JSON
                for obj in canvas_data.get("objects", []):
                    if obj.get("type").lower() == "image":
                        obj["src"] = cloud_inter_result['secure_url']

                new_project = {
                    "user_id": user_id,
                    "username": usename,
                    "project_id": canvas_id,
                    "is_public": is_public,
                    "project_data": canvas_data,
                    "project_logs": canvas_logs,
                    "granted_logs": [user_id],
                    "original_image_url": cloud_org_result["secure_url"],
                    "canvas_image_url": cloud_canvas_result["secure_url"],
                    "total_rating": 5,
                    "rating_count": 1,
                    "total_views": 1,
                    "total_bookmark": 0,
                    "original_image_shape": original_image_shape,
                    "final_image_shape": final_image_shape,
                    "download_image_shape": download_image_shape,
                    "filter_names": filter_names,
                    "all_filters_applied": all_filters_applied,
                    "project_name": project_name,
                    "created_at": datetime.datetime.utcnow(),  # ✅ Store creation timestamp
                    "updated_at": datetime.datetime.utcnow()   # ✅ Store updated timestamp
                    
                }
            else:

                _, ORG_IMG_FOLDER,CANVAS_IMG_FOLDER, INTER_IMG_FOLDER=  get_user_paths(os.getenv("USER_COMMON_PATH"), user_id)
                original_image_path = f"{ORG_IMG_FOLDER}/{image_filename}"
                inter_image_path = f"{INTER_IMG_FOLDER}/{image_filename}"
                canvas_image_path = f"{CANVAS_IMG_FOLDER}/{image_filename}"


                #  Update the image URL in canvas JSON
                for obj in canvas_data.get("objects", []):
                    if obj.get("type").lower() == "image":
                        obj["src"] = os.getenv("BACKEND_SERVER") + "/server/static/" + user_id +  "/inter/" + image_filename

                original_image_file.save(original_image_path)
                inter_image_file.save(inter_image_path)
                canvas_image_file.save(canvas_image_path)
                        # Create a new project
                new_project = {
                    "user_id": user_id,
                    "username": usename,
                    "project_id": canvas_id,
                    "is_public": is_public,
                    "project_data": canvas_data,
                    "project_logs": canvas_logs,
                    "granted_logs": [user_id],
                    "original_image_url": os.getenv("BACKEND_SERVER") + "/server/static/" + user_id + "/original/" + image_filename,
                    "canvas_image_url": os.getenv("BACKEND_SERVER") + "/server/static/" + user_id + "/canvas/" + image_filename,
                    "total_rating": 5,
                    "rating_count": 1,
                    "total_views": 1,
                    "total_bookmark": 0,
                    "original_image_shape": original_image_shape,
                    "final_image_shape": final_image_shape,
                    "download_image_shape": download_image_shape,
                    "filter_names": filter_names,
                    "all_filters_applied": all_filters_applied,
                    "project_name": project_name,
                    "created_at": datetime.datetime.utcnow(),  # ✅ Store creation timestamp
                    "updated_at": datetime.datetime.utcnow()   # ✅ Store updated timestamp
                    
                }
        
          

            projects_collection.insert_one(new_project)
            response_message = "Project created successfully"
            status_code = 201


        # Prepare the response
        response = {"user_id": user_id, "project_id": canvas_id, "project_data": canvas_data}
        return jsonify({"success": True, "message": response_message, "data": response}), status_code

    except Exception as e:

        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500



# def save_project():
#     try:

#         user_id = str(g._id)  # Extracted by the middleware
#         print(request.files)     
        
#         usename = request.form.get("username")
#         canvas_id = request.form.get('canvasId')
      
#         is_public = request.form.get("isPublic")
        
#         canvas_data = request.form.get('canvasData')
        
        
#         canvas_logs = request.form.get('canvasLogs')
        
#         original_image_file = request.files.get('originalImage') 
#         canvas_image_file = request.files.get('canvasImage')
#         inter_image_file = request.files.get("interImage")
#         project_name = request.form.get("projectName")
        
#         # Retrieve JSON-like data from form fields
#         original_image_shape = request.form.get('originalImageShape')
#         final_image_shape = request.form.get('finalImageShape')
#         download_image_shape = request.form.get('downloadImageShape')
#         filter_names = request.form.get("filterNames")

#         filter_names = eval(filter_names)

#         # Parse the JSON strings into Python dictionaries (optional)
#         original_image_shape = eval(original_image_shape)
#         final_image_shape = eval(final_image_shape)
#         download_image_shape = eval(download_image_shape)
 

#         # whether loaded from saved
#         loaded_from_saved = request.form.get("loadedFromSaved")
        
#         if not canvas_data or not original_image_file and not canvas_image_file:
#             return jsonify({"success": False, "message": "Missing canvas data or image file"}), 400
  
#         try:
#             canvas_data = json.loads(canvas_data)  # Convert the string to a JSON object
#             canvas_logs = json.loads(canvas_logs)
#         except json.JSONDecodeError:
#             return jsonify({"success": False, "message": "Invalid canvas data format"}), 400
        
#         print("after converting string to json")
        
#         # Secure the filename and save it
#         image_filename = secure_filename(f"{canvas_id}.png") 
#         _, ORG_IMG_FOLDER,CANVAS_IMG_FOLDER, INTER_IMG_FOLDER=  get_user_paths(os.getenv("USER_COMMON_PATH"), user_id)
#         original_image_path = f"{ORG_IMG_FOLDER}/{image_filename}"
#         inter_image_path = f"{INTER_IMG_FOLDER}/{image_filename}"
#         canvas_image_path = f"{CANVAS_IMG_FOLDER}/{image_filename}"

        

#         #  Update the image URL in canvas JSON
#         for obj in canvas_data.get("objects", []):
#             if obj.get("type").lower() == "image":
#                 obj["src"] = os.getenv("BACKEND_SERVER") + "/server/static/" + user_id +  "/inter/" + image_filename

     
#         # Check if a project with the given project_id already exists
#         existing_project = projects_collection.find_one({"project_id": canvas_id, "user_id": user_id})

#         if existing_project:
#             # Update the existing project
#             inter_image_file.save(inter_image_path)
#             canvas_image_file.save(canvas_image_path)

#             projects_collection.update_one(
#                 {"project_id": canvas_id, "user_id": user_id}, 
#                 {"$set": {
#                     "project_data": canvas_data,
#                     "project_logs": canvas_logs, 
#                     "final_image_shape": final_image_shape, 
#                     "download_image_shape": download_image_shape,
#                     "filter_names": filter_names,
#                     "project_name": project_name,
#                     "updated_at": datetime.datetime.utcnow()  # ✅ Update timestamp
#                 }}
#             )
#             response_message = "Project updated successfully"
#             status_code = 200
            
#         else:
#             original_image_file.save(original_image_path)
#             inter_image_file.save(inter_image_path)
#             canvas_image_file.save(canvas_image_path)
          
#             # Create a new project
#             new_project = {
#                 "user_id": user_id,
#                 "username": usename,
#                 "project_id": canvas_id,
#                 "is_public": is_public,
#                 "project_data": canvas_data,
#                 "project_logs": canvas_logs,
#                 "granted_logs": [user_id],
#                 "original_image_url": os.getenv("BACKEND_SERVER") + "/server/static/" + user_id + "/original/" + image_filename,
#                 "canvas_image_url": os.getenv("BACKEND_SERVER") + "/server/static/" + user_id + "/canvas/" + image_filename,
#                 "total_rating": 5,
#                 "rating_count": 1,
#                 "total_views": 1,
#                 "total_bookmark": 0,
#                 "original_image_shape": original_image_shape,
#                 "final_image_shape": final_image_shape,
#                 "download_image_shape": download_image_shape,
#                 "filter_names": filter_names,
#                 "project_name": project_name,
#                 "created_at": datetime.datetime.utcnow(),  # ✅ Store creation timestamp
#                 "updated_at": datetime.datetime.utcnow()   # ✅ Store updated timestamp
                
#             }
        
#             projects_collection.insert_one(new_project)
#             response_message = "Project created successfully"
#             status_code = 201


#         # Prepare the response
#         response = {"user_id": user_id, "project_id": canvas_id, "project_data": canvas_data}
#         return jsonify({"success": True, "message": response_message, "data": response}), status_code

#     except Exception as e:

#         return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500


def get_projects(user_id):
  try:

    current_user_id = g._id

    if(current_user_id == user_id):
        # Query the database for projects, excluding the `_id` field
        projects_cursor = projects_collection.find({"user_id": user_id})
    else:
        projects_cursor = projects_collection.find({"user_id": user_id}, {'project_data':0, 'project_logs':0, 'granted_logs':0, 'original_image_shape':0, 'final_image_shape': 0})
    
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
  

def get_bookmark_projects(user_id):
  try:
 
    current_user_id = g._id
    
    if(current_user_id == user_id):
        user_object_id = ObjectId(user_id)
        
        user = users_collection.find_one({"_id": user_object_id})
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Extract bookmarks from user data
        # If bookmarks don't exist, return an empty list
        bookmarks = user.get('bookmarked', [])
        

        if bookmarks:
            # Convert project_ids in bookmarks to ObjectId
            project_ids = [project_id for project_id in bookmarks]

            # Find all bookmarked projects
            projects_cursor = projects_collection.find({"project_id": {"$in": project_ids}})
                    

            # Convert the cursor to a list of dictionaries
            projects = list(projects_cursor)

            # Convert the MongoDB ObjectId to string for JSON serialization
            for project in projects:
                project["_id"] = str(project["_id"])  # MongoDB ObjectId needs to be converted to string
                project['bookmarked'] = True
                project["total_rating"] = int(project['total_rating'])
                project['rating_count'] = int(project['rating_count'])
                project['project_logs'] = []

        else:
            projects = []
    else:
        projects = []
    
    response = {"projects": projects}

    return jsonify({"success": True, "message": "Bookmarked Projects retrieved successfully", "data": response}), 201
  
  except Exception as e:
    return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
  

def get_all_projects():
  try:

    
    user_id = str(g._id)  # Extracted by the middleware
    
    
    # find current user bookmark info
    user = users_collection.find_one({"_id": ObjectId(user_id)})
  
    bookmarked_projects = user.get('bookmarked')
    

    # Query the database for projects, excluding the `_id` field
    projects_cursor = projects_collection.find({"is_public": "true"})
    
    # Convert the cursor to a list of dictionaries
    projects = list(projects_cursor)
    
    # Convert the MongoDB ObjectId to string for JSON serialization
    for project in projects:
        project["_id"] = str(project["_id"])  # MongoDB ObjectId needs to be converted to string
        if bookmarked_projects and project['project_id'] in bookmarked_projects:
            project['bookmarked'] = True
        else:
            project['bookmarked'] = False

        project["total_rating"] = int(project['total_rating'])
        project['rating_count'] = int(project['rating_count'])

        project['project_logs'] = []




    response = {"projects": projects}
    
    return jsonify({"success": True, "message": "Projects retrieved successfully", "data": response}), 201
  
  except Exception as e:
    return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
  


def get_project_by_id(project_id):
    # Fetch project by project_id from the database
    project = projects_collection.find_one({"project_id": project_id})
    
    if not project:
        return jsonify({"message": "Project not found"}), 404

    # Assuming the Project model has these fields: original_image_url, canvas_image_url
    return jsonify({
        "original_image_url": project["original_image_url"],
        "canvas_image_url": project["canvas_image_url"],
        "project_data": project['project_data'],
        "project_logs": project['project_logs'],
    })


def delete_project(project_id):
    try:
        # Validate the report_id
        if not  project_id:
            return jsonify({"success": False, "message": "Invalid report ID"}), 400
        
        user_id = str(g._id)  # Extracted by the middleware

        # Delete the project from the collection
        result = projects_collection.delete_one({"project_id": project_id})
        # delete embedding of the project from collection
        # result_emb = embedding_collection.delete_one({"project_id": project_id}) 

        
        if result.deleted_count == 0:
            return jsonify({"success": False, "message": "Project not found"}), 404
        
        image_filename = secure_filename(f"{project_id}.png") 
        
        _, ORG_IMG_FOLDER,CANVAS_IMG_FOLDER, INTER_IMG_FOLDER=  get_user_paths(os.getenv("USER_COMMON_PATH"), user_id)
        original_image_path = f"{ORG_IMG_FOLDER}/{image_filename}"
        inter_image_path = f"{INTER_IMG_FOLDER}/{image_filename}"
        canvas_image_path = f"{CANVAS_IMG_FOLDER}/{image_filename}"

        for path in [original_image_path, canvas_image_path, inter_image_path]:
            if os.path.exists(path):
                os.remove(path)

        return jsonify({"success": True, "message": "Project deleted successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
 

def update_project_visibility():
    try:
        # Extract data from request
        data = request.get_json()
        project_id = data.get("projectId")
        is_public = data.get("isPublic")  # Boolean: True for public, False for private

        if is_public:
            is_public = "true"
        else:
            is_public = "false"
        
        
        
        # Validate input
        if not project_id or is_public is None:
            return jsonify({"success": False, "message": "Invalid data"}), 400


        # Update the project's visibility
        result = projects_collection.update_one(
            {"project_id": project_id},
            {"$set": {"is_public": is_public}}
        )
        
        # # update in embedding collection
        # em_result = embedding_collection.update_one(
        #     {"project_id": project_id},
        #     {"$set": {"is_public": is_public}}
        # )

        # Check if the update was successful
        if result.modified_count == 1:
            visibility = "public" if is_public == "true" else "private"
            return jsonify({"success": True, "message": f"Project made {visibility}"}), 200
        else:
            return jsonify({"success": False, "message": "Project not found or already in the desired state"}), 404

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    


def update_project_bookmark():
    try:
        # Extract data from request
        user_id = str(g._id)
        data = request.get_json()
        project_id = data.get("project_id")
        bookmark = data.get("bookmark") 



       
        # Validate input
        if not project_id or bookmark is None:
            return jsonify({"success": False, "message": "Invalid data"}), 400

        
        # updating bookmarks of a user
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        bookmarked_projects = set(user['bookmarked'])

        # get the the project
        project = projects_collection.find_one({"project_id": project_id})
        
        print("dsjf")
        # get current bookmark count
        current_bookmark_count = int(project.get("total_bookmark", 1))

        if(bookmark):
            bookmarked_projects = bookmarked_projects.union({project_id})
            current_bookmark_count += 1
        else:
            bookmarked_projects = bookmarked_projects.difference({project_id})
            current_bookmark_count -= 1

        print("dkfj")
        
        # Update the project's bookmark count
        result_project = projects_collection.update_one(
            {"project_id": project_id},
            {"$set": {"total_bookmark": current_bookmark_count}}
        )
        
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
            "$set": {
                "bookmarked": list(bookmarked_projects)
            }
            }
        )




        if result.modified_count == 1:
            return jsonify({"success": True, "message": f"Bookmark Updated"}), 200
        else:
            return jsonify({"success": False, "message": "Project not found or already in the desired state"}), 404

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    


def rate_project():
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        rating = data.get('rating')

        if not project_id or not rating:
            return jsonify({'message': 'Missing required fields'}), 400
        
        
        # Fetch project by project_id from the database
        project = projects_collection.find_one({"project_id": project_id})

        
        total_rating = int(project.get("total_rating", 0)) + rating
        rating_count = int(project.get("rating_count", 1)) + 1
        
 
       
        # Update the project's visibility
        result = projects_collection.update_one(
            {"project_id": project_id},
            {"$set": {"total_rating": str(total_rating), "rating_count": str(rating_count)}}
        )


        if result.modified_count == 1:
            return jsonify({"success": True, "message": f"Rating Successfull"}), 200
        else:
            return jsonify({"success": False, "message": "Rating Unsucessfull"}), 404

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500



def update_project_view_count():
    try:
        data = request.get_json()
        project_id = data.get('project_id')
        project_user_id = data.get('project_user_id')
        user_id = str(g._id) 

        if not project_id:
            return jsonify({'message': 'Project Id missing'}), 400
        
        if project_user_id == user_id:
            return jsonify({"success": True, "message": f"View Count not updated"}), 200
        else:
                
            # Fetch project by project_id from the database
            project = projects_collection.find_one({"project_id": project_id})

            
            total_rating = int(project.get("total_views", 0)) + 1
            
    
        
            # Update the project's visibility
            result = projects_collection.update_one(
                {"project_id": project_id},
                {"$set": {"total_views": str(total_rating)}}
            )


            if result.modified_count == 1:
                return jsonify({"success": True, "message": f"View Count Updated"}), 200
            else:
                return jsonify({"success": False, "message": "View Count Update Unsucessfull"}), 404

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
