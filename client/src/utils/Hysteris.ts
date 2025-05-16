import {filters, type T2DPipelineState, classRegistry} from "fabric"

const fragmentSource = `precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    float hasStrongEdge = 0.0;
    float centerValue = texture2D(uTexture, vTexCoord).r;

    // If center pixel is already a strong edge (1.0), keep it
    if (centerValue >= 0.99) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        return;
    }

    // Check 3x3 neighborhood for strong edges
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            // If any neighbor is a strong edge (1.0), mark this pixel as strong
            if (sample.r >= 0.99) {
                hasStrongEdge = 1.0;
                break;
            }
        }
        if (hasStrongEdge >= 0.99) break;
    }

    // If center is a weak edge (0.5) and has a strong neighbor, make it strong. making sure that the edge is not 0
    if (centerValue >= 0.49 && centerValue <= 0.51 && hasStrongEdge >= 0.99) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
`



type HysterisOwnProps = {
  apply: boolean
}


export class Hysteris extends filters.BaseFilter<'Hysteris', HysterisOwnProps >{
  static type = "Hysteris"
  static defaults = {apply: true}
  static uniformLocations = ['uStepW', 'uStepH']
  declare apply: boolean;

  

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return false
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    console.log("Hysteris applyTo2d called (CPU fallback not implemented)", data, width, height);
  }
}

classRegistry.setClass(Hysteris)