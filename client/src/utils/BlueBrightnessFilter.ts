import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uBBrightness;
  varying vec2 vTexCoord;
  void main() {
    vec4 color =  texture2D(uTexture, vTexCoord);
    color.b += uBBrightness;
    gl_FragColor = color;
  }
`

type BBrightnessOwnProps = {
  BBrightness: number
}

type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class BBrightness extends filters.BaseFilter<'BBrightness', BBrightnessOwnProps>{
  static type = "BBrightness"
  static defaults = {BBrightness: 0}
  static uniformLocations = ['uBBrightness']
  declare BBrightness: number

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return this.BBrightness === 0
  }

  applyTo2d({ imageData: { data } }: T2DPipelineState) {
    const BBrightness = Math.round(this.BBrightness * 255);
    for (let i = 0; i < data.length; i += 4) {
      data[i+2] += BBrightness // B
    }
  }

  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
    gl.uniform1f(uniformLocations.uBBrightness, this.BBrightness)
  }

}

classRegistry.setClass(BBrightness)