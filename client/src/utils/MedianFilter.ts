import {filters, type T2DPipelineState, classRegistry} from "fabric"

const fragmentSource =  {
  conv_3: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;

void sort(inout float[9] arr) {
    // Full 9-element sorting network
    #define SWAP(a,b) if(arr[a] > arr[b]) { float temp = arr[a]; arr[a] = arr[b]; arr[b] = temp; }
    
    // First pass
    SWAP(0, 1); SWAP(2, 3); SWAP(4, 5); SWAP(7, 8);
    SWAP(0, 2); SWAP(1, 3); SWAP(5, 8); SWAP(4, 7);
    SWAP(1, 2); SWAP(5, 7); SWAP(3, 8); SWAP(0, 4);
    SWAP(3, 5); SWAP(2, 7); SWAP(1, 4); SWAP(3, 6);
    SWAP(2, 4); SWAP(3, 7); SWAP(5, 6); SWAP(5, 8);
    SWAP(3, 4); SWAP(5, 7); SWAP(6, 8);

    // Second pass
    SWAP(0, 1); SWAP(2, 3); SWAP(4, 5); SWAP(7, 8);
    SWAP(0, 2); SWAP(1, 3); SWAP(5, 8); SWAP(4, 7);
    SWAP(1, 2); SWAP(5, 7); SWAP(3, 8); SWAP(0, 4);
    SWAP(3, 5); SWAP(2, 7); SWAP(1, 4); SWAP(3, 6);
    SWAP(2, 4); SWAP(3, 7); SWAP(5, 6); SWAP(5, 8);
    SWAP(3, 4); SWAP(5, 7); SWAP(6, 8);

    #undef SWAP
}

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    
    float rValues[9];
    float gValues[9];
    float bValues[9];
    
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            rValues[(y + 1) * 3 + (x + 1)] = sample.r;
            gValues[(y + 1) * 3 + (x + 1)] = sample.g;
            bValues[(y + 1) * 3 + (x + 1)] = sample.b;
        }
    }

    sort(rValues);
    sort(gValues);
    sort(bValues);

    vec3 medianColor = vec3(
        rValues[4],
        gValues[4],
        bValues[4]
    );

    gl_FragColor = vec4(medianColor, 1.0);
}`,

  conv_5: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;

void sort(inout float[25] arr) {
    // 25-element sorting network
    #define SWAP(a,b) if(arr[a] > arr[b]) { float temp = arr[a]; arr[a] = arr[b]; arr[b] = temp; }
    
    // First pass
    for(int i = 0; i < 24; i += 2) {
        SWAP(i, i + 1);
    }
    
    // Second pass
    for(int i = 0; i < 23; i += 2) {
        SWAP(i, i + 2);
    }
    
    // Third pass
    for(int i = 0; i < 22; i += 2) {
        SWAP(i, i + 3);
    }
    
    // Fourth pass
    for(int i = 0; i < 21; i += 2) {
        SWAP(i, i + 4);
    }
    
    // Fifth pass
    for(int i = 0; i < 20; i += 2) {
        SWAP(i, i + 5);
    }

    #undef SWAP
}

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    
    float rValues[25];
    float gValues[25];
    float bValues[25];
    
    for(int y = -2; y <= 2; y++) {
        for(int x = -2; x <= 2; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            rValues[(y + 2) * 5 + (x + 2)] = sample.r;
            gValues[(y + 2) * 5 + (x + 2)] = sample.g;
            bValues[(y + 2) * 5 + (x + 2)] = sample.b;
        }
    }

    sort(rValues);
    sort(gValues);
    sort(bValues);

    vec3 medianColor = vec3(
        rValues[12],
        gValues[12],
        bValues[12]
    );

    gl_FragColor = vec4(medianColor, 1.0);
}`,

  conv_7: `
  precision highp float;
uniform sampler2D uTexture;
varying vec2 vTexCoord;
uniform float uStepW;
uniform float uStepH;

void sort(inout float[49] arr) {
    // 49-element sorting network
    #define SWAP(a,b) if(arr[a] > arr[b]) { float temp = arr[a]; arr[a] = arr[b]; arr[b] = temp; }
    
    // First pass
    for(int i = 0; i < 48; i += 2) {
        SWAP(i, i + 1);
    }
    
    // Second pass
    for(int i = 0; i < 47; i += 2) {
        SWAP(i, i + 2);
    }
    
    // Third pass
    for(int i = 0; i < 46; i += 2) {
        SWAP(i, i + 3);
    }
    
    // Fourth pass
    for(int i = 0; i < 45; i += 2) {
        SWAP(i, i + 4);
    }
    
    // Fifth pass
    for(int i = 0; i < 44; i += 2) {
        SWAP(i, i + 5);
    }
    
    // Sixth pass
    for(int i = 0; i < 43; i += 2) {
        SWAP(i, i + 6);
    }
    
    // Seventh pass
    for(int i = 0; i < 42; i += 2) {
        SWAP(i, i + 7);
    }

    #undef SWAP
}

void main() {
    vec2 stepSize = vec2(uStepW, uStepH);
    vec4 sample;
    vec2 offset;
    
    float rValues[49];
    float gValues[49];
    float bValues[49];
    
    for(int y = -3; y <= 3; y++) {
        for(int x = -3; x <= 3; x++) {
            offset = vec2(float(x), float(y)) * stepSize;
            sample = texture2D(uTexture, vTexCoord + offset);
            
            rValues[(y + 3) * 7 + (x + 3)] = sample.r;
            gValues[(y + 3) * 7 + (x + 3)] = sample.g;
            bValues[(y + 3) * 7 + (x + 3)] = sample.b;
        }
    }

    sort(rValues);
    sort(gValues);
    sort(bValues);

    vec3 medianColor = vec3(
        rValues[24],
        gValues[24],
        bValues[24]
    );

    gl_FragColor = vec4(medianColor, 1.0);
}`
}

