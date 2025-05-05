import { filters, type T2DPipelineState, classRegistry } from "fabric";

const fragmentSource = `
precision highp float;
uniform sampler2D uTexture;
uniform float uBlueThreshold;
uniform float uBlueLower;
uniform float uBlueUpper;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(uTexture, vTexCoord);
  
  
  // Blue channel thresholding
  color.b = color.b > uBlueThreshold ? uBlueUpper : uBlueLower;
  
  gl_FragColor = color;
}
`;

type ChannelThreshold = {
  threshold: number;
  lower: number;
  upper: number;
};

type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>;

export class BlueThresholdFilter extends filters.BaseFilter<
  "BlueThresholdFilter",
  ChannelThreshold
> {
  static type = "BlueThresholdFilter";
  static defaults = {
    blue: { threshold: 128, lower: 0, upper: 255 },
  };

  static uniformLocations = ["uBlueThreshold", "uBlueLower", "uBlueUpper"];
  declare blue: ChannelThreshold;

  getFragmentSource() {
    return fragmentSource;
  }

  isNeutralState() {
    return false;
  }

  applyTo2d({ imageData: { data } }: T2DPipelineState) {
    const { blue } = this;
    for (let i = 0; i < data.length; i += 4) {
      // Blue channel
      data[i + 2] = data[i + 2] > blue.threshold ? blue.upper : blue.lower;
    }
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: TWebGLUniformLocationMap
  ) {
    gl.uniform1f(uniformLocations.uBlueThreshold, this.blue.threshold / 255);
    gl.uniform1f(uniformLocations.uBlueLower, this.blue.lower / 255);
    gl.uniform1f(uniformLocations.uBlueUpper, this.blue.upper / 255);
  }
}

classRegistry.setClass(BlueThresholdFilter);
