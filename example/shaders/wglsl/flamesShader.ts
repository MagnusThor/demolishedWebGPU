import { defaultWglslVertex } from "../../../src/engine/Material";
import { IMaterialShader } from "../../../src/interface/IMaterialShader";



export const flamesShader: IMaterialShader = {
	vertex: defaultWglslVertex,
	fragment: /* glsl */ `

	struct VertexOutput {
		@builtin(position) pos: vec4<f32>,
		@location(0) uv: vec2<f32>
	  };    
   
	struct Uniforms {
		resolution: vec3<f32>,
		time: f32,
		mouse: vec4<f32>,
		frame: f32
	  };
	
	  @group(0) @binding(0) var<uniform> uniforms: Uniforms;
	
		@group(0) @binding(1) var linearSampler: sampler;
		@group(0) @binding(2) var iChannel0: texture_2d<f32>; 
	
		
	
	fn sample_texture(tex:texture_2d<f32>,uv:vec2<f32>) -> vec4<f32>{
		let result:vec4<f32> = textureSample(tex, linearSampler, -uv);
		return result;
	}   
	

	fn noise(x: vec3<f32>) -> f32 {
		let p: vec3<f32> = floor(x);
		var f: vec3<f32> = fract(x);
		f = f * f * (3. - 2. * f);
		let uv: vec2<f32> = p.xy + vec2<f32>(37., 17.) * p.z + f.xy;
		let rg: vec2<f32> = textureSampleLevel(iChannel0, linearSampler, (uv + 0.5) / 256., f32(0.)).yx;
		return mix(rg.x, rg.y, f.z);
	} 

	fn map(p: vec3<f32>) -> vec4<f32> {

		var tm = uniforms.time;

		var p_var = p;
		let r: vec3<f32> = p_var;
		p_var.y = p_var.y + (0.6);
		p_var = -4. * p_var / dot(p_var, p_var);
		let an: f32 = -1. * sin(0.1 * tm + length(p_var.xz) + p_var.y);
		let co: f32 = cos(an);
		let si: f32 = sin(an);
		var pxz = p_var.xz;
		pxz = mat2x2<f32>(co, -si, si, co) * p_var.xz;
		p_var.x = pxz.x;
		p_var.z = pxz.y;
	//	var pxz = p_var.xz;
		pxz = p_var.xz + (-1. + 2. * noise(p_var * 1.1));
		p_var.x = pxz.x;
		p_var.z = pxz.y;
		var f: f32;
		var q: vec3<f32> = p_var * 0.85 - vec3<f32>(0., 1., 0.) * tm * 0.12;
		f = 0.5 * noise(q);
		q = q * 2.02 - vec3<f32>(0., 1., 0.) * tm * 0.12;
		f = f + (0.25 * noise(q));
		q = q * 2.03 - vec3<f32>(0., 1., 0.) * tm * 0.12;
		f = f + (0.125 * noise(q));
		q = q * 2.01 - vec3<f32>(0., 1., 0.) * tm * 0.12;
		f = f + (0.0625 * noise(q));
		q = q * 2.02 - vec3<f32>(0., 1., 0.) * tm * 0.12;
		f = f + (0.04 * noise(q));
		q = q * 2. - vec3<f32>(0., 1., 0.) * tm * 0.12;
		let den: f32 = clamp((-r.y - 0.6 + 4. * f) * 1.2, 0., 1.);

		var col: vec3<f32> = 1.2 * mix(vec3<f32>(1., 0.8, 0.6), 0.9 * vec3<f32>(0.3, 0.2, 0.35), den);
		col = col + (0.05 * sin(0.05 * q));
		col = col * (1. - 0.8 * smoothstep(0.6, 1., sin(0.7 * q.x) * sin(0.7 * q.y) * sin(0.7 * q.z)) * vec3<f32>(0.6, 1., 0.8));
		col = col * (1. + 1. * smoothstep(0.5, 1., 1. - length((fract(q.xz * 0.12) - 0.5) / 0.5)) * vec3<f32>(1., 0.9, 0.8));
		
		//col = mix(vec3<f32>(0.8, 0.32, 0.2), col, clamp((r.y + 0.1) / 1.5, 0., 1.));
		
		return vec4<f32>(col, den);
	} 
	
	fn debugImage(invocation_id: vec2<f32>) -> vec4<f32> {
			return vec4<f32>(1.0,0.,0.,0.5);
	}

	fn mainImage(invocation_id: vec2<f32>) -> vec4<f32> {

		// if(uniforms.frame <
		// 	 1000) {
		// 	return vec4<f32>(1.0,0.0,0.0,0.5);
		// }

		let mouse: vec4<f32> = uniforms.mouse;
	
		let R: vec2<f32> = uniforms.resolution.xy;
		let y_inverted_location = vec2<i32>(i32(invocation_id.x), i32(R.y) - i32(invocation_id.y));
		let location = vec2<i32>(i32(invocation_id.x), i32(invocation_id.y));
		
		var fragColor: vec4<f32>;
		var fragCoord = vec2<f32>(f32(location.x), f32(location.y) );
	
		let q: vec2<f32> = fragCoord.xy / uniforms.resolution.xy;
		let p: vec2<f32> = (-1. + 2. * q) * vec2<f32>(uniforms.resolution.x / uniforms.resolution.y, 1.);
		var mo: vec2<f32> = mouse.xy / uniforms.resolution.xy;
		
		//if (mouse.w <= 0.00001) { mo = vec2<f32>(0.); }

		let an: f32 = -0.07 * uniforms.time + 3. * mo.x;
		var ro: vec3<f32> = 4.5 * normalize(vec3<f32>(cos(an), 0.5, sin(an)));
		ro.y = ro.y + (1.);
		let ta: vec3<f32> = vec3<f32>(0., 0.5, 0.);
		let cr: f32 = -0.4 * cos(0.02 * uniforms.time);
		let ww: vec3<f32> = normalize(ta - ro);
		let uu: vec3<f32> = normalize(cross(vec3<f32>(sin(cr), cos(cr), 0.), ww));
		let vv: vec3<f32> = normalize(cross(ww, uu));
		let rd: vec3<f32> = normalize(p.x * uu + p.y * vv + 2.5 * ww);
		var sum: vec4<f32> = vec4<f32>(0.);
		let bg: vec3<f32> = vec3<f32>(0.4, 0.5, 0.5) * 1.3;
		var t: f32 = 0.05 * fract(10.5421 * dot(vec2<f32>(0.0149451, 0.038921), fragCoord));
	
		for (var i: i32 = 0; i < 128; i = i + 1) {
			if (sum.a > 0.99) {	
					break;
		 	}

			let pos: vec3<f32> = ro + t * rd;
		var col: vec4<f32> = map(pos);
		col.a = col.a * (0.5);
		var colrgb = col.rgb;
		colrgb = mix(bg, col.rgb, exp(-0.002 * t * t * t)) * col.a;
		col.r = colrgb.x;
		col.g = colrgb.y;
		col.b = colrgb.z;
			sum = sum + col * (1. - sum.a);
			t = t + (0.05);
		}
	
		// Ensure bg, sum.xyz, and sum.w are all vec3<f32> values
		// var bg: vec3<f32>; // assuming bg is a vec3<f32>
		// var sum: vec4<f32>; // assuming sum is a vec4<f32>

		// Calculate the mixed value
		var mixedValue: vec3<f32> = mix(bg, sum.xyz / (0.001 + sum.w), sum.w);

// 		Clamp each component individually between 0 and 1
		var col: vec3<f32> = clamp(mixedValue, vec3<f32>(0.0), vec3<f32>(1.0));

		// var col: vec3<f32> = clamp(mix(bg, sum.xyz / (0.001 + sum.w), sum.w), 0., 1.);
		col = col * col * (3. - 2. * col) * 1.4 - 0.4;
		col = col * (0.25 + 0.75 * pow(16. * q.x * q.y * (1. - q.x) * (1. - q.y), 0.1));
		return vec4<f32>(col, 1.);
	} 
		


	@fragment
	fn main_fragment(vert: VertexOutput) -> @location(0) vec4<f32> {    
		
		return mainImage(vert.pos.xy);
	}

`};