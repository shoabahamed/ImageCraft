import os
import torch

class CFG:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Get the current file's directory (backend folder)
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct absolute paths for the weights
    style_transfer_encoder_path = os.path.join(backend_dir, "weights", "vgg_normalised_conv4_1.pth")
    style_transfer_decoder_path = os.path.join(backend_dir, "weights", "adain_trained_decoder_110000.pth")
    similarity_model_path = os.path.join(backend_dir, "weights", "vgg16_pytorch.pth")
    super_resolution_x2_model_path = os.path.join(backend_dir, "weights", "edsr_scale2_3500.pth")
    super_resolution_x4_model_path = os.path.join(backend_dir, "weights", "edsr_scale4_last_checkpoint_4000.pth")
    super_resolution_model_path = os.path.join(backend_dir, "weights", "mdsr_8000.pth")
    

