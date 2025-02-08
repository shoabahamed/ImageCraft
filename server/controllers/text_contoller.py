from flask import jsonify, request, g



def parse_text_command():
    try:
        
        return jsonify({
            "success": True,
            "message": "Parse successfull",
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
      