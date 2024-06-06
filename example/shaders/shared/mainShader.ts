import { IMaterialShader } from "../../../src/interface/IMaterialShader";

export const mainShader:IMaterialShader = {
  vertex: /* wgsl */ `
  
  struct VertexOutput {
    @builtin(position) Position  : vec4<f32>,
    @location(0) TexCoord  : vec2<f32>,
}

@vertex
fn main_vertex(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {

    var positions = array<vec2<f32>, 6>(
        vec2<f32>( 1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0,  1.0)
    );

    var texCoords = array<vec2<f32>, 6>(
        vec2<f32>(1.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(0.0, 0.0)
    );

    var output : VertexOutput;
    output.Position = vec4<f32>(positions[VertexIndex], 0.0, 1.0);
    output.TexCoord = texCoords[VertexIndex];
    return output;
}
  
  `,
  fragment: /* wgsl */ `
  
  struct Uniforms {
    resolution: vec3<f32>,
    time: f32
  };

  @group(0) @binding(0) var screen_sampler : sampler;
  
  @group(0) @binding(1) var<uniform> uniforms: Uniforms;
  
  @group(0) @binding(2) var iChannel0: texture_2d<f32>; 
  
  @group(0) @binding(3) var iChannel1: texture_2d<f32>; 
  
  @group(0) @binding(4) var iChannel2: texture_2d<f32>; 
  
  struct VertexOutput {
    @builtin(position) Position: vec4<f32>,
    @location(0) TexCoord: vec2<f32>
  };  

  @fragment
  fn main_fragment(@location(0) TexCoord : vec2<f32>) -> @location(0) vec4<f32> {

    return  textureSample(iChannel0, screen_sampler, TexCoord);  

  }`
}