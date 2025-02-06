
from torch import nn



def get_embedding(model, img):
  if(len(img.shape) == 3):
    img = img.unsqueeze(0)
    
  temp = model[0:2](img)
  return model[-1](temp.flatten().unsqueeze(0))