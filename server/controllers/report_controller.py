from flask import jsonify, request, g
from bson import ObjectId
from config.db_config import get_db
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import datetime
import os 
from utils.common import get_user_paths, create_user_paths
import shutil

load_dotenv()

db = get_db()
reports_collection = db["Reports"]
projects_collection = db['Projects']
users_collection = db["Users"]
notice_collection = db['Notices']
style_image_collection = db['StyleImage']
STYLE_IMG_FOLDER = 'C:/Shoab/PROJECTS/StyleForge/server/static/style'

# TODO: send notices to the user whole projects logs has been granted or delete or when an report has been deleted. Or what if admin has granted logs but now want to revoke it
# TODO: also I may need to recover a resolve report
def submit_report():
    try:
        data = request.get_json()
        user_id = str(g._id)  # Extracted by the middleware
        project_id = data['project_id']
        project_user_id = data['project_user_id']
        title = data['title']
        description = data['description']
        reporter_name = data['reporter_name']

        if not user_id or not project_id or not project_user_id or not title or not description or not reporter_name:
            return jsonify({"success": False, "message": "Missing report data"}), 400

        # Check if a report already exists for the same project_id and reporter_user_id
        existing_report = reports_collection.find_one({
            "project_id": project_id,
            "reporter_user_id": user_id
        })
        
        # Get the project username for the reported project
        reported_project = projects_collection.find_one({'project_id': project_id}, {'_id': 0, 'username': 1})
        project_user_name = reported_project['username']

        # Create or update the report document
        report_document = {
            "reporter_user_id": user_id,
            "reporter_name": reporter_name,
            "project_id": project_id,
            "project_user_id": project_user_id,
            "project_user_name": project_user_name,
            "title": title,
            "description": description,
            "status": "pending",
            "has_admin_response": "false",
            "admin_response": {
                "granted_log": None,
                "title": None,
                "message": None,
                "project_data": None,
                "logs": None,
                "original_image_url": None,
                "canvas_image_url": None,
            },
            "created_at": datetime.datetime.utcnow(),
        }

        if existing_report:
            # Update the existing report
            reports_collection.update_one(
                {"_id": existing_report["_id"]},
                {"$set": report_document}
            )
            response_message = "Report updated successfully"
            status_code = 200
        else:
            # Insert a new report
            reports_collection.insert_one(report_document)
            response_message = "Report submitted successfully"
            status_code = 201

        return jsonify({"success": True, "message": response_message}), status_code

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500



