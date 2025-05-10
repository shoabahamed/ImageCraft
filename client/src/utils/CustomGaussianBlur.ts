import {filters, type T2DPipelineState, classRegistry} from "fabric"
  



const fragmentSource = `
precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);

  
    vec4 sum = vec4(0.0);
    vec2 offset;
    vec4 sample;
    float gray;
    
    float gaussianKernel[25];
    gaussianKernel[0]  = 0.00296902;
    gaussianKernel[1]  = 0.01330621;
    gaussianKernel[2]  = 0.02193823;
    gaussianKernel[3]  = 0.01330621;
    gaussianKernel[4]  = 0.00296902;

    gaussianKernel[5]  = 0.01330621;
    gaussianKernel[6]  = 0.05963430;
    gaussianKernel[7]  = 0.09832033;
    gaussianKernel[8]  = 0.05963430;
    gaussianKernel[9]  = 0.01330621;

    gaussianKernel[10] = 0.02193823;
    gaussianKernel[11] = 0.09832033;
    gaussianKernel[12] = 0.16210282;
    gaussianKernel[13] = 0.09832033;
    gaussianKernel[14] = 0.02193823;

    gaussianKernel[15] = 0.01330621;
    gaussianKernel[16] = 0.05963430;
    gaussianKernel[17] = 0.09832033;
    gaussianKernel[18] = 0.05963430;
    gaussianKernel[19] = 0.01330621;

    gaussianKernel[20] = 0.00296902;
    gaussianKernel[21] = 0.01330621;
    gaussianKernel[22] = 0.02193823;
    gaussianKernel[23] = 0.01330621;
    gaussianKernel[24] = 0.00296902;
    
    for(int y = -2; y <= 2; y++) {
        for(int x = -2; x <= 2; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            gray = dot(sample.rgb, vec3(0.299, 0.587, 0.114));

            
            sum += gray * gaussianKernel[(y + 2) * 5 + (x + 2)];
        }
    }

    gl_FragColor = vec4(sum.rgb, 1.0);
}
`;

type CustomGaussianSobelFilterOwnProps = {
  apply: boolean
}




// type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class CustomGaussianSobelFilter extends filters.BaseFilter<'CustomGaussianSobelFilter', CustomGaussianSobelFilterOwnProps>{
  static type = "CustomGaussianSobelFilter"
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
        let gxR = 0, gxG = 0, gxB = 0;
        let gyR = 0, gyG = 0, gyB = 0;
  
        // Apply the Sobel kernels
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const pixelX = Math.min(width - 1, Math.max(0, x + kx));
            const pixelY = Math.min(height - 1, Math.max(0, y + ky));
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const kernelIndex = (ky + halfKernel) * kernelSize + (kx + halfKernel);
  
            const kernelValueX = kernelX[kernelIndex];
            const kernelValueY = kernelY[kernelIndex];
  
            gxR += originalData[pixelIndex] * kernelValueX;
            gxG += originalData[pixelIndex + 1] * kernelValueX;
            gxB += originalData[pixelIndex + 2] * kernelValueX;
  
            gyR += originalData[pixelIndex] * kernelValueY;
            gyG += originalData[pixelIndex + 1] * kernelValueY;
            gyB += originalData[pixelIndex + 2] * kernelValueY;
          }
        }
  
        // Compute the gradient magnitude
        const index = (y * width + x) * 4;
        data[index] = Math.min(255, Math.sqrt(gxR * gxR + gyR * gyR));     // R
        data[index + 1] = Math.min(255, Math.sqrt(gxG * gxG + gyG * gyG)); // G
        data[index + 2] = Math.min(255, Math.sqrt(gxB * gxB + gyB * gyB)); // B
        // Alpha channel remains unchanged
      }
    }
  }

  // sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
  //   gl.uniform1f(uniformLocations.uSharpenValue, this.SharpenValue)
  // }

}

classRegistry.setClass(CustomGaussianSobelFilter)