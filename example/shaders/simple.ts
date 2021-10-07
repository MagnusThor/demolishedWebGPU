export const simpleWglsl =
/* wgsl */ `
      [[block]] struct Uniforms {
        resolution: vec3<f32>;
        time: f32;
      };
      

      [[group(0), binding(0)]] var<uniform> uniforms: Uniforms;
      [[group(0), binding(1)]] var linearSampler: sampler;
      [[group(0), binding(2)]] var textureA: texture_2d<f32>;
    
      struct VertexInput {
        [[location(0)]] pos: vec2<f32>;
      };
      
      struct VertexOutput {
        [[builtin(position)]] pos: vec4<f32>;
        [[location(0)]] uv: vec2<f32>;
      };
      
      [[stage(vertex)]]
      fn main_vertex(input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        var pos: vec2<f32> = input.pos * 2.0 - 1.0;
        output.pos = vec4<f32>(pos, 0.0, 1.0);
        output.uv = input.pos;
        return output;
      }

       // your shader code implementation -->

     
      fn main(fragCoord: vec2<f32>) -> vec4<f32> {

         let color = vec3<f32>(1.0,0.0,0.0);

        return vec4<f32>(color,1.0);

      }
      
      [[stage(fragment)]]
      fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {      
        return main(in.uv);
}`
