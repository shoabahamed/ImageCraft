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
uniform float uLowThreshold;
uniform float uHighThreshold;


void main() {
    vec4 sample = texture2D(uTexture, vTexCoord);
    float magnitude = sample.r;
    float output_value = 0.0;

    // gl_FragColor = vec4(magnitude, magnitude, magnitude, 1.0);
    if (magnitude >= uHighThreshold) {
          output_value = 1.0;  // Strong edge
      }
      else if (magnitude > uLowThreshold) {
          output_value = 0.5;  // Weak edge
      }

    gl_FragColor = vec4(output_value, output_value, output_value, 1.0);

}
`;




type DoubleThresholdingOwnProps = {
  lowThreshold: number
  highThreshold: number
}




type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class DoubleThresholding extends filters.BaseFilter<'DoubleThresholding', DoubleThresholdingOwnProps>{
  static type = "DoubleThresholding"
  static defaults = {lowThreshold: 10, highThreshold: 20}
  static uniformLocations = ['uLowThreshold', 'uHighThreshold']

  declare lowThreshold: number
  declare highThreshold: number

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return false
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    // This is a GPU-based filter. applyTo2d is a CPU fallback.
    // Add a dummy operation to satisfy the linter if CPU fallback is not implemented.
    if (process.env.NODE_ENV === 'development') {
      console.log('NonMaximumSupression applyTo2d called (CPU fallback not implemented)', data, width, height);
    }
  }

  
  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
    console.log(this.lowThreshold, this.highThreshold)
    gl.uniform1f(uniformLocations.uLowThreshold, this.lowThreshold / 255)
    gl.uniform1f(uniformLocations.uHighThreshold, this.highThreshold / 255)
  }


}

classRegistry.setClass(DoubleThresholding)