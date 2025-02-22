from flask import jsonify, request, g



def parse_text_command():
    try:
        command = {"operation": "brightness", "value": 0.5}
        return jsonify({
            "success": True,
            "message": "Parse successfull",
            "data": command
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
      