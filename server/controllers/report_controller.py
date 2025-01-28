from flask import jsonify, request, g
from bson import ObjectId
from config.db_config import get_db
from dotenv import load_dotenv
import datetime

load_dotenv()

db = get_db()
reports_collection = db["Reports"]
projects_collection = db['Projects']


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
                "created_at": report["created_at"].isoformat()
                if isinstance(report["created_at"], datetime.datetime)
                else None,
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



def get_user_reports():
    user_id = str(g._id)  # Extract the user ID from the middleware context
    try:
        # Fetch reports where reporter_user_id matches the current user ID
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
                "created_at": report["created_at"].isoformat()
                if isinstance(report["created_at"], datetime.datetime)
                else None,
                "admin_response": report.get("admin_response", None),  # Include admin response
            }
            for report in reports
        ]

        return jsonify({"success": True, "data": formatted_reports}), 200

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
        role = request.headers.get("Role")
        user_id = g._id
        # project_id = request.args.get("project_id")
        project = projects_collection.find_one({"project_id": project_id})
        granted_logs = project.get("granted_logs")
        if(granted_logs == None):
            granted_logs = []
        
        
        if(role == "admin" or user_id in granted_logs):
            logs = {
                "project_data": project.get("project_data"),
                "project_logs": project.get("project_logs"),
                "original_image_url": project.get("original_image_url"),
                "canvas_image_url": project.get("canvas_image_url")
            }
            
           
            return jsonify({"success": True, "message": "Logs returned successfully", "data": logs}), 200
        else:
            return jsonify({"success": False, "message": "You do not have necessary access"}), 401

        
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500

