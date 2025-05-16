import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform vec2 uCenter;
  uniform float uStrength;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;


  float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
  }
  void main() {
      vec4 color = vec4(0.0);
      float total = 0.0;
      vec2 texSize = vec2(1.0/uStepW, 1.0/uStepH);
      vec2 toCenter = uCenter - vTexCoord * texSize;
      
      /* randomize the lookup values to hide the fixed number of samples */
      float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
      
      for (float t = 0.0; t <= 40.0; t++) {
          float percent = (t + offset) / 40.0;
          float weight = 4.0 * (percent - percent * percent);
          vec4 sample = texture2D(uTexture, vTexCoord + toCenter * percent * uStrength / texSize);
        
          /* switch to pre-multiplied alpha to correctly blur transparent images */
          sample.rgb *= sample.a;
          
          color += sample * weight;
          total += weight;
      }
      
      gl_FragColor = color / total;
      
      /* switch back from pre-multiplied alpha */
      gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
      // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

type ZoomBlurOwnProps = {
  center: {x: number, y: number},
  strength: number,
}

  // // Function to generate a pseudo-random number


type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class ZoomBlur extends filters.BaseFilter<'ZoomBlur', ZoomBlurOwnProps>{
  static type = "ZoomBlur"
  static defaults = {center: {x: 100, y: 200}, strength: 1.0}
  static uniformLocations = ['uHalfSize', 'uCenter', 'uStrength']
  declare center: {x: number, y: number}
  declare strength: number

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return this.strength === 0.0
  }

  applyTo2d({ imageData: { data } }: T2DPipelineState) {
    // Define the polynomial transformation function
    const transform = (x: number, coeffs: number[]) => {
      return (
        coeffs[0] * Math.pow(x, 3) +
        coeffs[1] * Math.pow(x, 2) +
        coeffs[2] * x +
        coeffs[3]
      );
    };
  
    // Coefficients matching the shader
    const dec_coeffs = [0.000007, -0.000817, 0.724952, 0.000000];
    const inc_coeffs = [-0.000012, 0.002894, 1.035397, -0.000000];
  
    for (let i = 0; i < data.length; i += 4) {
      // Read RGB values (0–255)
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
  
      // Apply the shader logic (inverse of cold filter)
      const newR = transform(r, inc_coeffs);  // Increase red
      const newB = transform(b, dec_coeffs);  // Decrease blue
  
      // Clamp results between 0–255
      data[i] = Math.min(Math.max(newR, 0), 255);
      data[i + 1] = g; // Green channel stays the same
      data[i + 2] = Math.min(Math.max(newB, 0), 255);
      data[i + 3] = a; // Alpha channel stays the same
    }
  }

  

  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
    gl.uniform1f(uniformLocations.uStrength, this.strength)
    gl.uniform2f(uniformLocations.uCenter, this.center.x, this.center.y)
  }

}

classRegistry.setClass(ZoomBlur)