"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAXXShader = void 0;
exports.FAXXShader = {
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

 

  fn sample_texture(tex: texture_2d<f32>, coord: vec2<f32>) -> vec4<f32> {
    return textureSample(tex, screen_sampler, coord);
  }

  @fragment
  fn main_fragment(@location(0) TexCoord : vec2<f32>,@builtin(position) Position: vec4<f32> ) -> @location(0) vec4<f32> {


     var fragCoord = vec2<f32>(Position.x,  Position.y);
       
    // Calculate the reciprocal of resolution to normalize coordinates
    let pp: vec2<f32> = vec2<f32>(1.0) / vec2<f32>(uniforms.resolution.x, uniforms.resolution.y);
    
    // Sample color from texture using normalized coordinates
    let color: vec4<f32> = sample_texture(iChannel0, fragCoord * pp);
    
    // Luma coefficients for luminance calculation
    let luma: vec3<f32> = vec3<f32>(0.299, 0.587, 0.114);
    
    // Calculate luminance for neighboring pixels
    let lumaNW: f32 = dot(sample_texture(iChannel0, (fragCoord + vec2<f32>(-1.0, -1.0)) * pp).xyz, luma);
    let lumaNE: f32 = dot(sample_texture(iChannel0, (fragCoord + vec2<f32>(1.0, -1.0)) * pp).xyz, luma);
    let lumaSW: f32 = dot(sample_texture(iChannel0, (fragCoord + vec2<f32>(-1.0, 1.0)) * pp).xyz, luma);
    let lumaSE: f32 = dot(sample_texture(iChannel0, (fragCoord + vec2<f32>(1.0, 1.0)) * pp).xyz, luma);
    let lumaM: f32 = dot(color.xyz, luma);
    
    // Determine minimum and maximum luminance values
    let lumaMin: f32 = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    let lumaMax: f32 = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
    
    // Calculate direction vectors for FXAA
    var dir: vec2<f32> = vec2<f32>(-((lumaNW + lumaNE) - (lumaSW + lumaSE)), ((lumaNW + lumaSW) - (lumaNE + lumaSE)));
    let dirReduce: f32 = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * (1.0 / 8.0)), (1.0 / 128.0));
    let rcpDirMin: f32 = 2.5 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2<f32>(8.0, 8.0), max(vec2<f32>(-8.0, -8.0), dir * rcpDirMin)) * pp;
    
    // Calculate RGB values for FXAA
    let rgbA: vec3<f32> = 0.5 * (sample_texture(iChannel0, fragCoord * pp + dir * (1.0 / 3.0 - 0.5)).xyz +
                                 sample_texture(iChannel0, fragCoord * pp + dir * (2.0 / 3.0 - 0.5)).xyz);
    let rgbB: vec3<f32> = rgbA * 0.5 + 0.25 * (sample_texture(iChannel0, fragCoord * pp + dir * -0.5).xyz +
                                               sample_texture(iChannel0, fragCoord * pp + dir * 0.5).xyz);
    
    // Calculate final luminance and choose between RGBA or RGBB
    let lumaB: f32 = dot(rgbB, luma);
    var fragColor: vec4<f32>;
    if (lumaB < lumaMin || lumaB > lumaMax) {
        fragColor = vec4<f32>(rgbA, color.w);
    } else {
        fragColor = vec4<f32>(rgbB, color.w);
    }
    
    return fragColor;
   

  }`
};
