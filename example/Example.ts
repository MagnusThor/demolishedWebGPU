import { Geometry } from "../src/Geometry";
import { Material } from "../src/Material";
import { Mesh } from "../src/Mesh";
import { Renderer } from "../src/Renderer";




document.addEventListener("DOMContentLoaded", () => {


    const wgsl =
/* wgsl */ `
      [[block]] struct Uniforms {
        resolution: vec3<f32>;
        time: f32;
      };
      
      [[group(0), binding(0)]] var<uniform> u: Uniforms;
      
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



    const canvas = document.querySelector('canvas') as HTMLCanvasElement;


    const vertices = new Float32Array([
        -1, 1, 0, 1, 0, 1, 1, 1,
        -1, -1, 0, 1, 0, 1, 1, 1,
        1, -1, 0, 1, 0, 1, 1, 1,

        -1, 1, 0, 1, 0, 1, 1, 1,
        1, -1, 0, 1, 0, 1, 1, 1,
        1, 1, 0, 1, 0, 1, 1, 1,
    ]);

    const renderer = new Renderer(canvas);

    renderer.getDevice().then(async device => {


        const uniforms = new Float32Array([renderer.canvas.width, renderer.canvas.height, devicePixelRatio, 0, 0]);

       
        const geometry = new Geometry(device, vertices);
        const material = new Material(device, wgsl)
       
        renderer.initialize(geometry,material,uniforms).then ( ()=> {
          renderer.render();
        })        


        window["instance"] = renderer;
    });











});


