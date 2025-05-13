import {filters, type T2DPipelineState, classRegistry} from "fabric"


const fragmentSource = {
  bilateral_5: `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;
  uniform float uSpatialKernel[25];
  uniform float uSigmaColor;

  void main() {
      vec2 stepSize = vec2(uStepW, uStepH);
      vec4 centerSample = texture2D(uTexture, vTexCoord);
      vec3 centerColor = centerSample.rgb;
      vec3 sum = vec3(0.0);
      float totalWeight = 0.0;
   

      for(int y = -2; y <= 2; y++) {
          for(int x = -2; x <= 2; x++) {
              vec2 offset = vec2(float(x), float(y)) * stepSize;
              vec4 neighborSample = texture2D(uTexture, vTexCoord + offset);
              vec3 neighborColor = neighborSample.rgb;
              
              // Spatial weight from precomputed kernel
              float spatialWeight = uSpatialKernel[(y + 2) * 5 + (x + 2)];
              
              // Color distance weight
              float colorDistance = length(neighborColor - centerColor);
              float rangeWeight = exp(-(colorDistance * colorDistance) / (2.0 * uSigmaColor * uSigmaColor));
              
              // Combined weight
              float weight = spatialWeight * rangeWeight;
              
              sum += neighborColor * weight;
              totalWeight += weight;
          }
      }

      vec3 result = totalWeight > 0.0 ? sum / totalWeight : centerColor;
      gl_FragColor = vec4(result, centerSample.a);
  }
  `,
  bilateral_7: `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;
  uniform float uSpatialKernel[49];
  uniform float uSigmaColor;

  void main() {
      vec2 stepSize = vec2(uStepW, uStepH);
      vec4 centerSample = texture2D(uTexture, vTexCoord);
      vec3 centerColor = centerSample.rgb;
      vec3 sum = vec3(0.0);
      float totalWeight = 0.0;
   
      for(int y = -3; y <= 3; y++) {
          for(int x = -3; x <= 3; x++) {
              vec2 offset = vec2(float(x), float(y)) * stepSize;
              vec4 neighborSample = texture2D(uTexture, vTexCoord + offset);
              vec3 neighborColor = neighborSample.rgb;
              
              float spatialWeight = uSpatialKernel[(y + 3) * 7 + (x + 3)];
              float colorDistance = length(neighborColor - centerColor);
              float rangeWeight = exp(-(colorDistance * colorDistance) / (2.0 * uSigmaColor * uSigmaColor));
              
              float weight = spatialWeight * rangeWeight;
              
              sum += neighborColor * weight;
              totalWeight += weight;
          }
      }

      vec3 result = totalWeight > 0.0 ? sum / totalWeight : centerColor;
      gl_FragColor = vec4(result, centerSample.a);
  }
  `,
  bilateral_9: `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;
  uniform float uSpatialKernel[81];
  uniform float uSigmaColor;

  void main() {
      vec2 stepSize = vec2(uStepW, uStepH);
      vec4 centerSample = texture2D(uTexture, vTexCoord);
      vec3 centerColor = centerSample.rgb;
      vec3 sum = vec3(0.0);
      float totalWeight = 0.0;
   
      for(int y = -4; y <= 4; y++) {
          for(int x = -4; x <= 4; x++) {
              vec2 offset = vec2(float(x), float(y)) * stepSize;
              vec4 neighborSample = texture2D(uTexture, vTexCoord + offset);
              vec3 neighborColor = neighborSample.rgb;
              
              float spatialWeight = uSpatialKernel[(y + 4) * 9 + (x + 4)];
              float colorDistance = length(neighborColor - centerColor);
              float rangeWeight = exp(-(colorDistance * colorDistance) / (2.0 * uSigmaColor * uSigmaColor));
              
              float weight = spatialWeight * rangeWeight;
              
              sum += neighborColor * weight;
              totalWeight += weight;
          }
      }

      vec3 result = totalWeight > 0.0 ? sum / totalWeight : centerColor;
      gl_FragColor = vec4(result, centerSample.a);
  }
  `,
  bilateral_11: `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;
  uniform float uSpatialKernel[121];
  uniform float uSigmaColor;

  void main() {
      vec2 stepSize = vec2(uStepW, uStepH);
      vec4 centerSample = texture2D(uTexture, vTexCoord);
      vec3 centerColor = centerSample.rgb;
      vec3 sum = vec3(0.0);
      float totalWeight = 0.0;
   
      for(int y = -5; y <= 5; y++) {
          for(int x = -5; x <= 5; x++) {
              vec2 offset = vec2(float(x), float(y)) * stepSize;
              vec4 neighborSample = texture2D(uTexture, vTexCoord + offset);
              vec3 neighborColor = neighborSample.rgb;
              
              float spatialWeight = uSpatialKernel[(y + 5) * 11 + (x + 5)];
              float colorDistance = length(neighborColor - centerColor);
              float rangeWeight = exp(-(colorDistance * colorDistance) / (2.0 * uSigmaColor * uSigmaColor));
              
              float weight = spatialWeight * rangeWeight;
              
              sum += neighborColor * weight;
              totalWeight += weight;
          }
      }

      vec3 result = totalWeight > 0.0 ? sum / totalWeight : centerColor;
      gl_FragColor = vec4(result, centerSample.a);
  }
  `,
  bilateral_13: `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;
  uniform float uSpatialKernel[169];
  uniform float uSigmaColor;

  void main() {
      vec2 stepSize = vec2(uStepW, uStepH);
      vec4 centerSample = texture2D(uTexture, vTexCoord);
      vec3 centerColor = centerSample.rgb;
      vec3 sum = vec3(0.0);
      float totalWeight = 0.0;
   
      for(int y = -6; y <= 6; y++) {
          for(int x = -6; x <= 6; x++) {
              vec2 offset = vec2(float(x), float(y)) * stepSize;
              vec4 neighborSample = texture2D(uTexture, vTexCoord + offset);
              vec3 neighborColor = neighborSample.rgb;
              
              float spatialWeight = uSpatialKernel[(y + 6) * 13 + (x + 6)];
              float colorDistance = length(neighborColor - centerColor);
              float rangeWeight = exp(-(colorDistance * colorDistance) / (2.0 * uSigmaColor * uSigmaColor));
              
              float weight = spatialWeight * rangeWeight;
              
              sum += neighborColor * weight;
              totalWeight += weight;
          }
      }

      vec3 result = totalWeight > 0.0 ? sum / totalWeight : centerColor;
      gl_FragColor = vec4(result, centerSample.a);
  }
  `,
  bilateral_15: `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;
  uniform float uSpatialKernel[225];
  uniform float uSigmaColor;

  void main() {
      vec2 stepSize = vec2(uStepW, uStepH);
      vec4 centerSample = texture2D(uTexture, vTexCoord);
      vec3 centerColor = centerSample.rgb;
      vec3 sum = vec3(0.0);
      float totalWeight = 0.0;
   
      for(int y = -7; y <= 7; y++) {
          for(int x = -7; x <= 7; x++) {
              vec2 offset = vec2(float(x), float(y)) * stepSize;
              vec4 neighborSample = texture2D(uTexture, vTexCoord + offset);
              vec3 neighborColor = neighborSample.rgb;
              
              float spatialWeight = uSpatialKernel[(y + 7) * 15 + (x + 7)];
              float colorDistance = length(neighborColor - centerColor);
              float rangeWeight = exp(-(colorDistance * colorDistance) / (2.0 * uSigmaColor * uSigmaColor));
              
              float weight = spatialWeight * rangeWeight;
              
              sum += neighborColor * weight;
              totalWeight += weight;
          }
      }

      vec3 result = totalWeight > 0.0 ? sum / totalWeight : centerColor;
      gl_FragColor = vec4(result, centerSample.a);
  }
  `
};