type MedianFilterOwnProps = {
  matrixSize: number,
}

export class MedianFilter extends filters.BaseFilter<'MedianFilter', MedianFilterOwnProps >{
  static type = "MedianFilter"
  static defaults = {matrixSize: 3}
  static uniformLocations = ['uStepW', 'uStepH']
  declare matrixSize: number;

  getCacheKey() {
    return `conv_${this.matrixSize}` as keyof typeof fragmentSource;
  }

  getFragmentSource(){
    return fragmentSource[this.getCacheKey()]
  }

  isNeutralState() {
    return false
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    const matrixSize = this.matrixSize;
    const halfSize = Math.floor(matrixSize / 2);
    const totalPixels = matrixSize * matrixSize;
    
    // Create a copy of the original data to avoid overwriting during processing
    const originalData = new Uint8ClampedArray(data);
    
    // Arrays to store pixel values for sorting
    const rValues = new Array(totalPixels);
    const gValues = new Array(totalPixels);
    const bValues = new Array(totalPixels);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let pixelIndex = 0;
        
        // Collect surrounding pixels
        for (let ky = -halfSize; ky <= halfSize; ky++) {
          for (let kx = -halfSize; kx <= halfSize; kx++) {
            const pixelX = Math.min(width - 1, Math.max(0, x + kx));
            const pixelY = Math.min(height - 1, Math.max(0, y + ky));
            const index = (pixelY * width + pixelX) * 4;
            
            rValues[pixelIndex] = originalData[index];
            gValues[pixelIndex] = originalData[index + 1];
            bValues[pixelIndex] = originalData[index + 2];
            pixelIndex++;
          }
        }
        
        // Sort the arrays to find median values
        rValues.sort((a, b) => a - b);
        gValues.sort((a, b) => a - b);
        bValues.sort((a, b) => a - b);
        
        // Get median values
        const medianIndex = Math.floor(totalPixels / 2);
        const medianR = rValues[medianIndex];
        const medianG = gValues[medianIndex];
        const medianB = bValues[medianIndex];
        
        // Apply median values to the output
        const outIndex = (y * width + x) * 4;
        data[outIndex] = medianR;     // R
        data[outIndex + 1] = medianG; // G
        data[outIndex + 2] = medianB; // B
        // Alpha channel remains unchanged
      }
    }
  }
}

classRegistry.setClass(MedianFilter)