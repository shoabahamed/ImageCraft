import { filters, type T2DPipelineState, classRegistry } from 'fabric';

const fragmentSourceGrayscale = `
precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(uTexture, vTexCoord);
  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  gl_FragColor = vec4(gray, gray, gray, color.a);
}
`;

type CustomGrayScaleProps = Record<string, unknown>;

export class CustomGrayScale extends filters.BaseFilter<'CustomGrayScale', CustomGrayScaleProps> {
  static type = 'CustomGrayScale';

  getFragmentSource() {
    return fragmentSourceGrayscale;
  }

  isNeutralState() {
    // This filter is never neutral unless all colors are already gray
    return false;
  }

  applyTo2d({ imageData: {
    data,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    width,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    height
  } }: T2DPipelineState) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      // Alpha (data[i + 3]) remains unchanged
    }
  }
}

classRegistry.setClass(CustomGrayScale);
