import {filters, type T2DPipelineState, classRegistry} from "fabric"



const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;

    if (vTexCoord.x + vTexCoord.y > 1.0) {
    mirroredCoord = vec2(1.0 - vTexCoord.x, 1.0 - vTexCoord.y);
}
    vec4 color = texture2D(uTexture, mirroredCoord);
    gl_FragColor = color;
}
`

type ReflectFilterOwnProps = {
  reflectType: string
}




export class ReflectFilter extends filters.BaseFilter<'ReflectFilter', ReflectFilterOwnProps>{
  static type = "Reflect"
  static defaults = {reflectType: 'left'}
  static uniformLocations = ['uSharpenValue', 'uHalfSize', 'uSize']
  declare relfectType: string

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return false
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    const kernel = [
      0, -1,  0,
     -1,  4, -1,
      0, -1,  0
    ];
    const kernelSize = 3;
    const halfKernel = Math.floor(kernelSize / 2);
    const sharpenValue = this.SharpenValue;
  
    // Create a copy of the original data to avoid overwriting during convolution
    const originalData = new Uint8ClampedArray(data);
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
  
        // Apply the kernel
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const pixelX = Math.min(width - 1, Math.max(0, x + kx));
            const pixelY = Math.min(height - 1, Math.max(0, y + ky));
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const kernelValue = kernel[(ky + halfKernel) * kernelSize + (kx + halfKernel)];
  
            r += originalData[pixelIndex] * kernelValue;
            g += originalData[pixelIndex + 1] * kernelValue;
            b += originalData[pixelIndex + 2] * kernelValue;
          }
        }
  
        // Set the new pixel values, scaled by the sharpen value
        const index = (y * width + x) * 4;
        data[index] = Math.min(255, Math.max(0, data[index] + r * sharpenValue));     // R
        data[index + 1] = Math.min(255, Math.max(0, data[index + 1] + g * sharpenValue)); // G
        data[index + 2] = Math.min(255, Math.max(0, data[index + 2] + b * sharpenValue)); // B
        // Alpha channel remains unchanged
      }
    }
  }


}

classRegistry.setClass(ReflectFilter)