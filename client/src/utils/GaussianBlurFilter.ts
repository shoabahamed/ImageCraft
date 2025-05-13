import {filters, type T2DPipelineState, classRegistry} from "fabric"

const fragmentSource = {
  conv_3: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uKernel[9];

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    vec3 blurred = vec3(0.0, 0.0, 0.0);

    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            blurred += sample.rgb * uKernel[(y + 1) * 3 + (x + 1)];
        }
    }


    vec4 final = vec4(blurred, 1.0);
    gl_FragColor = final;
}
  `,
  conv_5: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uKernel[25];

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    vec3 blurred = vec3(0.0, 0.0, 0.0);

    for(int y = -2; y <= 2; y++) {
        for(int x = -2; x <= 2; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            blurred += sample.rgb * uKernel[(y + 2) * 5 + (x + 2)];
        }
    }


    vec4 final = vec4(blurred, 1.0);
    gl_FragColor = final;
}
  `,
  conv_7: `
  
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uKernel[49];

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    vec3 blurred = vec3(0.0, 0.0, 0.0);

    for(int y = -3; y <= 3; y++) {
        for(int x = -3; x <= 3; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            blurred += sample.rgb * uKernel[(y + 3) * 7 + (x + 3)];
        }
    }


    vec4 final = vec4(blurred, 1.0);
    gl_FragColor = final;
}

  `,

  conv_9: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uKernel[81];

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    vec3 blurred = vec3(0.0, 0.0, 0.0);

    for(int y = -4; y <= 4; y++) {
        for(int x = -4; x <= 4; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            blurred += sample.rgb * uKernel[(y + 4) * 9 + (x + 4)];
        }
    }


    vec4 final = vec4(blurred, 1.0);
    gl_FragColor = final;
}
  `,
  conv_11: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uKernel[121];

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    vec3 blurred = vec3(0.0, 0.0, 0.0);

    for(int y = -5; y <= 5; y++) {
        for(int x = -5; x <= 5; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            blurred += sample.rgb * uKernel[(y + 5) * 11 + (x + 5)];
        }
    }

    vec4 final = vec4(blurred, 1.0);
    gl_FragColor = final;
}
  `,
  conv_13: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uKernel[169];

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    vec3 blurred = vec3(0.0, 0.0, 0.0);

    for(int y = -6; y <= 6; y++) {
        for(int x = -6; x <= 6; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            blurred += sample.rgb * uKernel[(y + 6) * 13 + (x + 6)];
        }
    }

    vec4 final = vec4(blurred, 1.0);
    gl_FragColor = final;
}
  `,
  conv_15: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uKernel[225];

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    vec3 blurred = vec3(0.0, 0.0, 0.0);

    for(int y = -7; y <= 7; y++) {
        for(int x = -7; x <= 7; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            blurred += sample.rgb * uKernel[(y + 7) * 15 + (x + 7)];
        }
    }

    vec4 final = vec4(blurred, 1.0);
    gl_FragColor = final;
}
  `
}  




type GaussianBlurFilterOwnProps = {
  sigma: number,
  matrixSize: number,
}




type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class GaussianBlurFilter extends filters.BaseFilter<'GaussianBlurilter', GaussianBlurFilterOwnProps >{
  static type = "GaussianFilter"
  static defaults = {sigma: 1.0, matrixSize: 5}
  static uniformLocations = ['uHalfSize', 'uSize', 'uKernel']
  declare sigma: number;
  declare matrixSize: number;


  getCacheKey() {
    return `conv_${this.matrixSize}` as keyof typeof fragmentSource;
  }

  getFragmentSource(){
    return fragmentSource[this.getCacheKey()];
  }

  isNeutralState() {
    return this.sigma === 0
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    const kernel = this.getGaussianKernel(this.sigma, this.matrixSize);
    const k = Math.floor(this.matrixSize / 2);
    const tempData = new Uint8ClampedArray(data.length);
    
    // Copy original data to temp array
    tempData.set(data);

    // Apply convolution
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        
        // Apply kernel to each pixel
        for (let ky = -k; ky <= k; ky++) {
          for (let kx = -k; kx <= k; kx++) {
            const posX = Math.min(Math.max(x + kx, 0), width - 1);
            const posY = Math.min(Math.max(y + ky, 0), height - 1);
            const idx = (posY * width + posX) * 4;
            const kernelIdx = (ky + k) * this.matrixSize + (kx + k);
            
            r += tempData[idx] * kernel[kernelIdx];
            g += tempData[idx + 1] * kernel[kernelIdx];
            b += tempData[idx + 2] * kernel[kernelIdx];
            a += tempData[idx + 3] * kernel[kernelIdx];
          }
        }

        // Set the result
        const outIdx = (y * width + x) * 4;
        data[outIdx] = r;
        data[outIdx + 1] = g;
        data[outIdx + 2] = b;
        data[outIdx + 3] = a;
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
    const matrix = this.getGaussianKernel(this.sigma, this.matrixSize)
    gl.uniform1fv(uniformLocations.uKernel, matrix)
  }

}

classRegistry.setClass(GaussianBlurFilter)