type BilateralFilterOwnProps = {
  sigmaS: number,
  sigmaC: number,
  kernelSize: number,
}




type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class BilateralFilter extends filters.BaseFilter<'BilateralFilter', BilateralFilterOwnProps >{
  static type = "BilateralFilter"
  static defaults = {sigmaS: 1.0, sigmaC: 1.0, kernelSize: 5}
  static uniformLocations = ['uSpatialKernel', 'uSigmaColor'];
  declare sigmaS: number;
  declare sigmaC: number;
  declare kernelSize: number;

  getCacheKey() {
    return `bilateral_${this.kernelSize}` as keyof typeof fragmentSource;
  }

  getFragmentSource(){
    return fragmentSource[this.getCacheKey()];
  }


  isNeutralState() {
    return this.sigmaS === 0 || this.sigmaC === 0;
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    const spatialKernel = this.getGaussianKernel(this.sigmaS, this.kernelSize);
    const k = Math.floor(this.kernelSize / 2);
    const tempData = new Uint8ClampedArray(data.length);
    
    // Copy original data to temp array
    tempData.set(data);

    // Apply bilateral filtering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const centerIdx = (y * width + x) * 4;
        const centerR = tempData[centerIdx];
        const centerG = tempData[centerIdx + 1];
        const centerB = tempData[centerIdx + 2];
        
        let sumR = 0, sumG = 0, sumB = 0;
        let totalWeight = 0;

        // Apply kernel to each pixel
        for (let ky = -k; ky <= k; ky++) {
          for (let kx = -k; kx <= k; kx++) {
            const posX = Math.min(Math.max(x + kx, 0), width - 1);
            const posY = Math.min(Math.max(y + ky, 0), height - 1);
            const idx = (posY * width + posX) * 4;
            const kernelIdx = (ky + k) * this.kernelSize + (kx + k);
            
            // Get spatial weight from precomputed kernel
            const spatialWeight = spatialKernel[kernelIdx];
            
            // Calculate color distance weight
            const colorDiffR = tempData[idx] - centerR;
            const colorDiffG = tempData[idx + 1] - centerG;
            const colorDiffB = tempData[idx + 2] - centerB;
            const colorDistance = Math.sqrt(
              colorDiffR * colorDiffR +
              colorDiffG * colorDiffG +
              colorDiffB * colorDiffB
            );
            
            // Calculate range weight using Gaussian function
            const rangeWeight = Math.exp(
              -(colorDistance * colorDistance) / 
              (2 * this.sigmaC * this.sigmaC)
            );
            
            // Combined weight
            const weight = spatialWeight * rangeWeight;
            
            // Accumulate weighted values
            sumR += tempData[idx] * weight;
            sumG += tempData[idx + 1] * weight;
            sumB += tempData[idx + 2] * weight;
            totalWeight += weight;
          }
        }

        // Normalize and set the result
        if (totalWeight > 0) {
          data[centerIdx] = sumR / totalWeight;
          data[centerIdx + 1] = sumG / totalWeight;
          data[centerIdx + 2] = sumB / totalWeight;
        }
        // Preserve alpha channel
        data[centerIdx + 3] = tempData[centerIdx + 3];
      }
    }
  }

  getGaussianKernel(sigma: number, kernelSize: number = 5): number[] {
    // Ensure kernel size is odd
    if (kernelSize % 2 === 0) {
        kernelSize += 1;
    }

    const k = Math.floor(kernelSize / 2);
    const kernel: number[] = [];
    let sum = 0;

    // Generate the 2D Gaussian kernel
    for (let y = -k; y <= k; y++) {
        for (let x = -k; x <= k; x++) {
            // Gaussian formula: (1 / (2 * π * σ²)) * e^(-(x² + y²) / (2 * σ²))
            const exponent = -(x * x + y * y) / (2 * sigma * sigma);
            const value = (1 / (2 * Math.PI * sigma * sigma)) * Math.exp(exponent);
            
            kernel.push(value);
            sum += value;
        }
    }
    console.log(kernelSize)
    console.log(sigma)
    // Normalize the kernel
    return kernel.map(value => value / sum);
}




sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
  // Send precomputed spatial kernel
  const spatialKernel = this.getGaussianKernel(this.sigmaS, this.kernelSize);
  gl.uniform1fv(uniformLocations.uSpatialKernel, spatialKernel);
  
  // Send color sigma squared
  gl.uniform1f(uniformLocations.uSigmaColor, this.sigmaC);
}



}

classRegistry.setClass(BilateralFilter)