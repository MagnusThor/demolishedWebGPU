import { defaultWglslVertex } from "../../../src/engine/Material";
import { IMaterialShader } from "../../../src/interface/IMaterialShader";


export const simpleMarcher:IMaterialShader = {
  vertex: defaultWglslVertex,
  fragment: /* wgsl */ `

  struct Uniforms {
    resolution: vec3<f32>,
    time: f32
  };

  @group(0) @binding(0) var<uniform> uniforms: Uniforms;
  @group(0) @binding(1) var linearSampler: sampler;

  struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>
  };

  const MAX_STEPS: i32 = 100;
  const MAX_DIST: f32 = 100.0;
  const SURFACE_DIST: f32 = 0.001;
  const LIGHT_POS: vec3<f32> = vec3<f32>(-2.0, 5.0, 3.0);

  fn mandelbulbSDF(p: vec3<f32>) -> f32 {
        var z: vec3<f32> = p;
        var dr: f32 = 1.0;
        var r: f32 = 0.0;
        const POWER: f32 = 8.0;
        for (var i: i32 = 0; i < 4; i = i + 1) {
            r = length(z);
            if (r > 2.0) {
                break;
            }
            // Convert to polar coordinates
            var theta: f32 = acos(z.z / r);
            var phi: f32 = atan2(z.y, z.x);
            dr = pow(r, POWER - 1.0) * POWER * dr + 1.0;
            // Scale and rotate the point
            var zr: f32 = pow(r, POWER);
            theta = theta * POWER;
            phi = phi * POWER;
            // Convert back to Cartesian coordinates
            z = zr * vec3<f32>(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
            z = z + p;
        }
        return 0.5 * log(r) * r / dr;
    }


   fn sphereSDF(point: vec3<f32>, radius: f32) -> f32 {
     return mandelbulbSDF(point);
        //return length(point) - radius;
    }

  fn main(fragCoord: vec2<f32>) -> vec4<f32> {

    let uv: vec2<f32> = fragCoord.xy / uniforms.resolution.xy * 2.0 - 1.0;
    var color: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
    let cameraPos: vec3<f32> = vec3<f32>(0.0, 0.0, 5.0);
    let rayDir: vec3<f32> = normalize(vec3<f32>(uv, -1.0));

    var t: f32 = 0.0;

   for (var i: i32 = 0; i < MAX_STEPS; i = i + 1) {
        let currentPos: vec3<f32> = cameraPos + t * rayDir;
        let dist: f32 = sphereSDF(currentPos, 1.0);
        if (dist < SURFACE_DIST) {
            color = vec3<f32>(1.0, 0.0, 0.0); // Color the sphere red
            break;
        }
        if (t > MAX_DIST) {
            break;
        }
        t = t + dist;
    }
    return vec4<f32>(color, 1.0);
  }
  
  @fragment
  fn main_fragment(in: VertexOutput) -> @location(0) vec4<f32> {
    return main(in.pos.xy);
}


  

  
  `
};

