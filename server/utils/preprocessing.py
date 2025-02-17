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


def get_similar_image_transform(img_size=None):
  transforms = []

  transforms.append(T.Resize(img_size))
  transforms.append(T.ToImage())
  transforms.append(T.ToDtype(torch.float32, scale=True))

  transforms.append(T.ToPureTensor())
  transforms.append(T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]))

  return T.Compose(*[transforms])


def get_super_resolution_transform():
    transforms = []
        
    transforms.append(T.ToImage())
    transforms.append(T.ToDtype(torch.float32, scale=True))

    transforms.append(T.ToPureTensor())
    # transforms.append(T.Normalize(mean=[0.4488, 0.4371, 0.4040], std=[0.5, 0.5, 0.5]))
    
    return T.Compose(transforms)

