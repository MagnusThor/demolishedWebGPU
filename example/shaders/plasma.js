"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plasmaWglsl = void 0;
exports.plasmaWglsl = 
/* wgsl */ `
      [[block]] struct Uniforms {
        resolution: vec3<f32>;
        time: f32;
      };
      
      [[group(0), binding(0)]] var<uniform> uniforms: Uniforms;
      
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

     
      let MAX_ITER: i32 = 20;
      let TAU: f32 = 7.28318530718;
            
      fn main(fragCoord: vec2<f32>) -> vec4<f32> {

        var uv: vec2<f32>= (fragCoord + vec2<f32>(1.0, 1.0)) / vec2<f32>(2.0, 2.0);
        var time: f32 = uniforms.time;
    
        var p: vec2<f32> = (uv * vec2<f32>(TAU, TAU) % vec2<f32>(TAU, TAU)) - vec2<f32>(250.0, 250.0);
        var i: vec2<f32> = vec2<f32>(p);
        var c: f32 = 0.5;
        var inten: f32 = 0.005;
    
        for (var n: i32 = 0; n < MAX_ITER; n = n + 1) {
            var t: f32 = 0.16 * (time + 23.0) * (1.0 - (3.5 / (f32(n) + 1.0)));
            i = p + vec2<f32>(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
            c = c + 1.0 / length(vec2<f32>(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
        }
    
        c = c / f32(MAX_ITER);
        c = 1.0 - pow(c, 2.0);
        var cc: f32 = pow(abs(c), 12.0);
        var color: vec3<f32> = vec3<f32>(cc, cc, cc);
        color = clamp(color, vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0));
    
        //var tint: vec3<f32>= vec3<f32>(uv.x, uv.y, (1.0 - uv.x) * (1.0 - uv.y));
        return vec4<f32>(color,1.0);

      }
      
      [[stage(fragment)]]
      fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {      
        return main(in.uv);
}`;
