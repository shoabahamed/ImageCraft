import { filters, type T2DPipelineState, classRegistry } from "fabric";

const fragmentSource = `
precision highp float;
uniform sampler2D uTexture;
uniform float uRedThreshold;
uniform float uRedLower;
uniform float uRedUpper;
uniform float uGreenThreshold;
uniform float uGreenLower;
uniform float uGreenUpper;
uniform float uBlueThreshold;
uniform float uBlueLower;
uniform float uBlueUpper;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(uTexture, vTexCoord);
  
  // Red channel thresholding
  color.r = color.r > uRedThreshold ? uRedUpper : uRedLower;
  
  // Green channel thresholding
  color.g = color.g > uGreenThreshold ? uGreenUpper : uGreenLower;
  
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

export class RGBThresholdFilter extends filters.BaseFilter<
  "RGBThresholdFilter",
  ChannelThreshold
> {
  static type = "RGBThresholdFilter";
  static defaults = {
    red: { threshold: 128, lower: 0, upper: 255 },
    green: { threshold: 128, lower: 0, upper: 255 },
    blue: { threshold: 128, lower: 0, upper: 255 },
  };

  static uniformLocations = [
    "uRedThreshold",
    "uRedLower",
    "uRedUpper",
    "uBlueThreshold",
    "uBlueLower",
    "uBlueUpper",
    "uGreenThreshold",
    "uGreenLower",
    "uGreenUpper",
  ];

  declare red: ChannelThreshold;
  declare green: ChannelThreshold;
  declare blue: ChannelThreshold;

  getFragmentSource() {
    return fragmentSource;
  }

  isNeutralState() {
    return false;
  }

  applyTo2d({ imageData: { data } }: T2DPipelineState) {
    const { red, green, blue } = this;
    for (let i = 0; i < data.length; i += 4) {
      // Red channel
      data[i] = data[i] > red.threshold ? red.upper : red.lower;
      // Green channel
      data[i + 1] = data[i + 1] > green.threshold ? green.upper : green.lower;
      // Blue channel
      data[i + 2] = data[i + 2] > blue.threshold ? blue.upper : blue.lower;
    }
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: TWebGLUniformLocationMap
  ) {
    gl.uniform1f(uniformLocations.uRedThreshold, this.red.threshold / 255);
    gl.uniform1f(uniformLocations.uRedLower, this.red.lower / 255);
    gl.uniform1f(uniformLocations.uRedUpper, this.red.upper / 255);

    gl.uniform1f(uniformLocations.uGreenThreshold, this.green.threshold / 255);
    gl.uniform1f(uniformLocations.uGreenLower, this.green.lower / 255);
    gl.uniform1f(uniformLocations.uGreenUpper, this.green.upper / 255);

    gl.uniform1f(uniformLocations.uBlueThreshold, this.blue.threshold / 255);
    gl.uniform1f(uniformLocations.uBlueLower, this.blue.lower / 255);
    gl.uniform1f(uniformLocations.uBlueUpper, this.blue.upper / 255);
  }
}

classRegistry.setClass(RGBThresholdFilter);
