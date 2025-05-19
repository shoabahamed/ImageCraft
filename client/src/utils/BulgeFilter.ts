import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;
  uniform float uRadius;
  uniform float uStrength;
  uniform vec2 uCenter;


  void main() {
    vec2 coord = vTexCoord;
    vec2 center = uCenter;

    vec2 offset = coord - center;
    float dist = length(offset);

    if (dist < uRadius) {
        float percent = dist / uRadius;

        if(uStrength > 0.0){
          offset *= mix(1.0, smoothstep(0.0, uRadius / dist, percent), uStrength * 0.75);
        } else {
          offset *= mix(1.0, pow(percent, 1.0 + uStrength * 0.75) * uRadius / dist, 1.0 - percent);
        }

        coord = center + offset;
    }

    vec4 color = texture2D(uTexture, coord);
    gl_FragColor = color;
  }
`

type BulgeFilterOwnProps = {
  center: {x: number, y: number},
  radius: number,
  strength: number,
}

  // // Function to generate a pseudo-random number


type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class BulgeFilter extends filters.BaseFilter<'BulgeFilter', BulgeFilterOwnProps>{
  static type = "BulgeFilter"
  static defaults = {center: {x: 0.5, y: 0.5}, radius: 0.5, strength: 0.5}
  static uniformLocations = ['uHalfSize', 'uCenter', 'uRadius', 'uStrength']
  declare center: {x: number, y: number}
  declare radius: number
  declare strength: number

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return this.radius === 0.0
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
    gl.uniform1f(uniformLocations.uRadius, this.radius)
    gl.uniform1f(uniformLocations.uStrength, this.strength)
    gl.uniform2f(uniformLocations.uCenter, this.center.x, this.center.y)
  }

}

classRegistry.setClass(BulgeFilter)