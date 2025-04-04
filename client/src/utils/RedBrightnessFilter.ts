import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uRBrightness;
  varying vec2 vTexCoord;
  void main() {
    vec4 color =  texture2D(uTexture, vTexCoord);
    color.r += uRBrightness;
    gl_FragColor = color;
  }
`

type RBrightnessOwnProps = {
  RBrightness: number
}

type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class RBrightness extends filters.BaseFilter<'RBrightness', RBrightnessOwnProps>{
  static type = "RBrightness"
  static defaults = {RBrightness: 0}
  static uniformLocations = ['uRBrightness']
  declare RBrightness: number

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return this.RBrightness === 0
  }

  applyTo2d({ imageData: { data } }: T2DPipelineState) {
    const RBrightness = Math.round(this.RBrightness * 255);
    for (let i = 0; i < data.length; i += 4) {
      data[i] += RBrightness // R
    }
  }

  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
    gl.uniform1f(uniformLocations.uRBrightness, this.RBrightness)
  }

}

classRegistry.setClass(RBrightness)