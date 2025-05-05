import torch
from torch import nn
import torch.nn.functional as F

class MeanShift(nn.Conv2d):
    def __init__(self, rgb_range=255, rgb_mean=(0.4488, 0.4371, 0.4040), rgb_std=(1.0, 1.0, 1.0),
                 sign=-1):
        super(MeanShift, self).__init__(3, 3, kernel_size=1)
        std = torch.Tensor(rgb_std)
        self.weight.data = torch.eye(3).view(3, 3, 1, 1) / std.view(3, 1, 1, 1)
        self.bias.data = sign * rgb_range * torch.Tensor(rgb_mean) / std
        for p in self.parameters():
            p.requires_grad = False


class ResBlock(nn.Module):
    def __init__(self, in_channel=64, out_channel=64, kernel_size=3, stride=1, padding=1,
                 bias=True):
        super(ResBlock, self).__init__()
        layers = [nn.Conv2d(in_channel, out_channel, kernel_size=kernel_size, stride=stride,
                            padding=padding, bias=bias),
                  nn.ReLU(inplace=True),
                  nn.Conv2d(in_channel, out_channel, kernel_size=kernel_size, stride=stride,
                            padding=padding, bias=bias)]

        self.body = nn.Sequential(*layers)
        self.res_scale = 0.1

    def forward(self, x):
        res = self.body(x).mul(self.res_scale)
        res += x
        return res


class Upsampler(nn.Sequential):
    def __init__(self, num_feats, scale):
        layers = []
        if scale == 2 or scale == 4:
            layers.append(nn.Conv2d(num_feats, num_feats * 4, kernel_size=3, stride=1, padding=1, bias=True))
            layers.append(nn.PixelShuffle(2))
            if scale == 4:
                layers.append(nn.Conv2d(num_feats, num_feats * 4, kernel_size=3, stride=1, padding=1,
                                        bias=True))
                layers.append(nn.PixelShuffle(2))
        elif scale == 3:
            layers.append(nn.Conv2d(num_feats, num_feats * 9, kernel_size=3, stride=1, padding=1, bias=True))
            layers.append(nn.PixelShuffle(3))
        else:
            raise NotImplementedError

        super(Upsampler, self).__init__(*layers)


class MDSR(nn.Module):
    def __init__(self, num_res_blocks=80, num_feats=64, scales=[2, 3, 4]):
        super(MDSR, self).__init__()
        self.scales = scales
        
        head_layers = [nn.Conv2d(3, num_feats, kernel_size=3, stride=1, padding=1, bias=True)]

        # Preprocessing block per scale
        preprocess = nn.ModuleDict({
            str(s): nn.Sequential(
                ResBlock(in_channel=num_feats, out_channel=num_feats, kernel_size=5, padding=2),
                ResBlock(in_channel=num_feats, out_channel=num_feats, kernel_size=5, padding=2),
            ) for s in self.scales
        })


        body_layers = []
        for _ in range(num_res_blocks):
            body_layers.append(ResBlock(in_channel=64, out_channel=64))
        body_layers.append(nn.Conv2d(num_feats, num_feats, kernel_size=3, stride=1, padding=1, bias=True))

        # Scale-specific upsamplers
        upsamplers = nn.ModuleDict({
            str(s): Upsampler(num_feats, scale=s) for s in self.scales
        })
        tail_layer = [nn.Conv2d(num_feats, 3, kernel_size=3, stride=1, padding=1, bias=True)]

        self.sub_mean = MeanShift(sign=-1)
        self.add_mean = MeanShift(sign=1)
        self.head = nn.Sequential(*head_layers)
        self.preprocess = preprocess
        self.body = nn.Sequential(*body_layers)
        self.upsamplers = upsamplers
        self.tail = nn.Sequential(*tail_layer)

    def forward(self, x, scale):
        x = self.sub_mean(x)
        x = self.head(x)

  
        x = self.preprocess[f"{scale}"](x)

        res = self.body(x)

        
        res += x


        x = self.upsamplers[f"{scale}"](res)
        
        x = self.tail(x)
        x = self.add_mean(x)

        return x