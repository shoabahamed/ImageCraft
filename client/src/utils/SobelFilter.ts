import {filters, type T2DPipelineState, classRegistry} from "fabric"



// const fragmentSource = `
//   precision highp float;
//   uniform sampler2D uTexture;
//   varying vec2 vTexCoord;
//   uniform float uStepW;
//   uniform float uStepH;


// void main() {
//     vec4 sumH = vec4(0.0, 0.0, 0.0, 1.0);
//     vec4 sumV = vec4(0.0, 0.0, 0.0, 1.0);
//     vec4 c;
//     float gray;
//     vec2 stepSize = vec2(uStepW, uStepH); // step size  

//     // Vertical edge detection kernel
//     float uVKernel[9];
//     uVKernel[0] = -1.0;
//     uVKernel[1] = 0.0;
//     uVKernel[2] = 1.0;
//     uVKernel[3] =  -2.0;
//     uVKernel[4] =  0.0;
//     uVKernel[5] =  2.0;
//     uVKernel[6] =  -1.0;
//     uVKernel[7] =  0.0;
//     uVKernel[8] =  1.0;

//     // Horizontal edge detection kernel
//     float uHKernel[9];
//     uHKernel[0] = -1.0;
//     uHKernel[1] = -2.0;
//     uHKernel[2] = -1.0;
//     uHKernel[3] =  0.0;
//     uHKernel[4] =  0.0;
//     uHKernel[5] =  0.0;
//     uHKernel[6] =  1.0;
//     uHKernel[7] =  2.0;
//     uHKernel[8] =  1.0;

    


    
//     c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y - stepSize.y));
//     gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
//     sumH += vec4(vec3(gray), 1.0) * uHKernel[0];
//     sumV += vec4(vec3(gray), 1.0) * uVKernel[0];
    
//     c = texture2D(uTexture, vec2(vTexCoord.x, vTexCoord.y - stepSize.y));
//     gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
//     sumH += vec4(vec3(gray), 1.0) * uHKernel[1];
//     sumV += vec4(vec3(gray), 1.0) * uVKernel[1];
    
//     c = texture2D(uTexture, vec2(vTexCoord.x + stepSize.x, vTexCoord.y - stepSize.y));
//     gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
//     sumH += vec4(vec3(gray), 1.0) * uHKernel[2];
//     sumV += vec4(vec3(gray), 1.0) * uVKernel[2];
    
//     c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y));
//     gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
//     sumH += vec4(vec3(gray), 1.0) * uHKernel[3];
//     sumV += vec4(vec3(gray), 1.0) * uVKernel[3];
    
//     c = texture2D(uTexture, vec2(vTexCoord.x, vTexCoord.y));
//     gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
//     sumH += vec4(vec3(gray), 1.0) * uHKernel[4];
//     sumV += vec4(vec3(gray), 1.0) * uVKernel[4];
    
//     c = texture2D(uTexture, vec2(vTexCoord.x + stepSize.x, vTexCoord.y));
//     gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
//     sumH += vec4(vec3(gray), 1.0) * uHKernel[5];
//     sumV += vec4(vec3(gray), 1.0) * uVKernel[5];
    
//     c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y + stepSize.y));
//     gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
//     sumH += vec4(vec3(gray), 1.0) * uHKernel[6];
//     sumV += vec4(vec3(gray), 1.0) * uVKernel[6];
    
//     c = texture2D(uTexture, vec2(vTexCoord.x, vTexCoord.y + stepSize.y));
//     gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
//     sumH += vec4(vec3(gray), 1.0) * uHKernel[7];
//     sumV += vec4(vec3(gray), 1.0) * uVKernel[7];
    
//     c = texture2D(uTexture, vec2(vTexCoord.x + stepSize.x, vTexCoord.y + stepSize.y));
//     gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
//     sumH += vec4(vec3(gray), 1.0) * uHKernel[8];
//     sumV += vec4(vec3(gray), 1.0) * uVKernel[8];

