from flask import jsonify, request, g
from PIL import Image
from models.style_transfer import style_transfer_model
from utils.preprocessing import get_style_transfer_transform
from model_config import CFG
import torchvision.transforms.v2 as T
import io
import base64


def apply_style_transfer():
  try:
    if 'originalImage' not in request.files or 'styleImage' not in request.files:
        return jsonify({"success": False, "message": "Both originalImage and styleImage must be provided"}), 400

    # Get the files
    original_image_file = request.files['originalImage']
    style_image_file = request.files['styleImage']
    print('skdjfs')
    

    # Open the original image
    original_image = Image.open(original_image_file).convert('RGB')
    # Open the style image
    style_image = Image.open(style_image_file).convert("RGB")

    org_width, org_height = original_image.width, original_image.height

    
    original_image_transfrom = get_style_transfer_transform()
    style_image_transform = get_style_transfer_transform(img_size=(org_height, org_width))
    
    original_image = original_image_transfrom(original_image).unsqueeze(0).to(CFG.device)
    style_image = style_image_transform(style_image).unsqueeze(0).to(CFG.device)
    
    stylized_img = style_transfer_model.stylize_image(original_image, style_image, alpha=1.0).to('cpu')[0]

    stylized_img = T.ToPILImage()(stylized_img)
    stylized_img = stylized_img.resize((org_width, org_height))



    # encode to base64
    buffer = io.BytesIO()
    stylized_img.save(buffer, format="png")
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    # with open("temp.txt", "w") as f:
    #    f.write(image_base64)
    return jsonify({"success": True, "message": "Style Trasnfer Successfull", "image": image_base64}), 200

  except Exception as e:
    return jsonify({"success": False, "message": f"An Error has occurced {str(e)}"}), 500
