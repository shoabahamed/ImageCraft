import torch
from torch import nn
import torch.nn.functional as F
from model_config import CFG




def AdaIN(content_features, style_features):
    """
        content_features: (B, C, H, W)
        styel_features: (B, C, H, W)
    """
    # content_mean: (B, C, 1, 1); content_std: (B, C, 1, 1)
    content_mean, content_std = calculate_mean_std(content_features)
    style_mean, style_std = calculate_mean_std(style_features)

    # normalizing the features
    normalized_content_features = (content_features - content_mean) / content_std
    return style_std * normalized_content_features + style_mean


def calculate_mean_std(features, eps=1e-5):
    """
    features: (B, C, H, W)
    """
    B, C, H, W = features.size()
    
    #(B, C, Height, Width) -> (B, C)
    feats_var = features.view(B, C, -1).var(dim=-1) + eps
    # (B, C) -> (B, C, 1, 1)
    feats_std = feats_var.sqrt().view(B, C, 1, 1)
    
    #(B, C, H, W) -> (B, C, 1, 1)
    feats_mean = features.view(B, C, -1).mean(dim=-1).view(B, C, 1, 1)
    
    return feats_mean, feats_std

# the network structure of vgg19 till relu5_1 as we will at most need the relu5_1 output
enc_layers = nn.Sequential( 
    nn.Conv2d(3,3,(1, 1)),  # this is an extra preprocessing layer

    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(3,64,(3, 3)),
    nn.ReLU(), # relu1_1
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(64,64,(3, 3)),
    nn.ReLU(), # relu1_2
    nn.MaxPool2d((2, 2),(2, 2),(0, 0)),

    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(64,128,(3, 3)),
    nn.ReLU(), # relu2_1
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(128,128,(3, 3)),
    nn.ReLU(), # relu2_2
    nn.MaxPool2d((2, 2),(2, 2),(0, 0)),

    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(128,256,(3, 3)),
    nn.ReLU(), # relu3_1
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(256,256,(3, 3)),
    nn.ReLU(), # relu3_1
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(256,256,(3, 3)),
    nn.ReLU(), # relu3_3
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(256,256,(3, 3)),
    nn.ReLU(), # relu3_4

    nn.MaxPool2d((2, 2),(2, 2),(0, 0)),
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(256,512,(3, 3)),
    nn.ReLU(), # relu4_1
) 

class VGG_ENCODER(nn.Module):
    def __init__(self, model_path):
        super().__init__()
        
        self.relu1_1 = nn.Sequential(*enc_layers[:4])  # input -> relu1_1
        self.relu1_2 = nn.Sequential(*enc_layers[4:7]) # relu1_1 -> relu1_2
        self.relu2_1 = nn.Sequential(*enc_layers[7:11])  # relu1_2 -> relu2_1
        self.relu2_2 = nn.Sequential(*enc_layers[11:14]) # relu2_1 -> relu2_2
        self.relu3_1 = nn.Sequential(*enc_layers[14:18]) # relu2_2 -> relu3_1
        self.relu3_2 = nn.Sequential(*enc_layers[18:21]) # relu3_1 -> relu3_2
        self.relu3_3 = nn.Sequential(*enc_layers[21:24]) # relu3_3 -> relu3_3
        self.relu3_4 = nn.Sequential(*enc_layers[24:27]) # relu3_3 -> relu3_3
        self.relu4_1 = nn.Sequential(*enc_layers[27:31]) # relu3_4 -> relu4_1
        
        # loading pretrained vgg model weights
        enc_layers.load_state_dict(torch.load(model_path,map_location=CFG.device, weights_only=True))

        # Freeze the layers to prevent training them
        for param in self.parameters():
            param.requires_grad_(False)
            
        
        

    def forward(self, x):
        """
        x: (Batch_Size, Channels, Height, Width)
        output: dictionary containing the feature maps of all relu layers
        """
        output = {}
        
        x = self.relu1_1(x)
        output['relu1_1'] = x 
        
        x = self.relu1_2(x)
        
        x = self.relu2_1(x)
        output['relu2_1'] = x 
        
        x = self.relu2_2(x)
        
        x = self.relu3_1(x)
        output['relu3_1'] = x 

        x = self.relu3_2(x)
        x = self.relu3_3(x)
        x = self.relu3_4(x)
        
        x = self.relu4_1(x)
        output['relu4_1'] = x 
        
        
        return output
    

VGG_DECODER = nn.Sequential( # Sequential,
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(512,256,(3, 3)),
    nn.ReLU(),
    nn.UpsamplingNearest2d(scale_factor=2),
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(256,256,(3, 3)),
    nn.ReLU(),
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(256,256,(3, 3)),
    nn.ReLU(),
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(256,256,(3, 3)),
    nn.ReLU(),
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(256,128,(3, 3)),
    nn.ReLU(),
    nn.UpsamplingNearest2d(scale_factor=2),
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(128,128,(3, 3)),
    nn.ReLU(),
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(128,64,(3, 3)),
    nn.ReLU(),
    nn.UpsamplingNearest2d(scale_factor=2),
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(64,64,(3, 3)),
    nn.ReLU(),
    nn.ReflectionPad2d((1, 1, 1, 1)),
    nn.Conv2d(64,3,(3, 3)),
)


class Network(nn.Module):
    def __init__(self, encoder, decoder):
        super().__init__()
        self.encoder = encoder 
        self.decoder = decoder
        
        
    def forward(self, content_img, style_img, alpha=1.0):
        
        content_feature_maps = self.encoder(content_img)
        style_feature_maps = self.encoder(style_img)
        
        t = AdaIN(content_feature_maps['relu4_1'], style_feature_maps['relu4_1'])
        
        generated_img = self.decoder(t)
        generated_feature_maps = self.encoder(generated_img)
        
        content_loss = F.mse_loss(generated_feature_maps['relu4_1'], t)
        style_loss = 0.0
        for gen_feature_map, style_feature_map in zip(generated_feature_maps.values(), style_feature_maps.values()):
            style_loss += self.calculate_style_loss(gen_feature_map, style_feature_map)
            
        return content_loss, style_loss
    

    def stylize_image(self, content_img, style_img, alpha=0.5):
        content_feature_maps = self.encoder(content_img)
        style_feature_maps = self.encoder(style_img)
        
        t =  AdaIN(content_feature_maps['relu4_1'], style_feature_maps['relu4_1'])
        t = alpha * t + (1-alpha) * content_feature_maps['relu4_1']
        generated_img = self.decoder(t)
        
        return torch.clip(generated_img, 0.0, 1.0)
            

    def calculate_style_loss(self, gen_features, style_features):
        gen_mean, gen_std = calculate_mean_std(gen_features)
        style_mean, style_std = calculate_mean_std(style_features)

        return F.mse_loss(gen_mean, style_mean) + F.mse_loss(gen_std, style_std)
    

