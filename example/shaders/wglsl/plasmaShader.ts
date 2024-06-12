import { defaultWglslVertex } from "../../../src/engine/Material";
import { IMaterialShader } from "../../../src/interface/IMaterialShader";


export const plasmaShader: IMaterialShader = {
    vertex: defaultWglslVertex,
    fragment: /* glsl */ `
    
    struct Uniforms {
      resolution: vec3<f32>,
      time: f32
    };

    @group(0) @binding(0) var<uniform> uniforms: Uniforms;

	@group(0) @binding(1) var linearSampler: sampler;
  	@group(0) @binding(2) var iChannel0: texture_2d<f32>; 
	@group(0) @binding(3) var iChannel1: texture_2d<f32>; 
	@group(0) @binding(4) var iChannel2: texture_2d<f32>; 
	@group(0) @binding(5) var iChannel3: texture_2d<f32>; 


	// globals

	fn mainImage(invocation_id: vec2<f32>) -> vec4<f32> {

		let R: vec2<f32> = uniforms.resolution.xy;

		let y_inverted_location = vec2<i32>(i32(invocation_id.x), i32(R.y) - i32(invocation_id.y));
		let location = vec2<i32>(i32(invocation_id.x), i32(invocation_id.y));
		
		var fragColor: vec4<f32>;
		var fragCoord = vec2<f32>(f32(location.x), f32(location.y) );
	
		let uv: vec2<f32> = fragCoord.xy / uniforms.resolution.xy - 0.5;

		let time: f32 = uniforms.time;

		
		var color: f32 = 0.;
		color = color + (sin(uv.x * cos(time / 15.) * 80.) + cos(uv.y * cos(time / 15.) * 10.));
		color = color + (sin(uv.y * sin(time / 10.) * 40.) + cos(uv.x * sin(time / 25.) * 40.));
		color = color + (sin(uv.x * sin(time / 5.) * 10.) + sin(uv.y * sin(time / 35.) * 80.));
		color = color * (sin(time / 10.) * 0.5);
	

		return  vec4<f32>(vec3<f32>(color, color * 0.5, sin(color + time / 3.) * 0.75), 1.);
		
	}


	struct VertexOutput {
        @builtin(position) pos: vec4<f32>,
        @location(0) uv: vec2<f32>
    };  



@fragment
fn main_fragment(in: VertexOutput) -> @location(0) vec4<f32> {      

	return mainImage(in.pos.xy);
	
}

`};