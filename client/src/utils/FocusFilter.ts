import {filters, type T2DPipelineState, classRegistry} from "fabric"



  



const fragmentSource = {
  dark:`
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uRadius;    // vignette size factor [0.0 - 1.0]
uniform float uSoftness;  // vignette fade factor [0.0 - 1.0]

void main() {

    vec2 resolution = vec2(1.0 / uStepW, 1.0 / uStepH);
    vec2 position = vTexCoord * resolution;
    vec2 center = resolution * 0.5;

    float dist = distance(position, center);
    float maxDist = length(center);

    float vignette = smoothstep(uRadius * maxDist, (uRadius + uSoftness) * maxDist, dist);

    vec4 color = texture2D(uTexture, vTexCoord);
    
    color.rgb *= 1.0 - vignette;

    gl_FragColor = color;
}
`,

  bright: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uRadius;    // vignette size factor [0.0 - 1.0]
uniform float uSoftness;  // vignette fade factor [0.0 - 1.0]

void main() {

    vec2 resolution = vec2(1.0 / uStepW, 1.0 / uStepH);
    vec2 position = vTexCoord * resolution;
    vec2 center = resolution * 0.5;

    float dist = distance(position, center);
    float maxDist = length(center);

    float vignette = smoothstep(uRadius * maxDist, (uRadius + uSoftness) * maxDist, dist);

    vec4 color = texture2D(uTexture, vTexCoord);
    
    color.rgb *= 1.0 + vignette;

    gl_FragColor = color;
}
  `

}



type FocusFilterOwnProps = {
  radius: number,
  softness: number,
  dark: boolean
}




type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class FocusFilter extends filters.BaseFilter<'FocusFilter', FocusFilterOwnProps>{
  static type = "FocusFilter"
  static defaults = {radius: 0.5, softness: 0.5, dark: true}
  static uniformLocations = ['uHalfSize', 'uSize', 'uRadius', 'uSoftness']

  declare radius: number
  declare softness: number
  declare dark: boolean


  getCacheKey() {
    return `${this.dark ? 'dark' : 'bright'}` as keyof typeof fragmentSource;
  }

  getFragmentSource(){
    return fragmentSource[this.getCacheKey()];
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

  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
    gl.uniform1f(uniformLocations.uRadius, this.radius)
    gl.uniform1f(uniformLocations.uSoftness, this.softness)
  }

}

classRegistry.setClass(FocusFilter)