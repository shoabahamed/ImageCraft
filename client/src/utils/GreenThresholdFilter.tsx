import { filters, type T2DPipelineState, classRegistry } from "fabric";

const fragmentSource = `
precision highp float;
uniform sampler2D uTexture;
uniform float uGreenThreshold;
uniform float uGreenLower;
uniform float uGreenUpper;

varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(uTexture, vTexCoord);
  
  
  // Green channel thresholding
  color.g = color.g > uGreenThreshold ? uGreenUpper : uGreenLower;
  

  
  gl_FragColor = color;
}
`;

type ChannelThreshold = {
  threshold: number;
  lower: number;
  upper: number;
};

type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>;

export class GreenThresholdFilter extends filters.BaseFilter<
  "GreenThresholdFilter",
  ChannelThreshold
> {
  static type = "GreenThresholdFilter";
  static defaults = {
    green: { threshold: 128, lower: 0, upper: 255 },
  };

  static uniformLocations = ["uGreenThreshold", "uGreenLower", "uGreenUpper"];

  declare green: ChannelThreshold;

  getFragmentSource() {
    return fragmentSource;
  }

  isNeutralState() {
    return false;
  }

  applyTo2d({ imageData: { data } }: T2DPipelineState) {
    const { green } = this;
    for (let i = 0; i < data.length; i += 4) {
      // Green channel
      data[i + 1] = data[i + 1] > green.threshold ? green.upper : green.lower;
    }
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: TWebGLUniformLocationMap
  ) {
    gl.uniform1f(
      uniformLocations.uGreenThreshold,
      new Float32Array([this.green.threshold / 255])[0]
    );
    gl.uniform1f(
      uniformLocations.uGreenLower,
      new Float32Array([this.green.lower / 255])[0]
    );
    gl.uniform1f(
      uniformLocations.uGreenUpper,
      new Float32Array([this.green.upper / 255])[0]
    );
  }
}

classRegistry.setClass(GreenThresholdFilter);
