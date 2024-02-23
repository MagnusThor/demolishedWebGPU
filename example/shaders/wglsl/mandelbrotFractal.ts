import { defaultWglslVertex } from "../../../src/Material";
import { IMaterialShader } from "../../../src/IMaterialShader";

export const mandelbrotFractal:IMaterialShader = {
  vertex: defaultWglslVertex,
  fragment: /* glsl */ `  
  struct Uniforms {
    resolution: vec3<f32>,
    time: f32
  };

  @group(0) @binding(0) var<uniform> uniforms: Uniforms;
     
  struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>
  };  

  const ITERATIONS: i32 = 45;
  fn main(uv: vec2<f32>) -> vec4<f32> {
    let c: vec2<f32> = (uv + vec2<f32>(-0.5, -0.5)) * 1.3;
    var x: f32 = 0.;
    var y: f32 = 0.;
    var i: i32 = 0;
   
    for (; i < ITERATIONS; i = i + 1) {
        if (x*x + y*y > 4.) {
            break;
        }
        let xtemp: f32 = (x * x) - (y * y) + c.x;
        y = 2. * x * y + c.y;
        x = xtemp;
    }

    let frac: f32 = f32(i) / f32(ITERATIONS);
    return vec4<f32>(frac * 5., frac * 1., frac * 3., 1.0);
  
  }
  @fragment
  fn main_fragment(in: VertexOutput) -> @location(0) vec4<f32> {      
    return main(in.uv);
}`
};

