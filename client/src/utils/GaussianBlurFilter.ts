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
  `
}  


// const fragmentSource = `
// precision highp float;
// uniform sampler2D uTexture;
// varying vec2 vTexCoord;
// uniform float uStepW;
// uniform float uStepH;
// uniform float uKernel[25];

// void main() {
//     vec2 stepSize = vec2(uStepW, uStepH);
//     vec4 sample;
//     vec2 offset;
//     vec3 blurred = vec3(0.0, 0.0, 0.0);

//     for(int y = -2; y <= 2; y++) {
//         for(int x = -2; x <= 2; x++) {
//             offset = vec2(float(x), float(y)) * stepSize;
//             sample = texture2D(uTexture, vTexCoord + offset);
            
//             blurred += sample.rgb * uKernel[(y + 2) * 5 + (x + 2)];
//         }
//     }


//     vec4 final = vec4(blurred, 1.0);
//     gl_FragColor = final;
// }
// `;


type GaussianBlurFilterOwnProps = {
  sigma: number,
  matrixSize: number,
}




type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class GaussianBlurFilter extends filters.BaseFilter<'SobelFilter', GaussianBlurFilterOwnProps >{
  static type = "GaussianFilter"
  static defaults = {sigma: 1.0, matrixSize: 5}
  static uniformLocations = ['uHalfSize', 'uSize', 'uKernel']
  declare sigma: number;
  declare matrixSize: number;


  getCacheKey() {
    console.log(this.matrixSize)
    return `conv_${this.matrixSize}` as keyof typeof fragmentSource;
  }

  getFragmentSource(){
    return fragmentSource[this.getCacheKey()];
  }

  isNeutralState() {
    return this.sigma === 0
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
  
   
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