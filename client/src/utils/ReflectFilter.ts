import {filters, type T2DPipelineState, classRegistry} from "fabric"


const fragmentSource = {

  leftToRight: `
  precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;

    if (vTexCoord.x > 0.5) {
      mirroredCoord = vec2(1.0 - vTexCoord.x, vTexCoord.y);
    }
    vec4 color = texture2D(uTexture, mirroredCoord);
 
    // gl_FragColor = vec4(vTexCoord.x, vTexCoord.y, 0, 1.0);
    gl_FragColor = color;
}
  `,

  rightToLeft: `
    precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;

    if (vTexCoord.x < 0.5) {
      mirroredCoord = vec2(1.0 - vTexCoord.x, vTexCoord.y);
    }
    vec4 color = texture2D(uTexture, mirroredCoord);
    gl_FragColor = color;
}
  `,

  topToBottom: `
  
    precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;

    if (vTexCoord.y > 0.5) {
      mirroredCoord = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    }
    vec4 color = texture2D(uTexture, mirroredCoord);
    gl_FragColor = color;
}

  `,

    bottomToTop: `
  
    precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;

    if (vTexCoord.y < 0.5) {
      mirroredCoord = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    }
    vec4 color = texture2D(uTexture, mirroredCoord);
    gl_FragColor = color;
}

  `,

  topLeft: `
  
    precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;


    mirroredCoord.x = vTexCoord.x > 0.5 ? 1.0 - vTexCoord.x : vTexCoord.x;
    mirroredCoord.y = vTexCoord.y > 0.5 ? 1.0 - vTexCoord.y : vTexCoord.y;
 
    vec4 color = texture2D(uTexture, mirroredCoord);
    gl_FragColor = color;
}

  `,

  topRight: `
  
    precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;


    mirroredCoord.x = vTexCoord.x < 0.5 ? 1.0 - vTexCoord.x : vTexCoord.x;
    mirroredCoord.y = vTexCoord.y > 0.5 ? 1.0 - vTexCoord.y : vTexCoord.y;



 
    vec4 color = texture2D(uTexture, mirroredCoord);
    gl_FragColor = color;
}

  `,
  bottomLeft: `
  
    precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;


    mirroredCoord.x = vTexCoord.x > 0.5 ? 1.0 - vTexCoord.x : vTexCoord.x;
    mirroredCoord.y = vTexCoord.y < 0.5 ? 1.0 - vTexCoord.y : vTexCoord.y;



 
    vec4 color = texture2D(uTexture, mirroredCoord);
    gl_FragColor = color;
}

  `,

    bottomRight: `
  
    precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;


    mirroredCoord.x = vTexCoord.x < 0.5 ? 1.0 - vTexCoord.x : vTexCoord.x;
    mirroredCoord.y = vTexCoord.y < 0.5 ? 1.0 - vTexCoord.y : vTexCoord.y;



 
    vec4 color = texture2D(uTexture, mirroredCoord);
    gl_FragColor = color;
}

  `,


    leftDiagonal: `
  
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

  `,

      rightDiagonal: `
  
    precision highp float;
  uniform sampler2D uTexture;
  varying vec2 vTexCoord;


  void main() {

    vec2 mirroredCoord = vTexCoord;


    if (vTexCoord.x < vTexCoord.y) {
    mirroredCoord = vec2(vTexCoord.y, vTexCoord.x); // Swap coordinates
    }
 
    vec4 color = texture2D(uTexture, mirroredCoord);
    gl_FragColor = color;
}

  `
}



type ReflectFilterOwnProps = {
  reflectType: string
}


export class ReflectFilter extends filters.BaseFilter<'ReflectFilter', ReflectFilterOwnProps>{
  static type = "Reflect"
  static defaults = {reflectType: 'leftToRight'}
  static uniformLocations = ['uHalfSize', 'uSize']
  declare reflectType: string


  getCacheKey() {
    return `${this.reflectType}` as keyof typeof fragmentSource;
  }

  getFragmentSource(){
    return fragmentSource[this.getCacheKey()];
  }

  isNeutralState() {
    return false
  }

  applyTo2d({ imageData: { data, width, height } }: T2DPipelineState) {
    // Create a copy of the original data to avoid overwriting during processing
    const originalData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Convert pixel coordinates to normalized coordinates (0-1)
        const normalizedX = x / width;
        const normalizedY = y / height;
        
        // Calculate mirrored coordinates based on reflection type
        let mirroredX = x;
        let mirroredY = y;
        
        switch (this.reflectType) {
          case 'leftToRight':
            if (normalizedX > 0.5) {
              mirroredX = Math.floor((1 - normalizedX) * width);
            }
            break;
            
          case 'rightToLeft':
            if (normalizedX < 0.5) {
              mirroredX = Math.floor((1 - normalizedX) * width);
            }
            break;
            
          case 'topToBottom':
            if (normalizedY > 0.5) {
              mirroredY = Math.floor((1 - normalizedY) * height);
            }
            break;
            
          case 'bottomToTop':
            if (normalizedY < 0.5) {
              mirroredY = Math.floor((1 - normalizedY) * height);
            }
            break;
            
          case 'topLeft':
            if (normalizedX > 0.5) {
              mirroredX = Math.floor((1 - normalizedX) * width);
            }
            if (normalizedY > 0.5) {
              mirroredY = Math.floor((1 - normalizedY) * height);
            }
            break;
            
          case 'topRight':
            if (normalizedX < 0.5) {
              mirroredX = Math.floor((1 - normalizedX) * width);
            }
            if (normalizedY > 0.5) {
              mirroredY = Math.floor((1 - normalizedY) * height);
            }
            break;
            
          case 'bottomLeft':
            if (normalizedX > 0.5) {
              mirroredX = Math.floor((1 - normalizedX) * width);
            }
            if (normalizedY < 0.5) {
              mirroredY = Math.floor((1 - normalizedY) * height);
            }
            break;
            
          case 'bottomRight':
            if (normalizedX < 0.5) {
              mirroredX = Math.floor((1 - normalizedX) * width);
            }
            if (normalizedY < 0.5) {
              mirroredY = Math.floor((1 - normalizedY) * height);
            }
            break;
            
          case 'leftDiagonal':
            if (normalizedX + normalizedY > 1) {
              mirroredX = Math.floor((1 - normalizedX) * width);
              mirroredY = Math.floor((1 - normalizedY) * height);
            }
            break;
            
          case 'rightDiagonal':
            if (normalizedX < normalizedY) {
              const temp = mirroredX;
              mirroredX = mirroredY;
              mirroredY = temp;
            }
            break;
        }
        
        // Ensure coordinates are within bounds
        mirroredX = Math.min(width - 1, Math.max(0, mirroredX));
        mirroredY = Math.min(height - 1, Math.max(0, mirroredY));
        
        // Get source pixel from mirrored coordinates
        const sourceIndex = (mirroredY * width + mirroredX) * 4;
        const targetIndex = (y * width + x) * 4;
        
        // Copy pixel data
        data[targetIndex] = originalData[sourceIndex];         // R
        data[targetIndex + 1] = originalData[sourceIndex + 1]; // G
        data[targetIndex + 2] = originalData[sourceIndex + 2]; // B
        data[targetIndex + 3] = originalData[sourceIndex + 3]; // A
      }
    }
  }


}

classRegistry.setClass(ReflectFilter)