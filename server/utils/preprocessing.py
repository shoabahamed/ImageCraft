import torchvision.transforms.v2 as T
import torch

def get_style_transfer_transform(img_size=None):
    transforms = []
    if img_size:
        transforms.append(T.Resize(size=img_size))
        
        
    transforms.append(T.ToImage())
    transforms.append(T.ToDtype(torch.float32, scale=True))
    transforms.append(T.ToPureTensor())

    
    return T.Compose(transforms)
