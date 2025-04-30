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
    sum.r = clamp(transform_function(color.r * 255.0, inc_coeffs) / 255.0, 0.0, 1.0) ; 
    sum.b = clamp(transform_function(color.b * 255.0, dec_coeffs) / 255.0, 0.0, 1.0) ; 
    sum.g = color.g;

    // Output the final color
    gl_FragColor = sum;
}
`

type WarmFilterOwnProps = {
  apply: boolean,
}


export class WarmFilter extends filters.BaseFilter<'WarmFilter', WarmFilterOwnProps>{
  static type = "WarmFilter"
  static defaults = {apply: true}
  static uniformLocations = ['uHalfSize']
  

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return false
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    const kernel = [
      0, -1,  0,
     -1,  4, -1,
      0, -1,  0
    ];
   
     
  }



}

classRegistry.setClass(WarmFilter)