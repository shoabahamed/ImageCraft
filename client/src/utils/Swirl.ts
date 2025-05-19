import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;
  uniform float uStepW;
  uniform float uStepH;
  uniform float uRadius;
  uniform float uAngle;
  uniform vec2 uCenter;


  void main() {
    vec2 coord = vTexCoord;
    vec2 center = uCenter;

    vec2 offset = coord - center;
    float dist = length(offset);

    if (dist < uRadius) {
        float percent = (uRadius - dist) / uRadius;
        float theta = percent * percent * uAngle;

        float s = sin(theta);
        float c = cos(theta);

        offset = vec2(
            offset.x * c - offset.y * s,
            offset.x * s + offset.y * c
        );

        coord = center + offset;
    }

    vec4 color = texture2D(uTexture, coord);
    gl_FragColor = color;
  }
`

type SwirlOwnProps = {
  center: {x: number, y: number},
  radius: number,
  angle: number,
}

  // // Function to generate a pseudo-random number


type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class Swirl extends filters.BaseFilter<'Swirl', SwirlOwnProps>{
  static type = "Swirl"
  static defaults = {center: {x: 0.5, y: 0.5}, radius: 0.5, angle: 1.0}
  static uniformLocations = ['uHalfSize', 'uCenter', 'uRadius', 'uAngle']
  declare center: {x: number, y: number}
  declare radius: number
  declare angle: number

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
    gl.uniform1f(uniformLocations.uAngle, this.angle)
    gl.uniform2f(uniformLocations.uCenter, this.center.x, this.center.y)
  }

}

classRegistry.setClass(Swirl)