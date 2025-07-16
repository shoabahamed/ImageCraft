import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uSharpenValue;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;

  void main() {
    // Sharpen kernel
    float uKernel[9];
    uKernel[0] = 0.0;
    uKernel[1] = -1.0;
    uKernel[2] = 0.0;
    uKernel[3] =  -1.0;
    uKernel[4] =  4.0;
    uKernel[5] =  -1.0;
    uKernel[6] =  0.0;
    uKernel[7] =  -1.0;
    uKernel[8] =  0.0;

    // Get original pixel
    vec4 org = texture2D(uTexture, vTexCoord);
    
    // Initialize convolution sum for RGB only (not alpha)
    vec3 sum = vec3(0.0, 0.0, 0.0);
    vec2 stepSize = vec2(uStepW, uStepH);

    // Apply convolution kernel to RGB channels only
    vec4 c;
    
    c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y - stepSize.y));
    sum += c.rgb * uKernel[0];
    
    c = texture2D(uTexture, vec2(vTexCoord.x, vTexCoord.y - stepSize.y));
    sum += c.rgb * uKernel[1];
    
    c = texture2D(uTexture, vec2(vTexCoord.x + stepSize.x, vTexCoord.y - stepSize.y));
    sum += c.rgb * uKernel[2];
    
    c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y));
    sum += c.rgb * uKernel[3];
    
    c = texture2D(uTexture, vec2(vTexCoord.x, vTexCoord.y));
    sum += c.rgb * uKernel[4];
    
    c = texture2D(uTexture, vec2(vTexCoord.x + stepSize.x, vTexCoord.y));
    sum += c.rgb * uKernel[5];
    
    c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y + stepSize.y));
    sum += c.rgb * uKernel[6];
    
    c = texture2D(uTexture, vec2(vTexCoord.x, vTexCoord.y + stepSize.y));
    sum += c.rgb * uKernel[7];

    c = texture2D(uTexture, vec2(vTexCoord.x + stepSize.x, vTexCoord.y + stepSize.y));
    sum += c.rgb * uKernel[8];

    // Apply sharpen effect to RGB only, preserve original alpha
    vec3 sharpened = org.rgb + sum * uSharpenValue;
    
    // Output with original alpha preserved
    gl_FragColor = vec4(sharpened, org.a);
}
`

type SharpenFilterOwnProps = {
  SharpenValue: number
}




type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class SharpenFilter extends filters.BaseFilter<'SharpenFilter', SharpenFilterOwnProps>{
  static type = "SharpenValue"
  static defaults = {SharpenValue: 1.0}
  static uniformLocations = ['uSharpenValue', 'uHalfSize', 'uSize']
  declare SharpenValue: number

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return this.SharpenValue === 0.0
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    const kernel = [
      0, -1,  0,
     -1,  4, -1,
      0, -1,  0
    ];
    const kernelSize = 3;
    const halfKernel = Math.floor(kernelSize / 2);
    const sharpenValue = this.SharpenValue;
  
    // Create a copy of the original data to avoid overwriting during convolution
    const originalData = new Uint8ClampedArray(data);
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
  
        // Apply the kernel
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const pixelX = Math.min(width - 1, Math.max(0, x + kx));
            const pixelY = Math.min(height - 1, Math.max(0, y + ky));
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const kernelValue = kernel[(ky + halfKernel) * kernelSize + (kx + halfKernel)];
  
            r += originalData[pixelIndex] * kernelValue;
            g += originalData[pixelIndex + 1] * kernelValue;
            b += originalData[pixelIndex + 2] * kernelValue;
          }
        }
  
        // Set the new pixel values, scaled by the sharpen value
        const index = (y * width + x) * 4;
        data[index] = Math.min(255, Math.max(0, data[index] + r * sharpenValue));     // R
        data[index + 1] = Math.min(255, Math.max(0, data[index + 1] + g * sharpenValue)); // G
        data[index + 2] = Math.min(255, Math.max(0, data[index + 2] + b * sharpenValue)); // B
        // Alpha channel remains unchanged
      }
    }
  }

  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
    gl.uniform1f(uniformLocations.uSharpenValue, this.SharpenValue)
  }

}

classRegistry.setClass(SharpenFilter)