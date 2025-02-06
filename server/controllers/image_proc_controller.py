from flask import jsonify, request, g
from PIL import Image
from utils.preprocessing import get_style_transfer_transform, get_similar_image_transform
from model_config import CFG
import torchvision.transforms.v2 as T
import io
import base64
import torch
from model_config import CFG
from models.style_transfer import *
from models.similarity_model import  get_embedding
from torchvision import models
from config.db_config import get_db
import numpy as np

db = get_db()
embedding_collection = db['Embedding']

def apply_style_transfer():
  try:
    if 'originalImage' not in request.files or 'styleImage' not in request.files:
        return jsonify({"success": False, "message": "Both originalImage and styleImage must be provided"}), 400

    # Get the files
    original_image_file = request.files['originalImage']
    style_image_file = request.files['styleImage']
    
    

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
      