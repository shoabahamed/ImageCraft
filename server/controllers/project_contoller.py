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

load_dotenv()


db = get_db()
projects_collection = db["Projects"]
users_collection = db["Users"]
embedding_collection = db['Embedding']
ORG_IMG_FOLDER = 'C:/Shoab/PROJECTS/StyleForge/server/static/original'
CANVAS_IMG_FOLDER = 'C:/Shoab/PROJECTS/StyleForge/server/static/canvas'



def save_project():
    try:
        # print(f"Request content length: {request.content_length} bytes")
        # print(f"Request headers: {request.headers}")
        # print('hello')
        raw_data = request.get_data()
        # print(f"🔍 Content-Type: {request.content_type}")
        # print(raw_data)
        # print(f"Raw request size: {len(raw_data) / (1024 * 1024)} bytes")
        # # print(request.form["test"])
        # print(f"Received form keys: {list(request.form.keys())}")
        # print(f"Received file keys: {list(request.files.keys())}")

        user_id = str(g._id)  # Extracted by the middleware
  
        # print(request.form.get("username"))
        usename = request.form.get("username")
    
        canvas_id = request.form.get('canvasId')
      
        is_public = request.form.get("isPublic")
        
        canvas_data = request.form.get('canvasData')  # JSON string
        
        canvas_logs = request.form.get('canvasLogs')
        
        original_image_file = request.files.get('originalImage')  # Get the original image file from the form
        canvas_image_file = request.files.get('canvasImage')
        project_name = request.form.get("projectName")
        
        # Retrieve JSON-like data from form fields
        original_image_shape = request.form.get('originalImageShape')
        final_image_shape = request.form.get('finalImageShape')
        image_scale = request.form.get('imageScale')
        rendered_image_shape = request.form.get("renderedImageShape")

        # print(rendered_image_shape)
        # Parse the JSON strings into Python dictionaries (optional)
        original_image_shape = eval(original_image_shape)
        final_image_shape = eval(final_image_shape)
        image_scale = eval(image_scale)
        rendered_image_shape = eval(rendered_image_shape)
        # print(rendered_image_shape)
        # whether loaded from saved
        loaded_from_saved = request.form.get("loadedFromSaved")

        
        
        if not canvas_data or not original_image_file and not canvas_image_file:
            return jsonify({"success": False, "message": "Missing canvas data or image file"}), 400

        try:
            canvas_data = json.loads(canvas_data)  # Convert the string to a JSON object
            canvas_logs = json.loads(canvas_logs)
        except json.JSONDecodeError:
            return jsonify({"success": False, "message": "Invalid canvas data format"}), 400
        
      
        
        # Secure the filename and save it
        image_filename = secure_filename(f"{canvas_id}.png") 
        original_image_path = f"{ORG_IMG_FOLDER}/{image_filename}"
        canvas_image_path = f"{CANVAS_IMG_FOLDER}/{image_filename}"
        
   
        
        #  Update the image URL in canvas JSON
        for obj in canvas_data.get("objects", []):
            if obj.get("type").lower() == "image":
                obj["src"] = os.getenv("BACKEND_SERVER") + "/server/static/original/" + image_filename

     
        # Check if a project with the given project_id already exists
        existing_project = projects_collection.find_one({"project_id": canvas_id, "user_id": user_id})
        if existing_project:
            # Update the existing project
            print("into existing one")
            canvas_image_file.save(canvas_image_path)

            projects_collection.update_one(
                {"project_id": canvas_id, "user_id": user_id}, 
                {"$set": {
                    "project_data": canvas_data,
                    "project_logs": canvas_logs, 
                    "final_image_shape": final_image_shape, 
                    "project_name": project_name,
                    "updated_at": datetime.datetime.utcnow()  # ✅ Update timestamp
                }}
            )
            response_message = "Project updated successfully"
            status_code = 200
            
        else:
            print('sdjf')
            original_image_file.save(original_image_path)
            canvas_image_file.save(canvas_image_path)
            print('sdjf')
            # Create a new project
            new_project = {
                "user_id": user_id,
                "username": usename,
                "project_id": canvas_id,
                "is_public": is_public,
                "project_data": canvas_data,
                "project_logs": canvas_logs,
                "granted_logs": [user_id],
                "original_image_url": os.getenv("BACKEND_SERVER") + "/server/static/original/" + image_filename,
                "canvas_image_url": os.getenv("BACKEND_SERVER") + "/server/static/canvas/"  + image_filename,
                "total_rating": 5,
                "rating_count": 1,
                "total_views": 1,
                "total_bookmark": 0,
                "original_image_shape": original_image_shape,
                "final_image_shape": final_image_shape,
                "rendered_image_shape": rendered_image_shape,
                "image_scale" : image_scale,
                "project_name": project_name,
                "created_at": datetime.datetime.utcnow(),  # ✅ Store creation timestamp
                "updated_at": datetime.datetime.utcnow()   # ✅ Store updated timestamp
                
            }
           


           
            # Open the original image
            # img = Image.open(original_image_file).convert('RGB')
            # img_transfrom = get_similar_image_transform(img_size=(224, 224))
            
            # # load model
            # m = models.vgg16(weights=None)
            # m.load_state_dict(torch.load(CFG.similarity_model_path, map_location=CFG.device, weights_only=True))
            # sim_model = torch.nn.Sequential(*[m.features, m.avgpool, m.classifier[0]])
        
            
            # # getting embedding
            # with torch.no_grad():
            #     img_emb = get_embedding(sim_model, img_transfrom(img)).to('cpu').detach().numpy()


            # project_emb = {
            #     "project_id": canvas_id,
            #     "is_public": is_public,
            #     "embedding": img_emb.tolist()
            # }

            # embedding_collection.insert_one(project_emb)
            projects_collection.insert_one(new_project)
            response_message = "Project created successfully"
            status_code = 201


        # Prepare the response
        response = {"user_id": user_id, "project_id": canvas_id, "project_data": canvas_data}
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
  

def get_all_projects():
  try:

    
    user_id = str(g._id)  # Extracted by the middleware
    
    
    # find current user bookmark info
    user = users_collection.find_one({"_id": ObjectId(user_id)})
  
    bookmarked_projects = user.get('bookmarked')
    

    # Query the database for projects, excluding the `_id` field
    projects_cursor = projects_collection.find({"is_public": "true"}, {
            "_id": 1,
            "user_id": 1,
            "username": 1,
            "project_id": 1,
            "is_public":1,
            "original_image_url": 1,
            "canvas_image_url": 1,
            "total_rating": 1,
            "rating_count": 1,
            "total_views": 1,
            "total_bookmark": 1,
            "updated_at" : 1,
            "created_at": 1,
            "project_name": 1
        })
    
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

        # Delete the project from the collection
        result = projects_collection.delete_one({"project_id": project_id})
        # delete embedding of the project from collection
        result_emb = embedding_collection.delete_one({"project_id": project_id}) 

        
        if result.deleted_count == 0:
            return jsonify({"success": False, "message": "Project not found"}), 404
        
        image_filename = secure_filename(f"{project_id}.png") 
        original_image_path = f"{ORG_IMG_FOLDER}/{image_filename}"
        canvas_image_path = f"{CANVAS_IMG_FOLDER}/{image_filename}"

        for path in [original_image_path, canvas_image_path]:
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

        if not project_id:
            return jsonify({'message': 'Project Id missing'}), 400
        
        
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
