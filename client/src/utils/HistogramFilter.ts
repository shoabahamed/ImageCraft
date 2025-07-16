import {filters, classRegistry} from "fabric"

// Fragment shader: convert RGB to YCrCb, apply histogram equalization to Y, then convert back to RGB
const fragmentSource = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform sampler2D uCDF;
  varying vec2 vTexCoord;
  
  // RGB to YCrCb conversion
  vec3 rgbToYCrCb(vec3 rgb) {
    float y = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    float cr = (rgb.r - y) * 0.713 + 0.5;
    float cb = (rgb.b - y) * 0.564 + 0.5;
    return vec3(y, cr, cb);
  }
  
  // YCrCb to RGB conversion
  vec3 yCrCbToRgb(vec3 yCrCb) {
    float y = yCrCb.x;
    float cr = yCrCb.y - 0.5;
    float cb = yCrCb.z - 0.5;
    
    float r = y + 1.402 * cr;
    float g = y - 0.714 * cr - 0.344 * cb;
    float b = y + 1.772 * cb;
    
    return vec3(r, g, b);
  }
  
  void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    
    // Convert RGB to YCrCb
    vec3 yCrCb = rgbToYCrCb(color.rgb);
    
    // Apply histogram equalization to Y channel using CDF
    float yEqualized = texture2D(uCDF, vec2(yCrCb.x, 0.0)).r;
    
    // Create new YCrCb with equalized Y
    vec3 yCrCbEqualized = vec3(yEqualized, yCrCb.y, yCrCb.z);
    
    // Convert back to RGB
    vec3 rgbEqualized = yCrCbToRgb(yCrCbEqualized);
    
    // Clamp values to valid range
    rgbEqualized = clamp(rgbEqualized, 0.0, 1.0);
    
    gl_FragColor = vec4(rgbEqualized, color.a);
  }
`

type HistorgramFilterOwnProps = {
  cdf?: Uint8Array | number[] | null;
};

type TWebGLUniformLocationMap = Record<string, WebGLUniformLocation | null>

export class HistorgramFilter extends filters.BaseFilter<'HistorgramFilter', HistorgramFilterOwnProps>{
  static type = "HistorgramFilter"
  static defaults = {cdf: null}
  static uniformLocations = ['uCDF']

  cdf: Uint8Array | number[] | null = null;
  cdfTexture: WebGLTexture | null = null;

  getFragmentSource(){
    return fragmentSource
  }

  isNeutralState() {
    return false
  }

  applyTo2d() {
    // Not used for WebGL, but could be used for CPU fallback
  }

  sendUniformData(gl: WebGLRenderingContext, uniformLocations: TWebGLUniformLocationMap) {
    // If we have a CDF array but no texture, create the texture
    if (!this.cdfTexture && this.cdf) {
      const cdfArray = this.cdf instanceof Uint8Array ? this.cdf : new Uint8Array(this.cdf);
      const tex = gl.createTexture();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 256, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, cdfArray);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindTexture(gl.TEXTURE_2D, null);
      this.cdfTexture = tex;
    }
    // Bind the CDF texture to texture unit 1
    if (this.cdfTexture) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.cdfTexture);
      gl.uniform1i(uniformLocations.uCDF, 1); // 1 = TEXTURE1
      gl.activeTexture(gl.TEXTURE0); // reset
    }
  }


}

classRegistry.setClass(HistorgramFilter)