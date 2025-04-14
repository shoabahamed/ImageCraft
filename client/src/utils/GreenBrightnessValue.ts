import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uGBrightness;
  varying vec2 vTexCoord;
  void main() {
    vec4 color =  texture2D(uTexture, vTexCoord);
    color.g += uGBrightness;
    gl_FragColor = color;
  }
`

type GBrightnessOwnProps = {
  GBrightness: number
}

type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class GBrightness extends filters.BaseFilter<'GBrightness', GBrightnessOwnProps>{
  static type = "GBrightness"
  static defaults = {GBrightness: 0}
  static uniformLocations = ['uGBrightness']
  declare GBrightness: number

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return this.GBrightness === 0
  }

  applyTo2d({ imageData: { data } }: T2DPipelineState) {
    const GBrightness = Math.round(this.GBrightness * 255);
    for (let i = 0; i < data.length; i += 4) {
      data[i+1] += GBrightness // G
    }
  }

  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
    gl.uniform1f(uniformLocations.uGBrightness, this.GBrightness)
  }

}

classRegistry.setClass(GBrightness)