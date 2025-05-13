import {filters, type T2DPipelineState, classRegistry} from "fabric"



  



const fragmentSource = {
  dark:`
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uRadius;    // vignette size factor [0.0 - 1.0]
uniform float uSoftness;  // vignette fade factor [0.0 - 1.0]

void main() {

    vec2 resolution = vec2(1.0 / uStepW, 1.0 / uStepH);
    vec2 position = vTexCoord * resolution;
    vec2 center = resolution * 0.5;

    float dist = distance(position, center);
    float maxDist = length(center);

    float vignette = smoothstep(uRadius * maxDist, (uRadius + uSoftness) * maxDist, dist);

    vec4 color = texture2D(uTexture, vTexCoord);
    
    color.rgb *= 1.0 - vignette;

    gl_FragColor = color;
}
`,

  bright: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;
uniform float uRadius;    // vignette size factor [0.0 - 1.0]
uniform float uSoftness;  // vignette fade factor [0.0 - 1.0]

void main() {

    vec2 resolution = vec2(1.0 / uStepW, 1.0 / uStepH);
    vec2 position = vTexCoord * resolution;
    vec2 center = resolution * 0.5;

    float dist = distance(position, center);
    float maxDist = length(center);

    float vignette = smoothstep(uRadius * maxDist, (uRadius + uSoftness) * maxDist, dist);

    vec4 color = texture2D(uTexture, vTexCoord);
    
    color.rgb *= 1.0 + vignette;

    gl_FragColor = color;
}
  `

}



type FocusFilterOwnProps = {
  radius: number,
  softness: number,
  dark: boolean
}




type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class FocusFilter extends filters.BaseFilter<'FocusFilter', FocusFilterOwnProps>{
  static type = "FocusFilter"
  static defaults = {radius: 0.5, softness: 0.5, dark: true}
  static uniformLocations = ['uHalfSize', 'uSize', 'uRadius', 'uSoftness']

  declare radius: number
  declare softness: number
  declare dark: boolean


  getCacheKey() {
    return `${this.dark ? 'dark' : 'bright'}` as keyof typeof fragmentSource;
  }

  getFragmentSource(){
    return fragmentSource[this.getCacheKey()];
  }

  isNeutralState() {
    return false
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
    const radius = this.radius * maxDist;
    const softness = this.softness * maxDist;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const dist = Math.sqrt(
          Math.pow(x - centerX, 2) + 
          Math.pow(y - centerY, 2)
        );

        // Calculate vignette effect
        const vignette = this.smoothstep(radius, radius + softness, dist);
        const factor = this.dark ? (1.0 - vignette) : (1.0 + vignette);

        // Apply the vignette effect to each color channel
        data[index] = Math.min(255, Math.max(0, data[index] * factor));     // R
        data[index + 1] = Math.min(255, Math.max(0, data[index + 1] * factor)); // G
        data[index + 2] = Math.min(255, Math.max(0, data[index + 2] * factor)); // B
        // Alpha channel remains unchanged
      }
    }
  }

  // Helper function to match GLSL smoothstep behavior
  private smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
    gl.uniform1f(uniformLocations.uRadius, this.radius)
    gl.uniform1f(uniformLocations.uSoftness, this.softness)
  }

}

classRegistry.setClass(FocusFilter)