import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;


void main() {
    vec4 sumH = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 sumV = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 c;
    float gray;
    vec2 stepSize = vec2(uStepW, uStepH); // step size  

    // Vertical edge detection kernel
    float uVKernel[9];
    uVKernel[0] = -1.0;
    uVKernel[1] = 0.0;
    uVKernel[2] = 1.0;
    uVKernel[3] =  -2.0;
    uVKernel[4] =  0.0;
    uVKernel[5] =  2.0;
    uVKernel[6] =  -1.0;
    uVKernel[7] =  0.0;
    uVKernel[8] =  1.0;

    // Horizontal edge detection kernel
    float uHKernel[9];
    uHKernel[0] = -1.0;
    uHKernel[1] = -2.0;
    uHKernel[2] = -1.0;
    uHKernel[3] =  0.0;
    uHKernel[4] =  0.0;
    uHKernel[5] =  0.0;
    uHKernel[6] =  1.0;
    uHKernel[7] =  2.0;
    uHKernel[8] =  1.0;


    
    c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y - stepSize.y));
    gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    sumH += vec4(vec3(gray), 1.0) * uHKernel[0];
    sumV += vec4(vec3(gray), 1.0) * uVKernel[0];
    
    c = texture2D(uTexture, vec2(vTexCoord.x, vTexCoord.y - stepSize.y));
    gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    sumH += vec4(vec3(gray), 1.0) * uHKernel[1];
    sumV += vec4(vec3(gray), 1.0) * uVKernel[1];
    
    c = texture2D(uTexture, vec2(vTexCoord.x + stepSize.x, vTexCoord.y - stepSize.y));
    gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    sumH += vec4(vec3(gray), 1.0) * uHKernel[2];
    sumV += vec4(vec3(gray), 1.0) * uVKernel[2];
    
    c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y));
    gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    sumH += vec4(vec3(gray), 1.0) * uHKernel[3];
    sumV += vec4(vec3(gray), 1.0) * uVKernel[3];
    
    c = texture2D(uTexture, vec2(vTexCoord.x, vTexCoord.y));
    gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    sumH += vec4(vec3(gray), 1.0) * uHKernel[4];
    sumV += vec4(vec3(gray), 1.0) * uVKernel[4];
    
    c = texture2D(uTexture, vec2(vTexCoord.x + stepSize.x, vTexCoord.y));
    gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    sumH += vec4(vec3(gray), 1.0) * uHKernel[5];
    sumV += vec4(vec3(gray), 1.0) * uVKernel[5];
    
    c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y + stepSize.y));
    gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    sumH += vec4(vec3(gray), 1.0) * uHKernel[6];
    sumV += vec4(vec3(gray), 1.0) * uVKernel[6];
    
    c = texture2D(uTexture, vec2(vTexCoord.x, vTexCoord.y + stepSize.y));
    gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    sumH += vec4(vec3(gray), 1.0) * uHKernel[7];
    sumV += vec4(vec3(gray), 1.0) * uVKernel[7];
    
    c = texture2D(uTexture, vec2(vTexCoord.x + stepSize.x, vTexCoord.y + stepSize.y));
    gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    sumH += vec4(vec3(gray), 1.0) * uHKernel[8];
    sumV += vec4(vec3(gray), 1.0) * uVKernel[8];

    vec4 magnitude = vec4(sqrt(sumH.rgb * sumH.rgb + sumV.rgb * sumV.rgb), 1.0);


    gl_FragColor = magnitude;
}
`

type SobelFilterOwnProps = {
  apply: boolean
}




// type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class SobelFilter extends filters.BaseFilter<'SobelFilter', SobelFilterOwnProps>{
  static type = "SobelFilter"
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

classRegistry.setClass(SobelFilter)