def get_all_reports():
    try:
        reports = list(reports_collection.find())
        
        formatted_reports = [
            {
                "id": str(report["_id"]),
                "reporter_name": str(report['reporter_name']),
                "reporter_user_id": report["reporter_user_id"],
                "project_id": report["project_id"],
                "project_user_name": report['project_user_name'],
                "project_user_id": report["project_user_id"],
                "title": report["title"],
                "description": report["description"],
                "status": report["status"],
                "has_admin_response": report['has_admin_response'],
                "created_at": report["created_at"],
                "admin_response": report['admin_response']
            }
            for report in reports
        ]
        return jsonify({"success": True, "data": formatted_reports}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500


def resolve_report():
    data = request.get_json()
    report_id = data['report_id']
    try:
        # Validate the report_id
        if not ObjectId.is_valid(report_id):
            return jsonify({"success": False, "message": "Invalid report ID"}), 400

        # Update the report's status to "resolved"
        result = reports_collection.update_one(
            {"_id": ObjectId(report_id)}, {"$set": {"status": "resolved"}}
        )

        if result.matched_count == 0:
            return jsonify({"success": False, "message": "Report not found"}), 404

        return jsonify({"success": True, "message": "Report marked as resolved"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    

def delete_report(report_id):
    try:
        # Validate the report_id
        if not ObjectId.is_valid(report_id):
            return jsonify({"success": False, "message": "Invalid report ID"}), 400

        # Delete the report from the collection
        result = reports_collection.delete_one({"_id": ObjectId(report_id)})

        if result.deleted_count == 0:
            return jsonify({"success": False, "message": "Report not found"}), 404

        return jsonify({"success": True, "message": "Report deleted successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    
def grant_logs():
    
    try:
        data = request.get_json()  # To fetch additional info if needed
        report_id = data['reportId']
        

        # Fetch the report
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        
        if not report:
            return jsonify({"success": False, "message": "Report not found"}), 404

        
        # Fetch project details from the project_id in the report
        project = projects_collection.find_one({"project_id": report["project_id"]})
        
        if not project:
            return jsonify({"success": False, "message": "Project not found"}), 404
        
        # Update the admin response with project details and admin message
        updated_admin_response = {
            "granted_log": True,  # Indicating logs were granted
            "title": "Logs Granted",
            "message": "",
            "data": project['project_data'],
            "logs": project['project_logs'],  # Assuming the project has a `logs_url` field
            "original_image_url": project["original_image_url"],
            "canvas_image_url": project["canvas_image_url"],
        }

        # Update the report's admin response and status
        result = reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {
                "$set": {
                    "admin_response": updated_admin_response,
                    "has_admin_response": "true"
                }
            }
        )


        # update granted logs in proeject
        
        reporter_user_id = report['reporter_user_id']
        granted_logs = set(project['granted_logs'])
        granted_logs.add(reporter_user_id)
        granted_logs = list(granted_logs)
       
        
        project_result = projects_collection.update_one(
            {"project_id": project['project_id']},
            {
            "$set": {
                "granted_logs": granted_logs
            }
            }
        )

        if result.matched_count == 0 or project_result.matched_count == 0:
            return jsonify({"success": False, "message": "Failed to update the report"}), 500

        return jsonify({"success": True, "message": "Logs granted and report updated successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500



def get_user_reports(user_id):
    current_user_id = str(g._id)  # Extract the user ID from the middleware context
    try:
        if current_user_id == user_id: 
           # Fetch reports where reporter_cuser_id matches the current user ID
            reports = list(reports_collection.find({"reporter_user_id": user_id}))

            # Format the reports for the response
            formatted_reports = [
                {
                    "id": str(report["_id"]),
                    "reporter_user_id": report["reporter_user_id"],
                    "project_id": report["project_id"],
                    "project_user_id": report["project_user_id"],
                    "title": report["title"],
                    "description": report["description"],
                    "status": report["status"],
                    "has_admin_response": report['has_admin_response'],
                    "created_at": report["created_at"],
                    "admin_response": report.get("admin_response", None),  # Include admin response
                }
                for report in reports
            ]

            return jsonify({"success": True, "data": formatted_reports}), 200
        else:
            return jsonify({"success": True, "data": []}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500
    

def delete_report_project():
    data = request.get_json()  # Parse the JSON body
    project_id = data['projectId']
    report_id = data['reportId']
    try:
        # Fetch the report
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        
        
        if not report:
            return jsonify({"success": False, "message": "Report not found"}), 404
        
        # Update the admin response with project details and admin message
        updated_admin_response = {
            "granted_log": False,  # Indicating logs were granted
            "title": "Project Deleted",
            "message": "As per you request the project has been deleted",
            "logs": None,  # Assuming the project has a `logs_url` field
            "original_image_url": None,
            "canvas_image_url": None,
        }

        # Update the report's admin response and status
        result = reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {
                "$set": {
                    "admin_response": updated_admin_response,
                    "has_admin_response": "true"
                }
            }
        )

        if result.matched_count == 0:
            return jsonify({"success": False, "message": "Failed to update the report"}), 500



        # Delete the report from the collection
        result = projects_collection.delete_one({"project_id": project_id})

        if result.deleted_count == 0:
            return jsonify({"success": False, "message": "Project not found"}), 404

        return jsonify({"success": True, "message": "Project deleted successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred:"}), 500



def send_message():
    try:
        data = request.get_json()
        report_id = data['reportId']
        title = data['title']
        message = data['message']
        
        # Fetch the report
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        
        if not report:
            return jsonify({"success": False, "message": "Report not found"}), 404

        
        # Fetch project details from the project_id in the report
        project = projects_collection.find_one({"project_id": report["project_id"]})
        
        if not project:
            return jsonify({"success": False, "message": "Project not found"}), 404
        
        

        # Update the report's admin response and status
        result = reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {
                "$set": {
                    "admin_response.title": title,
                    "admin_response.message": message,
                    "has_admin_response": "true"
                }
            }
        )

        if result.matched_count == 0:
            return jsonify({"success": False, "message": "Failed to update the report"}), 500

        return jsonify({"success": True, "message": "Logs granted and report updated successfully"}), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    


def get_project_log(project_id):
    try:
        role = g.role
        user_id = g._id
        # project_id = request.args.get("project_id")
        project = projects_collection.find_one({"project_id": project_id})
        granted_logs = project.get("granted_logs")
        if(granted_logs == None):
            granted_logs = []
        
        
        if(role.lower() == "admin" or user_id in granted_logs):
            project["_id"] = str(project["_id"])  # MongoDB ObjectId needs to be converted to string
            
            
            return jsonify({"success": True, "message": "Logs returned successfully", "data": project}), 200
        else:
            return jsonify({"success": False, "message": "Unauthorized. Only admins are allowed"}), 403

        
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    



def add_style_img():
    try:
        style_image = request.files.get('styleImage')
        image_id = request.form.get("imageId")
        image_name = request.form.get("imageName")

        image_filename = secure_filename(f"{image_id}.png") 
        image_path = f"{STYLE_IMG_FOLDER}/{image_filename}"


        new_style_image = {
            "image_id": image_id,
            "image_name": image_name,
            "image_url":os.getenv("BACKEND_SERVER") + "/server/static/style/" + image_filename,
            "created_at": datetime.datetime.utcnow()
        }

        style_image_collection.insert_one(new_style_image)
   

        style_image.save(image_path)

        return jsonify({"success": True, "message": "successflly uploaded"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500


def get_all_style_img():
    try:
        style_images = list(style_image_collection.find({}, {"image_id": 1, "image_name": 1, "image_url": 1, "_id": 0}))
     
        
        return jsonify({"success": True, "data": style_images}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500
    

def delete_style_img(image_id):
    try:
        if not image_id:
            return jsonify({"error": "Image ID is required"}), 400
        
        result = style_image_collection.delete_one({"image_id": image_id})

        image_filename = secure_filename(f"{image_id}.png") 
        image_path = f"{STYLE_IMG_FOLDER}/{image_filename}"

        os.remove(image_path)
    
        
        if result.deleted_count == 0:
            return jsonify({"error": "Image not found"}), 404
        
        return jsonify({"message": "Style image deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# handle users from admin
def get_all_users():
    try:
        users = list(users_collection.find({"role": "user"}))
        role = g.role
        if(role.lower() == 'admin' or role.lower() == 'super admin'):
            formatted_users = [
                {
                    "user_id": str(user["_id"]),
                    "username": user['username'],
                    "email": user['email'],
                    "image_url": user['image_url']
                }
                for user in users
            ]
            return jsonify({"success": True, "data": formatted_users}), 200
        else:
            return jsonify({"success": False, "message": "Unauthorized. Only admins are allowed"}), 403
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500


def send_notice():
    try:
        data = request.get_json()

        admin_id = data['adminId']
        user_id = data['userId']
        
        title = data['title']
        message = data['message']
        role = g.role
        
        
        if role.lower() == 'admin':
            # insert notice
            notice_collection.insert_one({"admin_id": admin_id, "user_id":user_id, "title": title, "message": message,  "created_at": datetime.datetime.utcnow()})
            return jsonify({"success": True, "message": "Message sent successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Unauthorized. Only admins are allowed"}), 403
    
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
    


def get_user_notices(user_id):
    current_user_id = str(g._id)  # Extract the user ID from the middleware context
    try:
        if current_user_id == user_id: 
           # Fetch reports where reporter_cuser_id matches the current user ID
            print(user_id)
            notices = list(notice_collection.find({"user_id": user_id}))
            
            formatted_notices = [
                {
                    "user_id": str(notice["user_id"]),
                    "title": notice['title'],
                    "message": notice['message'],
                    "created_at": notice['created_at']
                }
                for notice in notices
            ]

            return jsonify({"success": True, "data": formatted_notices}), 200
        else:
            return jsonify({"success": True, "data": []}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500
    




def delete_user(user_id):
    role = g.role
    try:
        if role.lower() == 'admin':
            # delete user
            users_collection.delete_one({"_id": ObjectId(user_id)})
            # Delete all projects
            projects_collection.delete_many({"user_id": user_id})
            # delete all notices
            notice_collection.delete_many({"user_id": user_id})
            # delete all reports
            reports_collection.delete_many({'reporter_user_id': user_id})


            USER_PATH, ORG_PATH, CANVAS_PATH, INTER_PATH = get_user_paths(os.getenv("USER_COMMON_PATH"), user_id)
 
            shutil.rmtree(USER_PATH)

            return jsonify({"success": True, "message": "User deleted successfully"}), 200
        

        else:
            return jsonify({"success": False, "message": "Unauthorized. Only admins are allowed"}), 403

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
