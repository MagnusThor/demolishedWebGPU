"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleGreenScreen = void 0;
const Material_1 = require("../../../src/Material");
exports.simpleGreenScreen = {
    vertex: Material_1.defaultWglslVertex,
    fragment: /* wgsl */ `
  
  struct Uniforms {
    resolution: vec3<f32>,
    time: f32
  };

  @group(0) @binding(0) var<uniform> uniforms: Uniforms;

  @group(0) @binding(1) var linearSampler: sampler;
  @group(0) @binding(2) var textureA: texture_external; 
  @group(0) @binding(3) var textureB: texture_2d<f32>; 
  
     
  struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>
  };  

  fn main(fragCoord: vec2<f32>) -> vec4<f32> {
    var texColor:vec4<f32> = textureSampleLevel(textureA, linearSampler, -fragCoord);
    var backColor:vec4<f32> = textureSample(textureB, linearSampler, -fragCoord);
    let t = 0.05;
    var k:vec2<f32> = vec2<f32>(texColor.g - texColor.r,texColor.g - texColor.b);
    if(k.x > t && k.y > t){
        texColor = backColor;
    };
   return texColor; 

  }
  @fragment
  fn main_fragment(in: VertexOutput) -> @location(0) vec4<f32> {      
    return main(in.uv);
}`
};
