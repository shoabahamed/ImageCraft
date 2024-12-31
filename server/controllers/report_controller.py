from flask import jsonify, request, g
from bson import ObjectId
from config.db_config import get_db
from dotenv import load_dotenv
import datetime
from dotenv import load_dotenv

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

        if not user_id and not project_id and not project_user_id and not title and not description:
            return jsonify({"success": False, "message": "Missing report data"}), 400
    

        # Create the report document
        report_document = {
            "reporter_user_id": user_id,
            "project_id": project_id,
            "project_user_id": project_user_id,
            "title": title,
            "description": description,
            "status": "pending",  
            "admin_response": {
                "granted_log": None,
                "message": None,
                "logs": None,
                "original_image_url": None,
                "canvas_image_url": None,
            },
            "created_at": datetime.datetime.utcnow(),  # You can use UTC time for when the report was submitted
        }

        # Insert the report document into the collection
        reports_collection.insert_one(report_document)


        response_message = "Report Submitted successfully"
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
                "reporter_user_id": report["reporter_user_id"],
                "project_id": report["project_id"],
                "project_user_id": report["project_user_id"],
                "title": report["title"],
                "description": report["description"],
                "status": report["status"],
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
        user_id = str(g._id)  # Assuming middleware extracts the admin user ID

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
            "message": "Logs have been granted",
            "logs": project['project_data'],  # Assuming the project has a `logs_url` field
            "original_image_url": project["original_image_url"],
            "canvas_image_url": project["canvas_image_url"],
        }

        # Update the report's admin response and status
        result = reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {
                "$set": {
                    "admin_response": updated_admin_response,
                }
            }
        )

        if result.matched_count == 0:
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
