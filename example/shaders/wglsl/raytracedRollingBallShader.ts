import { IMaterialShader } from "../../../src/IMaterialShader";
import { defaultWglslVertex } from "../../../src/Material";
import { commonFunctions } from "../compute/common";

export const raytracedRollingBallShader: IMaterialShader = {
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
	@group(0) @binding(3) var iChannel1: texture_2d<f32>; 
	@group(0) @binding(4) var iChannel2: texture_2d<f32>; 
	@group(0) @binding(5) var iChannel3: texture_2d<f32>; 
	

	const ballRad: f32 = 0.5;

	var<private> sph4: vec4<f32> = vec4<f32>(0., ballRad - 1., 1., ballRad);
	var<private> boxNrm: vec3<f32>;
	var<private> seed: vec2<f32> = vec2<f32>(0.183, 0.257);


	
	fn floatBitsToInt(value: f32) -> i32 {
		return i32(value);
	}

	// fn floatBitsToInt(value: f32) -> i32 {
	// 	var intValue: i32 = 0;
	// 	let numBits: i32 = 32;
	
	// 	for (var i: i32 = 0; i < numBits; i = i + 1) {
	// 		let mask: i32 = i32(pow(2.0, f32(i)));
	// 		var bit: i32;
	// 		if ((i32(value) & mask) != 0) {
	// 			bit = 1;
	// 		} else {
	// 			bit = 0;
	// 		}
	// 		intValue = intValue | (bit * i32(1u << u32(i)));
	// 	}
	
	// 	return intValue;
	// }
	

	
	
	
	fn floatBitsToUint(value: f32) -> u32 {
		return u32(value);
		// var uintValue: u32 = 0u;
		// let numBits: i32 = 32;
		// 	for (var i: i32 = 0; i < numBits; i = i + 1) {
		// 	let mask: u32 = u32(pow(2.0, f32(i)));
		// 	var bit: u32;
		// 	if ((u32(value) & mask) != 0u) {
		// 		bit = 1u;
		// 	} else {
		// 		bit = 0u;
		// 	}
		// 	uintValue = uintValue | (bit * (1u << u32(i)));
		// }
		// return uintValue;
	}
	
	fn sample_texture(tex:texture_2d<f32>,uv:vec2<f32>) -> vec4<f32>{
		let result:vec4<f32> = textureSample(tex, linearSampler, -uv);
		return result;
	}   
	
	fn rot2(a: f32) -> mat2x2<f32> {
		var c: f32 = cos(a);
		var s: f32 = sin(a);
		return mat2x2<f32>(c, -s, s, c);
	} 

	fn hash(p: vec2<f32>) -> f32 {
		var h: f32 = dot(p, vec2<f32>(127.1, 311.7));
		return -1.0 + 2.0 * fract(sin(h) * 43758.5453123);
	}
	
	fn hash21(f: vec2<f32>) -> f32 {
		return hash(f * vec2<f32>(0.2483, 0.1437));
	} 
	
	fn hash31(f: vec3<f32>) -> f32 {
		var p: vec3<u32> = vec3<u32>(
			u32(f.x * 1000000.0),
			u32(f.y * 1000000.0),
			u32(f.z * 1000000.0)
		);
		//p = 1103515245u * ((p >> 2u) ^ ((p.yzx >> 1u) ^ p.zxy));
		//p = 1103515245u * ((vec3<u32>(p.x >> 2u, p.y >> 2u, p.z >> 2u)) ^ ((vec3<u32>(p.yzx >> 1u) ^ vec3<u32>(p.zxy))));
		p = 1103515245u * ((vec3<u32>(p.x >> 2u, p.y >> 2u, p.z >> 2u)) ^ ((vec3<u32>(p.y >> 1u, p.z >> 1u, p.x >> 1u)) ^ vec3<u32>(p.z >> 1u, p.x >> 1u, p.y >> 1u)));

		var h32: u32 = 1103515245u * (((p.x ^ p.y) >> 3u) ^ (p.z >> 6u));
		var n: u32 = h32 ^ (h32 >> 16);
		return f32(n & 2147483600u) / 2147483600.0;
	}
	
	fn hash22() -> vec2<f32> {
		// Update the seed using fract to ensure it stays within [0, 1].
		seed = fract(seed + vec2<f32>(0.7123, 0.6457));
		
		// Convert each component of the seed to unsigned integer separately.
		var p: vec2<u32> = vec2<u32>(floatBitsToUint(seed.x), floatBitsToUint(seed.y));
		
		// Perform bitwise operations and multiplication.
		p = 1103515245u * ((p >> vec2<u32>(1u)) ^ p.yx);
		
		// Calculate h32 using bitwise operations.
		let h32: u32 = 1103515245u * (p.x ^ (p.y >> 3u));
		
		// Calculate n using bitwise XOR.
		var n: u32 = h32 ^ (h32 >> 16);
		
		// Construct rz using bitwise operations and multiplication.
		let rz: vec2<u32> = vec2<u32>(n, n * 48271u);
		
		// Return a vec2<f32> by performing bitwise AND and division.
		return vec2<f32>((rz >> vec2<u32>(1u)) & vec2<u32>(2147483600u)) / 2147483600.0;
	}
	
	
	

	
	
	fn sBox(p: vec2<f32>, b: vec2<f32>, r: f32) -> f32 {
		var d: vec2<f32> = abs(p) - b + vec2<f32>(r);
		return min(max(d.x, d.y), 0.0) + length(max(vec2<f32>(d.x, 0.0), vec2<f32>(d.y, 0.0))) - r;
	}
	
	fn cosDir(seed: f32, n: vec3<f32>) -> vec3<f32> {
		var rnd: vec2<f32> = hash22();
		var u: f32 = rnd.x;
		let v: f32 = rnd.y;
		let a: f32 = 6.2831855 * v;
		u = 2. * u - 1.;
		return normalize(n + vec3<f32>(sqrt(1. - u * u) * vec2<f32>(cos(a), sin(a)), u));
	} 
	
	fn sphereNorm(p: vec3<f32>, id: f32, sph: vec4<f32>) -> vec3<f32> {
		return (p - sph.xyz) / sph.w;
	} 
	
	fn boxIntersect(ro: vec3<f32>, rd: vec3<f32>, dim: vec3<f32>) -> vec4<f32> {
		let maxT: f32 = 100000000.;
		var minD: vec3<f32> = (ro + dim) / rd;
		var maxD: vec3<f32> = (ro - dim) / rd;
		minD = -(minD - step(vec3<f32>(-0.000001), minD) * (minD + maxT));
		maxD = -(maxD - step(vec3<f32>(-0.000001), maxD) * (maxD + maxT));
		minD = min(minD, maxD);
		var res: vec4<f32> = vec4<f32>(maxT, 0., 0., 0.);
		if (minD.x < maxT) {
			var pd: f32 = abs(ro.y + rd.y * minD.x) - dim.y;
			if (pd < 0.) { res = vec4<f32>(minD.x, -sign(rd.x), 0., 0.); }
		}
		if (minD.y < maxT) {
			var pd: f32 = abs(ro.x + rd.x * minD.y) - dim.x;
			if (pd < 0.) { res = vec4<f32>(minD.y, 0., -sign(rd.y), 0.); }
		}
		return res;
	} 
	
	fn sphereIntersect(ro: vec3<f32>, rd: vec3<f32>, sph: vec4<f32>) -> vec2<f32> {
		let oc: vec3<f32> = ro - sph.xyz;
		let b: f32 = dot(oc, rd);
		if (b > 0.) {	return vec2<f32>(100000000., 0.);
	 }
		var c: f32 = dot(oc, oc) - sph.w * sph.w;
		let h: f32 = b * b - c;
		if (h < 0.) {	return vec2<f32>(100000000., 0.);
	 }
		return vec2<f32>(-b - sqrt(h), 1.);
	} 
	
	
	fn getNorm(p: vec3<f32>, id: f32) -> vec3<f32> {
		var norm:vec3<f32> = boxNrm;
		if (id < 0.5){ 
			norm = sphereNorm(p, id, sph4);
			 } 
		return norm;
			  
	} 
	
	fn intersect(ro: vec3<f32>, rd: vec3<f32>) -> vec3<f32> {
	
		var q: array<vec2<f32>, 2>;
	
		q[0] = sphereIntersect(ro, rd, sph4);
		let bx: vec4<f32> = boxIntersect(ro - vec3<f32>(0., 1.5 - 1., -0.5 * 0.), rd, vec3<f32>(2., 1.5, 100000000.));
		q[1] = vec2<f32>(bx.x, 1.);
		boxNrm = bx.yzw;
		
		if (q[0].x < q[1].x) {
			return vec3<f32>(q[0], 0.);
		} else {
			return vec3<f32>(q[1], 1.);
		}
		
	}
	
	
	fn distField2(p: vec2<f32>, scl: f32, rndZ: f32, oID: f32) -> vec3<f32> {
		var p_var = p;
		let ew: f32 = 0.0125;
		var pp: vec2<f32> = abs(fract(p_var) - 0.5);
		var sq: f32 = abs(max(pp.x, pp.y) - 0.5) - ew * 2.;
		let sc: vec2<f32> = vec2<f32>(1., 1.) / scl;
		let ip: vec2<f32> = floor(p_var / sc);
		p_var = p_var - ((ip + 0.5) * sc);
		var d: f32 = sBox(p_var, sc / 2. - ew, 0.1 * min(sc.x, sc.y) * 0.);


		let hashResult:f32 = hash21(ip + rndZ * 0.123 + oID + 0.055);

		let hsh:f32 = hash21(ip + rndZ * 0.401 + oID + 0.043) * 64.;

		if (hashResult < 0.65) {
			var f: f32 = scl * 4.;
			var n: f32 = floor(hsh) * 3.14159 / 4.;
			var uv: vec2<f32> = rot2(n) * (p_var + vec2<f32>(f / 2., 0.));
			var g: f32 = (abs(fract(uv.x * f + n * f * 0.) - 0.5) - 0.175) / f;
			d = max(d, g);
		}
		if (oID == 0.) { d = max(d, -sq); }
		return vec3<f32>(d, ip * sc);
	} 
	
	fn distField(p: vec2<f32>, scl: f32, oID: f32) -> vec3<f32> {
		var p_var = p;
		p_var = p_var * (scl);
		var rnd: f32 = hash21(floor(p_var) + oID * 0.123);
		let p2: vec2<f32> = p_var / (rnd + 0.1);
		let pp: vec2<f32> = fract(p2) - 0.5;
		let sq: f32 = (abs(max(abs(pp.x), abs(pp.y)) - 0.5) - 1. / 40.) / 2. * (rnd + 0.1);
	;
		rnd = hash21(floor(p2) + oID * 0.123);
		let n: f32 = floor(rnd * 64.) * 3.14159 / 4.;
		var id: vec2<f32> = rnd + ceil(p2);
		var f: f32 = 1. / hash21(floor(id) + oID * 0.123) / 3.14159;
		var g: f32 = (abs(fract((rot2(n) * p_var).x * f) - 0.5) - 0.25) / f;
		g = max(g, -sq);
		return vec3<f32>(g, id);
	} 
	
	fn sBoxS(p: vec2<f32>, b: vec2<f32>, rf: f32) -> f32 {
		let d: vec2<f32> = abs(p) - b + vec2<f32>(rf);
		let inside: vec2<f32> = max(vec2<f32>(d.x, 0.0), vec2<f32>(d.y, 0.0));
		return min(max(d.x, d.y), 0.0) + length(inside) - rf;
	}

	
	fn rot(ang: vec3<f32>) -> mat3x3<f32> {
		let c: vec3<f32> = cos(ang);
		let s: vec3<f32> = sin(ang);
		return mat3x3<f32>(c.x * c.z - s.x * s.y * s.z, -s.x * c.y, -c.x * s.z - s.x * s.y * c.z, c.x * s.y * s.z + s.x * c.z, c.x * c.y, c.x * s.y * c.z - s.x * s.z, c.y * s.z, -s.y, c.y * c.z);
	} 
	
	fn cubeMap(p: vec3<f32>) -> vec4<f32> {
		var f: vec3<f32> = abs(p);
		f = step(f.zxy, f) * step(f.yzx, f);
		
		var idF: vec3<i32>;
		if (p.x < 0.) {
			idF.x = -1;
		} else {
			idF.x = 1;
		}
		if (p.y < 0.) {
			idF.y = -1;
		} else {
			idF.y = 1;
		}
		if (p.z < 0.) {
			idF.z = -1;
		} else {
			idF.z = 1;
		}
		
		var faceID: vec3<i32> = (idF + 1) / 2 + vec3<i32>(0, 2, 4);
		
		if (f.x > 0.5) {
			return vec4<f32>(p.yz / p.x, f32(idF.x), f32(faceID.x));
		} else {
			if (f.y > 0.5) {
				return vec4<f32>(p.xz / p.y, f32(idF.y), f32(faceID.y));
			} else {
				return vec4<f32>(p.xy / p.z, f32(idF.z), f32(faceID.z));
			}
		}
	}
	
		

	fn mainImage(invocation_id:vec2<f32>) -> vec4<f32>{

		let R: vec2<f32> = uniforms.resolution.xy;
		let y_inverted_location = vec2<i32>(i32(invocation_id.x), i32(R.y) - i32(invocation_id.y));
		let location = vec2<i32>(i32(y_inverted_location.x), i32(y_inverted_location.y));
		
		var fragColor: vec4<f32>;
		var fragCoord = vec2<f32>(f32(location.x), f32(location.y) );
	
		let sf: f32 = 1. / uniforms.resolution.y;
		let iRes: f32 = uniforms.resolution.y;

		let seed0: vec2<f32> = fract(uniforms.time / vec2<f32>(111.13, 57.61)) * vec2<f32>(-0.143, 0.457);

		let uv0: vec2<f32> = (fragCoord - uniforms.resolution.xy * 0.5) / iRes;
		
		let FOV: f32 = 1.;
		
		let ro: vec3<f32> = vec3<f32>(0., 0., uniforms.time * 2. + sin(uniforms.time) * 0.125);
		
		let lk: vec3<f32> = ro + vec3<f32>(0., -0.01, 0.25);
		let fwd: vec3<f32> = normalize(lk - ro);
		let rgt: vec3<f32> = normalize(vec3<f32>(fwd.z, 0., -fwd.x));
		let up: vec3<f32> = cross(fwd, rgt);

		var mCam: mat3x3<f32> = mat3x3<f32>(rgt, up, fwd);

		mCam = mCam * (rot(vec3<f32>(0., 0.05, 0.)));
		mCam = mCam * (rot(vec3<f32>(0., 0., -sin(uniforms.time / 2.) * 0.25)));

		mCam = mCam * (rot(vec3<f32>(-cos(uniforms.time / 2.) * 0.25, 0., 0.)));
		
		if (uniforms.mouse.z > 0.) {
			let ms: vec2<f32> = (uniforms.mouse.xy / uniforms.resolution.xy - 0.5) * vec2<f32>(3.14159 / 2.);
			mCam = mCam * (rot(vec3<f32>(0., ms.y / 2., -ms.x)));
		}
		sph4.x = sph4.x - (cos(uniforms.time / 2.) * 0.25);
		sph4.z = ro.z + 4.;
		var aCol: vec3<f32> = vec3<f32>(0.);
		var gT: f32 = 100000000.;
		var avgT: f32 = 0.;

		let frameC:i32 =i32(uniforms.frame);
	
		for (var j: i32 = min(0, frameC); j < 12; j = j + 1) {

			//seed = uv0 + seed0 + vec2<f32>(j * 57., j * 27.) / 1321.;

			seed = uv0 + seed0 + vec2<f32>(f32(j) * 57., f32(j) * 27.) / 1321.;

			let jit: vec2<f32> = hash22() * 2. - 1.;
			let uv: vec2<f32> = uv0 - jit / uniforms.resolution.y;
			var rd: vec3<f32> = mCam * normalize(vec3<f32>(uv, 1. / FOV));
			let cam: vec3<f32> = ro;
			var sp: vec3<f32> = ro;
			let col: vec3<f32> = vec3<f32>(0.);
			var emissive: vec3<f32> = vec3<f32>(0.);
			var through: vec3<f32> = vec3<f32>(1.);
			var sCol: vec3<f32> = vec3<f32>(0.);
			var fogD: f32 = 100000000.;
	
			for (var i: i32 = min(0, frameC); i < 3; i = i + 1) {

				let scene: vec3<f32> = intersect(sp, rd);
				let t: f32 = scene.x;
				let retVal: f32 = scene.y;
				let id: f32 = scene.z;
				if (i == 0) {
					fogD = t;
					avgT = avgT + (t / f32(12.));
					if (j == 0) { gT = fogD; }
				}
				
				sp = sp + (rd * t);


				if (t < 100000000.) {
				
					var sn: vec3<f32> = getNorm(sp, id);
					var oCol: vec3<f32> = vec3<f32>(0.);
					var emissive: vec3<f32> = vec3<f32>(0.);
					emissive = vec3<f32>(0.);
					var rough: f32 = 0.;

					if (id < 0.5) {
						var txP: vec3<f32> = sp - sph4.xyz;
						var txPxy = txP.xy;
							txPxy = txP.xy * (rot2(sph4.x / sph4.w / 2.));
							txP.x = txPxy.x;
							txP.y = txPxy.y;
											var txPyz = txP.yz;
							txPyz = txP.yz * (rot2(-sph4.z / sph4.w));
							txP.y = txPyz.x;
							txP.z = txPyz.y;

						let q3: vec4<f32> = cubeMap(txP);

						let faceID: f32 = q3.w;
						var d3: vec3<f32> = distField2(q3.xy / 2. + 0.5, 6., q3.z, faceID);

						d3.x = smoothstep(0., sf, d3.x);
						var rnd2: f32 = hash21(d3.yz + q3.z * 0.051 + faceID + 0.024);
	
						let sRnd: f32 = rnd2;
						rnd2 = smoothstep(0.4, 0.45, sin(6.2831 * rnd2 + uniforms.time / 1.));

						var wCol: vec3<f32> = 0.5 + 0.5 * cos(6.2831 * hash21(d3.yz + q3.z * 5.51 + faceID + 0.374) / 2. + vec3<f32>(0., 1., 2.) * 1.1 - 0.);
						
						oCol = mix(vec3<f32>(0.9, 0.95, 1.) * (hash21(d3.yz + q3.z * 2.035 + faceID + 0.144) * 0.5 + 0.5), vec3<f32>(0.1), d3.x);
						wCol = wCol * vec3<f32>(4., 2., 1.);
						emissive = mix(wCol * (rnd2 * 0.785 + 0.015) * 3. * vec3<f32>(1., 0.97, 0.92), vec3<f32>(0.005), d3.x);
						rough = hash21(d3.yz + q3.z + 0.11);
						rough = rough * rough * 0.3 + 0.025;
						rough = rough * (hash31(sp + 0.51) * 0.5 + 0.75);
						if (hash21(d3.yz + faceID + 0.063) < 0.5) {
							oCol = vec3<f32>(1.) * dot(oCol, vec3<f32>(0.299, 0.587, 0.114));
							emissive = vec3<f32>(1.) * dot(emissive, vec3<f32>(0.299, 0.587, 0.114));
						}
					} else { 
						
						//let sgn: f32; if (abs(sn.z) > 0.5) { sgn = 1.; } else { sgn = -1.; };

						var sgn: f32;
						
						if (abs(sn.z) > 0.5) { 
							sgn = 1.;
						 } else { 
							sgn = -1.; 
						};
						
						var wID: f32;
						
						if (sgn < 0.) {
							if (sp.y < 0.) 
								{ wID =0.; } 
							else { 
								wID =2.; 
							}
						} else {
							if (sp.z < 0.) { 
								wID = 1.; } 
								else { wID = 3.; }
						};
						


						 
						
						var q: vec2<f32>;
						
						if (sgn > 0.5) { 
							q = sp.xy; 
						} else { 
							 if (abs(sn.x) > 0.5) { 
								q = sp.yz; 
							} else { 
								q = sp.xz; 
							}
						 };
						
						var strip: f32 = abs(((sp.z) % (4.)) - 2.) - 3. / 6.;
						var yStrip: f32 = abs(sp.y - 0.5) - 1.5 + 1. / 6.;


						var d3: vec3<f32>;
						if (strip < 0. && yStrip < 0.) {					
							 d3 = distField2(q, 6., wID, id);
						} else { 					
							if (abs(sn.y) > 0.5) {
									d3 = distField(q, 4., wID);
						} 
						else { 					
							d3 = distField(q, 2., wID);
							}
						}

						d3.x = smoothstep(0., sf, d3.x);

						var wCol: vec3<f32> = 0.5 + 0.5 * cos(6.2831 * hash21(d3.yz + wID * 0.054 + 0.274) / 2. + vec3<f32>(0., 1., 2.) * 1.1 - 1.5 * 1.);
					
						let wCol2: vec3<f32> = 0.5 + 0.5 * cos(6.2831 * hash21(d3.yz + wID * 0.054 + 0.273) / 2. + vec3<f32>(0., 1., 2.) * 1.1);

						if (strip > 0.) {
							wCol = vec3<f32>(1.) * dot(wCol2, vec3<f32>(0.299, 0.587, 0.114));
						} else {
							wCol = wCol2 * vec3<f32>(4., 2., 1.);
						}
						oCol = mix(vec3<f32>(0.9, 0.95, 1.) * (hash21(d3.yz + wID * 0.054 + 0.174) * 0.5 + 0.5), vec3<f32>(0.1), d3.x);
						var rnd2: f32 = hash21(d3.yz + 0.067);
						rnd2 = smoothstep(0.4, 0.47, sin(6.2831 * rnd2 + uniforms.time / 1.) * 0.5);
						if (abs(sn.y) < 0.5 && yStrip < 0.) { 
							emissive = mix(wCol * rnd2 * 4. * vec3<f32>(1., 0.97, 0.92), vec3<f32>(0.005), d3.x); 
						}
						if (abs(sn.x) > 0.5 && abs(yStrip - 0.015) - 0.015 < 0.) {
							oCol = oCol * (0.);
						}
						rough = hash21(d3.yz + wID * 0.021 + 0.11);
						rough = rough * rough * 0.3 + 0.025;
						rough = rough * (hash31(sp + 0.41) * 0.5 + 0.75);
					}
					sCol = sCol + (emissive * through);
					through = through * (oCol);
					let refl: vec3<f32> = reflect(rd, sn);
					let rrd: vec3<f32> = cosDir(0., sn);
					rd = normalize(mix(refl, rrd, rough));
					if (dot(rd, sn) < 0.) { 
						rd = -rd;
					 }
					sp = sp + (sn * 0.00001);
				}

				if (aCol.x > 100000.) {
								break;
				}
			}
	
			sCol = mix(vec3<f32>(0.), sCol, 1. / (1. + fogD * fogD * 0.02));
			aCol = aCol + (sCol);
			if (sCol.x > 100000.) {		
				break;
	 		}
		}
	
		aCol = aCol / (f32(12.));
		let preCol: vec4<f32> = sample_texture(iChannel0, fragCoord);
		var blend: f32; 
		if (uniforms.frame < 2) 
			{ 
				blend = 1.; 
			} 
		else {

			blend = 1. / 2.; 
		};
		blend = 1.;
		fragColor = mix(preCol, vec4<f32>(max(aCol, vec3<f32>(0.)), avgT), blend);
		return fragColor;
	}


	@fragment
	fn main_fragment(vert: VertexOutput) -> @location(0) vec4<f32> {    
		
		return mainImage(vert.pos.xy);
	}

`};