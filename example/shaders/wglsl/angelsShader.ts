import { IMaterialShader } from "../../../src/IMaterialShader";
import { defaultWglslVertex } from "../../../src/Material";

export const angelsShader: IMaterialShader = {
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


	const lig:vec3<f32> = normalize(vec3<f32>(-0.5,0.7,-1.0));
	const axis: vec3<f32> = normalize(vec3<f32>(-0.3, -1., -0.4));


	// helpers

	fn hash1(p: vec2<f32>) -> f32 {
		return fract(sin(p.x + 131.1 * p.y) * 1751.5453);
	} 
	
	fn hash3(n: f32) -> vec3<f32> {
		return fract(sin(vec3<f32>(n, n + 1., n + 2.)) * vec3<f32>(43758.547, 22578.146, 19642.35));
	} 
	

	fn rotationMat(v: vec3<f32>, angle: f32) -> mat3x3<f32> {
		let c: f32 = cos(angle);
		let s: f32 = sin(angle);
		return mat3x3<f32>(c + (1. - c) * v.x * v.x, (1. - c) * v.x * v.y - s * v.z, (1. - c) * v.x * v.z + s * v.y, (1. - c) * v.x * v.y + s * v.z, c + (1. - c) * v.y * v.y, (1. - c) * v.y * v.z - s * v.x, (1. - c) * v.x * v.z - s * v.y, (1. - c) * v.y * v.z + s * v.x, c + (1. - c) * v.z * v.z);
	} 
	
	
	// 


	fn map(p: vec3<f32>) -> vec2<f32> {
		var p_var = p;
		
		let atime: f32 = uniforms.time + 12.;

		var o: vec2<f32> = floor(0.5 + p_var.xz / 50.);
		
		let o1: f32 = hash1(o);
		let f: f32 = sin(1. + (2. * atime + 31.2 * o1) / 2.);
		
		p_var.y = p_var.y - (2. * (atime + f * f));
		p_var = ((p_var + 25.) % (50.)) - 25.;
		if (abs(o.x) > 0.5) { p_var = p_var + ((-1. + 2. * o1) * 10.); }
		let roma: mat3x3<f32> = rotationMat(axis, 0.34 + 0.07 * sin(31.2 * o1 + 2. * atime + 0.1 * p_var.y));
	
		for (var i: i32 = 0; i < 16; i = i + 1) {
			p_var = roma * abs(p_var);
			p_var.y = p_var.y - (1.);
		}
	
		var d: f32 = length(p_var * vec3<f32>(1., 0.1, 1.)) - 0.75;

		return vec2<f32>(d, 0.5 + p_var.z);
	} 
	
	fn raycast(ro: vec3<f32>, rd: vec3<f32>) -> vec2<f32> {
		var maxd: f32 = 140.;
		
		const precis: f32 = 0.001;
		
		var t: f32 = 0.;
		var d: f32 = 0.;
	
		for (var i: i32 = 0; i < 200; i = i + 1) {
			let res: vec2<f32> = map(ro + rd * t);
				if (res.x < precis || t > maxd) {		
					break;
				}
			t = t + (0.6 * min(res.x, 5.));
			d = res.y;
		}
	
		if (t > maxd) { t = -1.; }
		return vec2<f32>(t, d);
	} 
	
	
	fn calcNormal(pos: vec3<f32>) -> vec3<f32> {
		let eps: vec3<f32> = vec3<f32>(0.2, 0., 0.);
		return normalize(vec3<f32>(map(pos + eps.xyy).x - map(pos - eps.xyy).x, map(pos + eps.yxy).x - map(pos - eps.yxy).x, map(pos + eps.yyx).x - map(pos - eps.yyx).x));
	} 
	
	fn softshadow(ro: vec3<f32>, rd: vec3<f32>, mint: f32, k: f32) -> f32 {
		var res: f32 = 1.;
		var t: f32 = mint;
	
		for (var i: i32 = 0; i < 128; i = i + 1) {
			let h: f32 = map(ro + rd * t).x;
			res = min(res, k * h / t);
			if (res < 0.0001) {		break;
	 }
			t = t + (clamp(h, 0.01, 0.5));
		}
	
		return clamp(res, 0., 1.);
	} 
	
	fn calcAO(pos: vec3<f32>, nor: vec3<f32>) -> f32 {
		var totao: f32 = 0.;
	
		for (var aoi: i32 = 0; aoi < 16; aoi = aoi + 1) {
			var aopos: vec3<f32> = -1. + 2. * hash3(f32(aoi) * 213.47);
			aopos = aopos * (sign(dot(aopos, nor)));
			aopos = pos + aopos * 0.5;
			let dd: f32 = clamp(map(aopos).x * 4., 0., 1.);
			totao = totao + (dd);
		}
	
		totao = totao / (16.);
		return clamp(totao * totao * 1.5, 0., 1.);
	} 


	

	fn render(ro: vec3<f32>, rd: vec3<f32>, fc: vec2<f32>) -> vec3<f32> {

		let bgc: vec3<f32> = 0.6 * vec3<f32>(0.8, 0.9, 1.) * (0.5 + 0.3 * rd.y);
		
		var col: vec3<f32> = bgc;
		let tmat: vec2<f32> = raycast(ro, rd);
		var dis: f32 = tmat.x;
	
		if (tmat.x > 0.) {
			var pos: vec3<f32> = ro + tmat.x * rd;
			let nor: vec3<f32> = calcNormal(pos);
			let mate: vec3<f32> = 0.5 + 0.5 * mix(sin(vec3<f32>(1.2, 1.1, 1.) * tmat.y * 3.), sin(vec3<f32>(1.2, 1.1, 1.) * tmat.y * 6.), 1. - abs(nor.y));
			let occ: f32 = calcAO(pos, nor);
			let amb: f32 = 0.8 + 0.2 * nor.y;
			var dif: f32 = max(dot(nor, lig), 0.);
			let bac: f32 = max(dot(nor, normalize(vec3<f32>(-lig.x, 0., -lig.z))), 0.);
			var sha: f32 = 0.;
			if (dif > 0.001) { 
				sha = softshadow(pos + 0.001 * nor, lig, 0.1, 32.); 
			}
			let fre: f32 = pow(clamp(1. + dot(nor, rd), 0., 1.), 2.);
			var brdf: vec3<f32> = vec3<f32>(0.);
			brdf = brdf + (1. * dif * vec3<f32>(1., 0.9, 0.65) * pow(vec3<f32>(sha), vec3<f32>(1., 1.2, 1.5)));
			brdf = brdf + (1. * amb * vec3<f32>(0.05, 0.05, 0.05) * occ);
			brdf = brdf + (1. * bac * vec3<f32>(0.03, 0.03, 0.03) * occ);
			brdf = brdf + (1. * fre * vec3<f32>(1., 0.7, 0.4) * occ * (0.2 + 0.8 * sha));
			brdf = brdf + (1. * occ * vec3<f32>(1., 0.7, 0.3) * occ * max(dot(-nor, lig), 0.) * pow(clamp(dot(rd, lig), 0., 1.), 64.) * tmat.y * 2.);
			col = mate * brdf;
			col = mix(col, bgc, clamp(1. - 1.2 * exp(-0.0002 * tmat.x * tmat.x), 0., 1.));
		} else { 
			let sun: vec3<f32> = vec3<f32>(1., 0.8, 0.5) * pow(clamp(dot(rd, lig), 0., 1.), 32.);
			col = col + (sun);
			dis = 140.;
		}

		 var gr: f32 = 0.;
		// var t: f32 = 10.1 * hash1(fc);
	
		// for (var i: i32 = 0; i < 32; i = i + 1) {
		// 	let pos: vec3<f32> = ro + t * rd;
		// 	let dt: f32 = clamp(0.3 * t, 1., 10.);
		// 	gr = gr + (dt * softshadow(pos, lig, 0.01, 128.));
		// 	t = t + (dt);
		// 	if (t > dis) {		
		// 		break;
		// 	 }
		// }
	
		col = col + (vec3<f32>(1., 0.9, 0.7) * pow(gr * 0.004, 2.) - 0.02);
		col = col + (0.6 * vec3<f32>(0.2, 0.14, 0.1) * pow(clamp(dot(rd, lig), 0., 1.), 5.));
		col = pow(col, vec3<f32>(0.45));
		col = 1.3 * col - 0.1;
		col = col * (vec3<f32>(1., 1.04, 1.));
		return col;
	} 
	
	
	



	fn mainImage(id: vec4<f32>) -> vec4<f32> {

		let R: vec2<f32> = uniforms.resolution.xy; // screen dimentions

		var fragColor: vec4<f32>;
		/*

	 	let screen_size = textureDimensions(screen);
    	if (id.x >= screen_size.x || id.y >= screen_size.y) { return; }
   		 let fragCoord = float2(f32(id.x) + .5, f32(screen_size.y - id.y) - .5);
   		 let uv = (2.*fragCoord - vec2f(screen_size)) / f32(screen_size.y);
		*/
		
		if (id.x >= R.x || id.y >= R.y) { 
				return fragColor;	
		 }


	//	let y_inverted_location = vec2<i32>(i32(invocation_id.x), i32(R.y) - i32(invocation_id.y));
//		let location = vec2<i32>(i32(invocation_id.x), i32(invocation_id.y));
		
	

		var fragCoord = vec2<f32>(id.x + .5, (R.y - id.y) - .5);
		var uv = (2.*fragCoord - R.xy) / R.y;
	
	//	var fragCoord = vec2<f32>(f32(location.x), f32(location.y) );
	

		var time:f32 = uniforms.time;
	
		var p: vec2<f32> = (2. * fragCoord.xy - R.xy) /R.y;

		let m: vec2<f32> = vec2<f32>(0.5);
		
		let an: f32 = 2.5 + 0.12 * time - 6.2 * m.x;
		let cr: f32 = 0.3 * cos(0.2 * uniforms.time);
		
		let ro: vec3<f32> = vec3<f32>(15. * sin(an), 12. - 24. * m.y, 15. * cos(an));
		let ta: vec3<f32> = vec3<f32>(0., 2., 0.);
		let ww: vec3<f32> = normalize(ta - ro);
		let uu: vec3<f32> = normalize(cross(ww, vec3<f32>(sin(cr), cos(cr), 0.)));
		let vv: vec3<f32> = normalize(cross(uu, ww));
		let r2: f32 = p.x * p.x * 0.32 + p.y * p.y;
		p = p * ((7. - sqrt(37.5 - 11.5 * r2)) / (r2 + 1.));
		let rd: vec3<f32> = normalize(p.x * uu + p.y * vv + 1.2 * ww);
		var col: vec3<f32> = render(ro, rd, fragCoord);
	//	let q: vec2<f32> = fragCoord.xy / uniforms.resolution.xy;
	//	col = col * (pow(16. * q.x * q.y * (1. - q.x) * (1. - q.y), 0.1));
		fragColor = vec4<f32>(col, 1.);


		return  fragColor;
		
	}


	struct VertexOutput {		
        @builtin(position) pos: vec4<f32>,
        @location(0) uv: vec2<f32>,
    };  



@fragment
fn main_fragment(in: VertexOutput) -> @location(0) vec4<f32> {      

	return mainImage(in.pos);
	
}

`};