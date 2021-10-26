import { defaultWglslVertex } from "../../../src/Material";
import { IMaterialShader } from "../../../src/IMaterialShader";

export const showTextureShader:IMaterialShader = {
  vertex: defaultWglslVertex,
  fragment: /* wgsl */ `
  [[block]] struct Uniforms {
    resolution: vec3<f32>;
    time: f32;
  };
  [[group(0), binding(0)]] var<uniform> uniforms: Uniforms;
  [[group(0), binding(1)]] var linearSampler: sampler;
  [[group(0), binding(2)]] var textureA: texture_external;
  [[group(0), binding(3)]] var textureB: texture_2d<f32>;
  
     
  struct VertexOutput {
    [[builtin(position)]] pos: vec4<f32>;
    [[location(0)]] uv: vec2<f32>;
  };  

  fn main(fragCoord: vec2<f32>) -> vec4<f32> {
    // display texture 
    return  textureSampleLevel(textureA, linearSampler, fragCoord);
    //return vec4<f32>(1.0,0.0,0.0,1.0);//textureSample(textureB, linearSampler, fragCoord);
  }
  [[stage(fragment)]]
  fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {      
    return main(in.uv);
}`
};

