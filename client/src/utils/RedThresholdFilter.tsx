import { filters, type T2DPipelineState, classRegistry } from "fabric";

const fragmentSource = `
precision highp float;
uniform sampler2D uTexture;
uniform float uRedThreshold;
uniform float uRedLower;
uniform float uRedUpper;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(uTexture, vTexCoord);
  
  // Red channel thresholding
  color.r = color.r > uRedThreshold ? uRedUpper : uRedLower;
  
  
  gl_FragColor = color;
}
`;

type ChannelThreshold = {
  threshold: number;
  lower: number;
  upper: number;
};

type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>;

export class RedThresholdFilter extends filters.BaseFilter<
  "RedThresholdFilter",
  ChannelThreshold
> {
  static type = "RedThresholdFilter";
  static defaults = {
    red: { threshold: 128, lower: 0, upper: 255 },
  };

  static uniformLocations = ["uRedThreshold", "uRedLower", "uRedUpper"];

  declare red: ChannelThreshold;

  getFragmentSource() {
    return fragmentSource;
  }

  isNeutralState() {
    return false;
  }

  applyTo2d({ imageData: { data } }: T2DPipelineState) {
    const { red } = this;
    for (let i = 0; i < data.length; i += 4) {
      // Red channel
      data[i] = data[i] > red.threshold ? red.upper : red.lower;
    }
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: TWebGLUniformLocationMap
  ) {
    gl.uniform1f(
      uniformLocations.uRedThreshold,
      new Float32Array([this.red.threshold / 255])[0]
    );
    gl.uniform1f(
      uniformLocations.uRedLower,
      new Float32Array([this.red.lower / 255])[0]
    );
    gl.uniform1f(
      uniformLocations.uRedUpper,
      new Float32Array([this.red.upper / 255])[0]
    );
  }
}

classRegistry.setClass(RedThresholdFilter);
