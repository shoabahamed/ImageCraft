import {filters, type T2DPipelineState, classRegistry} from "fabric"



  



const fragmentSource = `
precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);


    // Vertical edge detection kernel (Sobel Gx)
    // -1 -2 -1
    //  0  0  0
    //  1  2  1
    float uVKernel[9];
    uVKernel[0] = -1.0;  uVKernel[1] = -2.0;  uVKernel[2] = -1.0;
    uVKernel[3] =  0.0;  uVKernel[4] =  0.0;  uVKernel[5] =  0.0;
    uVKernel[6] =  1.0;  uVKernel[7] =  2.0;  uVKernel[8] =  1.0;

    // Horizontal edge detection kernel (Sobel Gy)
    // -1   0  1
    // -2   0  2
    // -1   0  1
    float uHKernel[9];
    uHKernel[0] = -1.0;  uHKernel[1] =  0.0;  uHKernel[2] =  1.0;
    uHKernel[3] = -2.0;  uHKernel[4] =  0.0;  uHKernel[5] =  2.0;
    uHKernel[6] = -1.0;  uHKernel[7] =  0.0;  uHKernel[8] =  1.0;;




  

    // 2. Sobel Edge Detection on Blurred Image
    vec3 sumH = vec3(0.0);
    vec3 sumV = vec3(0.0);
    vec2 offset;
    vec4 sample;
    float gray;
    

    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            offset = vec2(float(x), float(-y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);

            // all problems stem from here
            
            sumH += sample.rgb * uHKernel[(y + 1) * 3 + (x + 1)];
            sumV += sample.rgb * uVKernel[(y + 1) * 3 + (x + 1)];
        }
    }

    float gx = sumH.r;
    float gy = sumV.r;

    float normalized_gx = gx / 8.0 + 0.5;
    float normalized_gy = gy / 8.0 + 0.5;
    
    gl_FragColor = vec4(normalized_gx, normalized_gy, 0.0, 1.0);

}
`;




type CannySobelEdgeOwnProps = {
  apply: boolean
}




// type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class CannySobelEdge extends filters.BaseFilter<'CannySobelEdge', CannySobelEdgeOwnProps>{
  static type = "CannySobelEdge"
  static defaults = {apply: true}
  static uniformLocations = ['uHalfSize', 'uSize']


  getFragmentSource(){
    return fragmentSource
  }

  

  isNeutralState() {
    return false
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    const kernelX = [
      -1, 0, 1,
      -2, 0, 2,
      -1, 0, 1
    ];
    const kernelY = [
      -1, -2, -1,
       0,  0,  0,
       1,  2,  1
    ];
    const kernelSize = 3;
    const halfKernel = Math.floor(kernelSize / 2);

    
  
    // Create a copy of the original data to avoid overwriting during convolution
    const originalData = new Uint8ClampedArray(data);
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let gx = 0;
        let gy = 0;
  
        // Apply the Sobel kernels
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const pixelX = Math.min(width - 1, Math.max(0, x + kx));
            const pixelY = Math.min(height - 1, Math.max(0, y + ky));
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const kernelIndex = (ky + halfKernel) * kernelSize + (kx + halfKernel);
  
            const kernelValueX = kernelX[kernelIndex];
            const kernelValueY = kernelY[kernelIndex];
  
            // Since the image is already grayscale, use the red channel only
            const grayValue = originalData[pixelIndex]; // Red channel
            gx += grayValue * kernelValueX;
            gy += grayValue * kernelValueY;
          }
        }
  
        // Compute the gradient magnitude
        const index = (y * width + x) * 4;
        const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
        data[index] = magnitude;     // R
        data[index + 1] = magnitude; // G
        data[index + 2] = magnitude; // B
        // Alpha channel remains unchanged
      }
    }
  }



}

classRegistry.setClass(CannySobelEdge)