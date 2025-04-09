import os 

def get_user_paths(common_user_path, user_id):
    USER_PATH = common_user_path+ user_id + "/"
    ORG_PATH = USER_PATH+ "original/"
    CANVAS_PATH = USER_PATH+ "canvas/"
    INTER_PATH = USER_PATH+ "inter/"

    return USER_PATH, ORG_PATH, CANVAS_PATH, INTER_PATH

def create_user_paths(user_path, org_path, canvas_path, inter_path):
    os.makedirs(user_path, exist_ok=True)
    os.makedirs(org_path, exist_ok=True)
    os.makedirs(canvas_path, exist_ok=True)
    os.makedirs(inter_path, exist_ok=True)
    
    