//     vec4 magnitude = vec4(sqrt(sumH.rgb * sumH.rgb + sumV.rgb * sumV.rgb), 1.0);


//     gl_FragColor = magnitude;
// }
// `


  



const fragmentSource = `
precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    
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

    //   Horizontal edge detection kernel
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




  

    // 2. Sobel Edge Detection on Blurred Image
    vec3 sumH = vec3(0.0);
    vec3 sumV = vec3(0.0);
    vec2 offset;
    vec4 sample;
    float gray;
    

    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);

            
            sumH += sample.rgb * uHKernel[(y + 1) * 3 + (x + 1)];
            sumV += sample.rgb * uVKernel[(y + 1) * 3 + (x + 1)];
        }
    }

    vec4 magnitude = vec4(sqrt(sumH.rgb * sumH.rgb + sumV.rgb * sumV.rgb), 1.0);
    gl_FragColor = magnitude;
}
`;


// precision highp float;
// uniform sampler2D uTexture;
// varying vec2 vTexCoord;
// uniform float uStepW;
// uniform float uStepH;

// // 5x5 Gaussian kernel (σ = 1.0)
// float gaussianKernel[25];
// // float applyBlur(vec2 center) {
// //     float sum = 0.0;
// //     vec2 step = vec2(uStepW, uStepH);
    
// //     for(int y = -2; y <= 2; y++) {
// //         for(int x = -2; x <= 2; x++) {
// //             vec2 offset = vec2(float(x), float(y)) * step;
// //             vec4 color = texture2D(uTexture, center + offset);
// //             float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
// //             int kernelIndex = (y + 2) * 5 + (x + 2);
// //             sum += gray * gaussianKernel[kernelIndex];
// //         }
// //     }
// //     return sum;
// // }

// void main() {
//     vec4 sumH = vec4(0.0);
//     vec4 sumV = vec4(0.0);
//     vec2 stepSize = vec2(uStepW, uStepH);
//     float uVKernel[9];
//     uVKernel[0] = -1.0;
//     uVKernel[1] = 0.0;
//     uVKernel[2] = 1.0;
//     uVKernel[3] =  -2.0;
//     uVKernel[4] =  0.0;
//     uVKernel[5] =  2.0;
//     uVKernel[6] =  -1.0;
//     uVKernel[7] =  0.0;
//     uVKernel[8] =  1.0;

//     // Horizontal edge detection kernel
//     float uHKernel[9];
//     uHKernel[0] = -1.0;
//     uHKernel[1] = -2.0;
//     uHKernel[2] = -1.0;
//     uHKernel[3] =  0.0;
//     uHKernel[4] =  0.0;
//     uHKernel[5] =  0.0;
//     uHKernel[6] =  1.0;
//     uHKernel[7] =  2.0;
//     uHKernel[8] =  1.0;




//     vec4 c = vec4(0.0, 0.0, 0.0, 1.0);
//     float blurredGray;
//     // Apply blur and Sobel to 3x3 neighborhood
//     for(int y = -1; y <= 1; y++) {
//         for(int x = -1; x <= 1; x++) {
//             vec2 samplePos = vTexCoord + vec2(float(x), float(y)) * stepSize;
//             c = texture2D(uTexture, vec2(vTexCoord.x - stepSize.x, vTexCoord.y - stepSize.y))
//             blurredGray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
            
//             // int kernelIndex = ;
//             sumH += vec4(blurredGray) * uHKernel[(y + 1) * 3 + (x + 1)];
//             sumV += vec4(blurredGray) * uVKernel[(y + 1) * 3 + (x + 1)];
//         }
            
//     }

//     vec4 magnitude = vec4(sqrt(sumH.rgb * sumH.rgb + sumV.rgb * sumV.rgb), 1.0);
//     gl_FragColor = magnitude;
// }
// `;

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

  // sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
  //   gl.uniform1f(uniformLocations.uSharpenValue, this.SharpenValue)
  // }

}

classRegistry.setClass(SobelFilter)