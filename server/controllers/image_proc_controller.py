from flask import jsonify, request, g
from PIL import Image
from utils.preprocessing import get_style_transfer_transform, get_similar_image_transform, get_super_resolution_transform
from model_config import CFG
import torchvision.transforms.v2 as T
import io
import base64
import torch
from model_config import CFG
from models.style_transfer import *
from models.super_resolution_model import *
from models.similarity_model import  get_embedding
from torchvision import models
from config.db_config import get_db
import numpy as np
import gc

db = get_db()
embedding_collection = db['Embedding']

def apply_style_transfer():
  try:
    if 'originalImage' not in request.files or 'styleImage' not in request.files:
        return jsonify({"success": False, "message": "Both originalImage and styleImage must be provided"}), 400
    
    # raw_data = request.get_data()
    # print(f"🔍 Content-Type: {request.content_type}")
    # print(f"Raw request size: {len(raw_data) / (1024 * 1024)} bytes")
    # print(request.files)
    # Get the files
    original_image_file = request.files['originalImage']
    style_image_file = request.files['styleImage']
    print(request.files)
    print(request.form.get("alpha"))
    alpha_value = float(request.form.get("alpha"))
    



    # loading model
    vgg_encoder = VGG_ENCODER(CFG.style_transfer_encoder_path).to(CFG.device)
    vgg_decoder = VGG_DECODER.to(CFG.device)
    style_transfer_model = Network(vgg_encoder, vgg_decoder).to(CFG.device)

    style_transfer_model.decoder.load_state_dict(torch.load(CFG.style_transfer_decoder_path, map_location=CFG.device, weights_only=True))

    # Open the original image
    original_image = Image.open(original_image_file).convert('RGB')
    # Open the style image
    style_image = Image.open(style_image_file).convert("RGB")

    org_width, org_height = original_image.width, original_image.height

    

    # Determine the resizing logic based on the original image dimensions
    min_dim = min(org_width, org_height)
    if min_dim < 512:
        img_size = None  # No resizing
    elif min_dim < 1024:
        img_size = 512  
    else:
        img_size = 1024  

    


    original_image_transfrom = get_style_transfer_transform(img_size=img_size)
    style_image_transform = get_style_transfer_transform(img_size=512)
    
    original_image = original_image_transfrom(original_image).unsqueeze(0).to(CFG.device)
    style_image = style_image_transform(style_image).unsqueeze(0).to(CFG.device)
    

    print(original_image.shape, style_image.shape)

    with torch.no_grad():
        stylized_img = style_transfer_model.stylize_image(original_image, style_image, alpha=alpha_value).to('cpu')[0]

    stylized_img = T.ToPILImage()(stylized_img)
    stylized_img = stylized_img.resize((org_width, org_height))

    del style_transfer_model, original_image, style_image
    torch.cuda.empty_cache()
    gc.collect()



    # encode to base64
    buffer = io.BytesIO()
    stylized_img.save(buffer, format="png")
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return jsonify({"success": True, "message": "Style Trasnfer Successfull", "image": image_base64}), 200

  except Exception as e:
    return jsonify({"success": False, "message": f"An Error has occurced {str(e)}"}), 500


def find_similar_image():
    try:
        if 'baseImage' not in request.files:
            return jsonify({"success": False, "message": "Image not provided"}), 400

        # Get the files
        base_image_file = request.files['baseImage']
        
        # Open the original image
        img = Image.open(base_image_file).convert('RGB')
        img_transform = get_similar_image_transform(img_size=(224, 224))

        # Load model
        m = models.vgg16(weights=None)
        m.load_state_dict(torch.load(CFG.similarity_model_path, map_location=CFG.device, weights_only=True))
        sim_model = torch.nn.Sequential(*[m.features, m.avgpool, m.classifier[0]])
        
        with torch.no_grad():
            # Getting embedding
            img_emb = get_embedding(sim_model, img_transform(img)).to('cpu')  

        del style_transfer_model
        torch.cuda.empty_cache()
        gc.collect()
     
        stored_embeddings = list(embedding_collection.find({"is_public": "true"}, {"project_id": 1, "embedding": 1}))

        if not stored_embeddings:
            return jsonify({"success": False, "message": "No embeddings found in the database"}), 404

        # Compute cosine similarity with all stored embeddings
        similarities = []
        
        for entry in stored_embeddings:
            
            stored_emb = torch.tensor(entry["embedding"]).float()
            similarity_score = F.cosine_similarity(img_emb, stored_emb)  # Compute cosine similarity
            similarities.append((entry["project_id"], similarity_score.item()))  # Use .item() to extract scalar value
        
        # Sort by similarity score in descending order and get the top 20 matches
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_10_similar = [{"project_id": project_id, "score": score} for project_id, score in similarities[:10]]
        print(top_10_similar)
        return jsonify({
            "success": True,
            "message": "Top 10 similar images found",
            "similar_projects": top_10_similar
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
      

def apply_super_resolution():
    try:
        print("DEBUG: Starting apply_super_resolution function")

        # Check if the file is provided
        if 'originalImage' not in request.files:
            print("DEBUG: originalImage not found in request.files")
            return jsonify({"success": False, "message": "originalImage must be provided"}), 400

        # Get the image and resolution
        image_data = request.files['originalImage']
        resolution = request.form.get("scale")
        print(f"DEBUG: Received resolution: {resolution}")

        if not resolution:
            print("DEBUG: Resolution not provided in request.form")
            return jsonify({"success": False, "message": "Resolution must be provided"}), 400

        resolution = int(resolution)
        print(f"DEBUG: Parsed resolution: {resolution}")

        # Open the image
        image = Image.open(image_data).convert("RGB")
        print("DEBUG: Image successfully opened and converted to RGB")

        # Apply transformation
        transform = get_super_resolution_transform()
        image = transform(image)
        print("DEBUG: Image transformed to tensor")

        # Load the model
        print("DEBUG: Loading MDSR model")
        model = MDSR(num_res_blocks=80, num_feats=64, scales=[2, 3, 4]).to(CFG.device)
        model_checkpoint = torch.load(CFG.super_resolution_model_path, map_location=CFG.device, weights_only=True)
        model.load_state_dict(model_checkpoint['model_state'])
        print("DEBUG: Model loaded successfully")

        # Apply super-resolution based on the scale
        if resolution in [2, 3, 4]:
            print(f"DEBUG: Applying super-resolution for scale {resolution}")
            with torch.no_grad():
                image = image * 255
                image = torch.clip(model(image.unsqueeze(0).to(CFG.device), resolution), min=0, max=255).to('cpu').squeeze(0)
                image = image / 255
            print(f"DEBUG: Super-resolution applied for scale {resolution}")
        else:
            print(f"DEBUG: Invalid resolution: {resolution}")
            return jsonify({"success": False, "message": f"Resolution {resolution} is not supported"}), 400

        # Clean up
        del model
        torch.cuda.empty_cache()
        gc.collect()
        print("DEBUG: Model and cache cleared")

        # Convert tensor back to image
        image = T.ToPILImage()(image)
        print("DEBUG: Tensor converted back to PIL image")

        # Encode image to base64
        buffer = io.BytesIO()
        image.save(buffer, format="png")
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        print("DEBUG: Image encoded to base64")

        return jsonify({"success": True, "message": "Super-resolution applied successfully", 'image': image_base64}), 200

    except Exception as e:
        print(f"DEBUG: Exception occurred - {str(e)}")
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"}), 500
