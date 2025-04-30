import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;

  // Define the  function
    float transform_function(float x, float coeffs[4]) {
        return coeffs[0] * pow(x, 3.0) + coeffs[1] * pow(x, 2.0) + coeffs[2] * x + coeffs[3];
  }

void main() {
    // Coefficients for decrease and increase functions
    float dec_coeffs[4];
    dec_coeffs[0] = 0.000007;
    dec_coeffs[1] = -0.000817;
    dec_coeffs[2] = 0.724952;
    dec_coeffs[3] = 0.000000;

    float inc_coeffs[4];
    inc_coeffs[0] = -0.000012;
    inc_coeffs[1] = 0.002894;
    inc_coeffs[2] = 1.035397;
    inc_coeffs[3] = -0.000000;


  

    // Get the color from the texture

    vec4 color = texture2D(uTexture, vTexCoord);
    // vec4 color = vec4(1.0, 0.0, 1.0, 1.0);

   // we need to multiply by 255.0 first because the coeffiecient were calculated using image pixel range 0-255
    vec4 sum = vec4(0.0, 0.0, 0.0, 1.0);
    sum.r = clamp(transform_function(color.r * 255.0, dec_coeffs) / 255.0, 0.0, 1.0) ; 
    sum.b = clamp(transform_function(color.b * 255.0, inc_coeffs) / 255.0, 0.0, 1.0) ; 
    sum.g = color.g;

    // Output the final color
    gl_FragColor = sum;
}
`

type ColdFilterOwnProps = {
  apply: boolean,
}


export class ColdFilter extends filters.BaseFilter<'ColdFilter', ColdFilterOwnProps>{
  static type = "ColdFilter"
  static defaults = {apply: true}
  static uniformLocations = ['uHalfSize']
  

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return false
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
  
      // Apply the shader logic
      const newR = transform(r, dec_coeffs);
      const newB = transform(b, inc_coeffs);
  
      // Clamp results between 0–255
      data[i] = Math.min(Math.max(newR, 0), 255);
      data[i + 1] = g; // Green channel stays the same
      data[i + 2] = Math.min(Math.max(newB, 0), 255);
      data[i + 3] = a; // Alpha channel stays the same
    }
  }



}

classRegistry.setClass(ColdFilter)