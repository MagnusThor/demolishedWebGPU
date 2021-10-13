import { IMaterialShader } from "../../../src/Material";

export const checkerShader:IMaterialShader = {
  vertex: ``,
  fragment:
   /* wgsl */ `
      [[block]] struct Uniforms {
        resolution: vec3<f32>;
        time: f32;
      };
      
      [[group(0), binding(0)]] var<uniform> u: Uniforms;
      
      
      struct VertexOutput {
        [[builtin(position)]] pos: vec4<f32>;
        [[location(0)]] uv: vec2<f32>;
      };
          
      fn rotate2d(a: f32) -> mat2x2<f32> {
        let c = cos(a);
        let s = sin(a);
        return mat2x2<f32>(
            vec2<f32>(c, -s),
            vec2<f32>(s, c)
        );
      }
      
      let size = 15.0;
      
      fn main(uv: vec2<f32>) -> vec4<f32> {
        var p = (uv - 0.5) * (u.resolution.xy) * rotate2d(u.time / 10.0);
        if (p.x < 0.0) {p.x = p.x - size;}
        if (p.y < 0.0) {p.y = p.y - size;}
        p = abs(p);
        let q = p.x % (size * 2.0) < size == p.y % (size * 2.0) < size;
        let o = f32(q);
        return vec4<f32>(o,o,o,1.0);
      }
      
      [[stage(fragment)]]
      fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {
        let x = u.resolution; // need to use all inputs
        return main(in.uv);
}`
};

