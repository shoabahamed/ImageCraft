import {filters, type T2DPipelineState, classRegistry} from "fabric"







const fragmentSource = `
precision highp float;
uniform sampler2D uTexture; // Input: Texture with normalized gx in R, gy in G
varying vec2 vTexCoord;
uniform float uStepW;       // Texel width: 1.0 / texture_width
uniform float uStepH;       // Texel height: 1.0 / texture_height

const float PI = 3.141592653589793;

void main() {
    // 1. Sample the central pixel to get normalized gradients
    vec4 centralNormalizedGradients = texture2D(uTexture, vTexCoord);
    float norm_gx_center = centralNormalizedGradients.r;
    float norm_gy_center = centralNormalizedGradients.g;

    // 2. Denormalize central gradients
    float gx_center = (norm_gx_center - 0.5) * 8.0;
    float gy_center = (norm_gy_center - 0.5) * 8.0;

    // 3. Calculate central gradient magnitude and angle
    float mag_center = sqrt(gx_center * gx_center + gy_center * gy_center);
    
    float angle_radians = atan(gy_center, gx_center); // Angle in radians [-PI, PI]
    float angle_degrees = angle_radians * (180.0 / PI);

    if (angle_degrees < 0.0) {
        angle_degrees += 180.0; // Normalize to [0, 180) degrees
    }

    // 4. Determine neighbor pixels based on gradient angle (Python-like conditions)
    vec2 offset1, offset2;

    // Angle 0 (Horizontal): 0 <= angle < 22.5 OR 157.5 <= angle <= 180
    if ((angle_degrees >= 0.0 && angle_degrees < 22.5) || (angle_degrees >= 157.5 && angle_degrees <= 180.0)) {
        offset1 = vec2(uStepW, 0.0);  // East
        offset2 = vec2(-uStepW, 0.0); // West
    }
    // Angle 45: 22.5 <= angle < 67.5
    else if (angle_degrees >= 22.5 && angle_degrees < 67.5) {
        offset1 = vec2(uStepW, -uStepH);  // North-East
        offset2 = vec2(-uStepW, uStepH); // South-West
    }
    // Angle 90 (Vertical): 67.5 <= angle < 112.5
    else if (angle_degrees >= 67.5 && angle_degrees < 112.5) {
        offset1 = vec2(0.0, -uStepH); // North
        offset2 = vec2(0.0, uStepH);  // South
    }
    // Angle 135: 112.5 <= angle < 157.5
    else if (angle_degrees >= 112.5 && angle_degrees < 157.5) {
        offset1 = vec2(-uStepW, -uStepH); // North-West
        offset2 = vec2(uStepW, uStepH);   // South-East
    }
    // Default case (should ideally not be hit if logic is exhaustive for [0,180])
    // Handling potential edge cases or very specific angles not perfectly fitting above conditions.
    // For safety, let's default to horizontal, or you can choose to output 0 to indicate an issue.
    else {
        offset1 = vec2(uStepW, 0.0);
        offset2 = vec2(-uStepW, 0.0);
    }

    // 5. Get normalized gradients of neighbors and calculate their magnitudes
    vec4 norm_grad_neighbor1 = texture2D(uTexture, vTexCoord + offset1);
    float gx_n1 = (norm_grad_neighbor1.r - 0.5) * 8.0;
    float gy_n1 = (norm_grad_neighbor1.g - 0.5) * 8.0;
    float mag_n1 = sqrt(gx_n1 * gx_n1 + gy_n1 * gy_n1);

    vec4 norm_grad_neighbor2 = texture2D(uTexture, vTexCoord + offset2);
    float gx_n2 = (norm_grad_neighbor2.r - 0.5) * 8.0;
    float gy_n2 = (norm_grad_neighbor2.g - 0.5) * 8.0;
    float mag_n2 = sqrt(gx_n2 * gx_n2 + gy_n2 * gy_n2);

    // 6. Perform non-maximum suppression
    float output_value = 0.0;
    // If central magnitude is greater than or equal to both neighbors, it's a local maximum
    if (mag_center >= mag_n1 && mag_center >= mag_n2) {
        output_value = mag_center; 
    }

    gl_FragColor = vec4(output_value, output_value, output_value, 1.0);

}
`;




type NonMaximumSupressionOwnProps = {
  apply: boolean
}




// type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class NonMaximumSupression extends filters.BaseFilter<'NonMaximumSupression', NonMaximumSupressionOwnProps>{
  static type = "NonMaximumSupression"
  static defaults = {apply: true}
  static uniformLocations = ['uHalfSize', 'uSize']


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



}

classRegistry.setClass(NonMaximumSupression)