"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redColorShader = void 0;
const Material_1 = require("../../../src/engine/Material");
exports.redColorShader = {
    vertex: Material_1.defaultWglslVertex,
    fragment: /* wgsl */ `
  
  struct Uniforms {
		resolution: vec3<f32>,
		time: f32,
		mouse: vec4<f32>,
		frame: f32
	  };

   @group(0) @binding(0) var<uniform> uniforms: Uniforms;
   @group(0) @binding(1) var linearSampler: sampler;
   @group(0) @binding(2) var iChannel0: texture_2d<f32>; 
  
  struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>
  };  

  fn sample_texture(tex:texture_2d<f32>,uv:vec2<f32>) -> vec4<f32>{
		let result:vec4<f32> = textureSample(tex, linearSampler, -uv);
		return result;
	}   

  fn mainImage(fragCoord: vec2<f32>) -> vec4<f32> {
    var col: vec3<f32> = vec3<f32>(1.0,0.0,0.0); 
    var result:vec4<f32> = vec4<f32>(col,1.0);

    var tex = sample_texture(iChannel0,fragCoord);

    return tex; 
  
  }

  @fragment
  fn main_fragment(in: VertexOutput) -> @location(0) vec4<f32> {      
    return mainImage(in.uv);
}`
};
