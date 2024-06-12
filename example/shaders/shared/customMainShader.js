"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customMainShader = void 0;
exports.customMainShader = {
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

  fn sample_texture(tex: texture_2d<f32>, uv: vec2<f32>) -> vec4<f32> {
    let result: vec4<f32> = textureSample(tex, screen_sampler, uv);
    return result;
}

fn DpthFld(iCh: texture_2d<f32>, uv: vec2<f32>) -> vec3<f32> {
    let focD: f32 = 3.5;
    let coc: f32 = 2.0;
    let l: f32 = abs(sample_texture(iChannel0, uv).w - focD - coc) - coc;
    let dof: f32 = clamp(l / coc, 0.0, 1.0);
    var acc: vec3<f32> = vec3<f32>(0.0);
    for (var i: i32 = 0; i < 25; i = i + 1) {
        let offset: vec2<f32> = (vec2<f32>(f32(i) / 5.0, f32(i % 5)) - vec2<f32>(2.0)) / vec2<f32>(800.0, 450.0) * dof;
        acc = acc + sample_texture(iChannel0, uv + offset).xyz;
    }
    return acc / 25.0;
}

 
 @fragment
fn main_fragment(@location(0) TexCoord : vec2<f32>) -> @location(0) vec4<f32> {


    let uv : vec2<f32> = TexCoord.xy / uniforms.resolution.xy;

    var col: vec4<f32> = sample_texture(iChannel0,TexCoord); // DpthFld(iChannel0, TexCoord).xyzz;
    col = mix(col, col.yzxw, smoothstep(0.35, 0.6, length(TexCoord - 0.5)));
    return pow(max(col, vec4<f32>(0.0)), vec4<f32>(1. / 2.2));
}

  
  `
};
