import {filters, type T2DPipelineState, classRegistry} from "fabric";

const fragmentSourceVertical = `
precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW; // Width of one pixel in texture coordinates
uniform float uStepH; // Height of one pixel in texture coordinates

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    
    // Vertical edge detection kernel (Sobel Gx)
    // -1 -2 -1
    //  0  0  0
    //  1  2  1
    float kernel[9];
    kernel[0] = -1.0; kernel[1] = -2.0; kernel[2] = -1.0;
    kernel[3] =  0.0; kernel[4] =  0.0; kernel[5] =  0.0;
    kernel[6] =  1.0; kernel[7] =  2.0; kernel[8] =  1.0;

    vec3 sum = vec3(0.0);
    vec2 offset;
    vec4 current_sample;

    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            offset = vec2(float(x), float(-y)) * stepSize;
            current_sample = texture2D(uTexture, vTexCoord + offset);
            sum += current_sample.rgb * kernel[(y + 1) * 3 + (x + 1)];
        }
    }
    
    float edgeStrength = abs(sum.r); // Assuming grayscaled input
    gl_FragColor = vec4(edgeStrength, edgeStrength, edgeStrength, texture2D(uTexture, vTexCoord).a);
}
`;

type VerticalEdgeFilterOwnProps = Record<string, unknown>; // Using Record<string, unknown> to avoid linter issues with empty objects

export class VerticalEdgeFilter extends filters.BaseFilter<'VerticalEdgeFilter', VerticalEdgeFilterOwnProps> {
  static type = "VerticalEdgeFilter";

  getFragmentSource() {
    return fragmentSourceVertical;
  }

  isNeutralState() {
    return false;
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    const kernelX = [ // Sobel Gx for vertical edges
      -1, 0, 1,
      -2, 0, 2,
      -1, 0, 1
    ];
    const kernelSize = 3;
    const halfKernel = Math.floor(kernelSize / 2);
  
    const originalData = new Uint8ClampedArray(data);
  
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        let gx = 0;
  
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const pixelX = Math.min(width - 1, Math.max(0, c + kx));
            const pixelY = Math.min(height - 1, Math.max(0, r + ky));
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const kernelIndex = (ky + halfKernel) * kernelSize + (kx + halfKernel);
  
            const kernelValueX = kernelX[kernelIndex];
            const grayValue = originalData[pixelIndex]; // Assuming grayscaled (R channel)
            gx += grayValue * kernelValueX;
          }
        }
  
        const index = (r * width + c) * 4;
        const magnitude = Math.min(255, Math.abs(gx));
        data[index] = magnitude;
        data[index + 1] = magnitude;
        data[index + 2] = magnitude;
        // Alpha preserved
      }
    }
  }
}

classRegistry.setClass(VerticalEdgeFilter);
