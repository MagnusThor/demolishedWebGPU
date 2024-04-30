import { IMaterialShader } from "../../../src/IMaterialShader";
import { defaultWglslVertex } from "../../../src/Material";

export const prismBreakShader: IMaterialShader = {
    vertex: defaultWglslVertex,
    fragment: /* glsl */ `
    
    struct Uniforms {
      resolution: vec3<f32>,
      time: f32
    };

    @group(0) @binding(0) var<uniform> uniforms: Uniforms;

	// @group(0) @binding(1) var linearSampler: sampler;
  	// @group(0) @binding(2) var iChannel0: texture_2d<f32>; 
	// @group(0) @binding(3) var iChannel1: texture_2d<f32>; 
	// @group(0) @binding(4) var iChannel2: texture_2d<f32>; 
	// @group(0) @binding(5) var iChannel3: texture_2d<f32>; 

    // Soundtrack Done with 4klang by Gopher / Alcatraz
    // Effets is a webgpu port of the "Prism Break" 4k intro by Alcatraz  
     

const kl: f32 = 0.;

var<private> ef: i32 = 1;
var<private> ot: vec4<f32>;
var<private>glFragCoord: vec2<f32>;

fn rotXaxis(p: vec3<f32>, rad: f32) -> vec3<f32> {

    var pvar:vec3<f32>;

	var z2: f32 = cos(rad) * p.z - sin(rad) * p.y;
	let y2: f32 = sin(rad) * p.z + cos(rad) * p.y;
	
    pvar.z = z2;
	pvar.y = y2;
	return pvar;
} 

fn rotYaxis(p: vec3<f32>, rad: f32) -> vec3<f32> {
    var pvar:vec3<f32>;

	let x2: f32 = cos(rad) * p.x - sin(rad) * p.z;
	let z2: f32 = sin(rad) * p.x + cos(rad) * p.z;
	
    pvar.x = x2;
	pvar.z = z2;
	return p;
} 

fn rand1(co: vec2<f32>) -> f32 {
	return fract(sin(dot(co.xy, vec2<f32>(12.98, 78.23))) * 43758.54);
} 

fn sdBox(p: vec3<f32>, b: vec3<f32>) -> f32 {
	var d: vec3<f32> = abs(p) - b;
    var dd:vec3<f32> = max(d, vec3<f32>(0));

	return min(max(d.x, max(d.y, d.z)), 0.) + length(dd);
} 

fn Boxes(pos: vec3<f32>) -> f32 {
	let rok: vec3<f32> = vec3<f32>(0.35);
	var m: f32;
	m = length(max(abs(rotYaxis(rotXaxis(pos + vec3<f32>(0., -0.3, 0.), uniforms.time * 0.3), uniforms.time * 0.15)) - rok, vec3<f32>(0))) - 0.03;
	m = min(m, length(max(abs(rotYaxis(rotXaxis(pos + vec3<f32>(0., -0.3, 1.2), uniforms.time * 0.21), uniforms.time * 0.24)) - rok, vec3<f32>(0))) - 0.03);
	m = min(m, length(max(abs(rotYaxis(rotXaxis(pos + vec3<f32>(0., -0.3, -1.2), uniforms.time * 0.2), uniforms.time * 0.3)) - rok, vec3<f32>(0))) - 0.03);
	m = min(m, length(max(abs(rotYaxis(rotXaxis(pos + vec3<f32>(1.2, -0.3, 0.), uniforms.time * 0.17), uniforms.time * 0.26)) - rok, vec3<f32>(0))) - 0.03);
	m = min(m, length(max(abs(rotYaxis(rotXaxis(pos + vec3<f32>(-1.2, -0.3, 0.), uniforms.time * 0.32), uniforms.time * 0.2)) - rok, vec3<f32>(0))) - 0.03);
	return m;
} 

fn Singlebox(pos: vec3<f32>) -> f32 {
	return length(max(abs(rotXaxis(pos + vec3<f32>(0., -0.5, 0.), uniforms.time * 0.47)) - vec3<f32>(0.55 - 0.025 * (kl + 0.4) * sin(pos.z * pos.x * pos.y * 35.)), vec3<f32>(0))) - 0.025;
} 

fn sdPlane(p: vec3<f32>) -> f32 {
	return p.y + 0.005 * sin(p.x * 10.) + 0.005 * sin(p.z * 12.) + 0.4;
} 

fn menger(pos: vec3<f32>) -> f32 {
	var d: f32 = sdBox(pos, vec3<f32>(1.));
	var s: f32 = 1.63 + 0.07 * sin(0.53 * uniforms.time) - 0.3 * pos.y;

	for (var m: i32 = 0; m < 2; m = m + 1) {
		let a: vec3<f32> = ((pos * s) % (2.)) - 1.;
		s = s * (3.);
		var r: vec3<f32> = abs(1. - 3. * abs(a)) - 0.025;
		let da: f32 = max(r.x, r.y);
		let db: f32 = max(r.y, r.z);
		let dc: f32 = max(r.z, r.x);
		let c: f32 = (min(da, min(db, dc)) - 1.) / s;
		d = max(d, c);
	}

	return d;
} 

fn map(p: vec3<f32>) -> f32 {
	var d: f32;
	var m: f32;
	ot = vec4<f32>(length(p) - 0.8 * p.z, length(p) - 0.8 * p.y, length(p) - 0.8 * p.x, 0.) * 0.8;
	d = sdPlane(p);
	if (ef == 0) { m = Boxes(p); }
	if (ef == 1 || ef == 3) { m = menger(rotYaxis(p, 0.12 * uniforms.time)); }
	if (ef == 2) { m = Singlebox(p + 0.1 * kl * rand1(glFragCoord.xy + uniforms.time)); }
	if (ef == 4) { m = min(menger(rotYaxis(p, 0.1 * uniforms.time)), sdBox(rotYaxis(rotXaxis(p + vec3<f32>(0., 0.2, 0.), uniforms.time), 0.2 * uniforms.time), vec3<f32>(0.1, 0.1, 0.04) - 0.002 * sin(p.x * p.y * 440. + uniforms.time)) - 0.01); }
	return min(m, d);
} 

fn softshadow(ro: vec3<f32>, rd: vec3<f32>) -> f32 {
	var sh: f32 = 1.;
	var t: f32 = 0.02;
	var h: f32 = 0.;

	for (var i: i32 = 0; i < 23; i = i + 1) {
		if (t > 20.) {		continue;
 }
		h = map(ro + rd * t) + 0.003 * rand1(glFragCoord.xy + uniforms.time);
		sh = min(sh, 4. * h / t);
		t = t + (h);
	}

	return sh;
} 

fn calcNormal(p: vec3<f32>) -> vec3<f32> {
	var e: vec3<f32> = vec3<f32>(0.0001, 0., 0.);
	if (ef == 1) { e = vec3<f32>(0.01, 0., 0.); }
	return normalize(vec3<f32>(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
} 

fn cycle(c: vec3<f32>, s: f32) -> vec3<f32> {
	let Cycles: f32 = 10.;
	return vec3<f32>(0.5) + 0.5 * vec3<f32>(cos(s * Cycles + c.x), cos(s * Cycles + c.y), cos(s * Cycles + c.z));
} 

fn getColor(o: f32) -> vec3<f32> {
    let Z: vec4<f32> = vec4<f32>(0.3, 0.5, 0.6, 0.2);
    let Y: vec4<f32> = vec4<f32>(0.1, 0.5, 1.0, -0.5);
    let X: vec4<f32> = vec4<f32>(0.7, 0.8, 1.0, 0.3);
    var orbitColor: vec3<f32> = cycle(X.xyz, ot.x) * X.w * ot.x + cycle(Y.xyz, ot.y) * Y.w * ot.y + cycle(Z.xyz, ot.z) * Z.w * ot.z;

    orbitColor.x = clamp(3.0 * orbitColor.x, 0.0, 4.0);
    orbitColor.y = clamp(3.0 * orbitColor.y, 0.0, 4.0);
    orbitColor.z = clamp(3.0 * orbitColor.z, 0.0, 4.0);

    return orbitColor;
}


fn castRay(ro: vec3<f32>, rd: vec3<f32>, maxt: f32) -> f32 {
	var precis: f32 = 0.001;
	var h: f32 = precis * 2.;
	var t: f32 = 0.;

	for (var i: i32 = 0; i < 130; i = i + 1) {
		if (abs(h) < precis || t > maxt) {		
            break;
    }
		h = map(ro + rd * t);
		t = t + (h);
	}

	return t;
} 

fn castRay2(ro: vec3<f32>, rd: vec3<f32>) -> f32 {
	let precis: f32 = 0.2;
	var h: f32 = 0.;
	var t: f32 = 0.01;

	for (var i: i32 = 0; i < 90; i = i + 1) {
		if (abs(h) > precis) {		
            break;
    }
		h = map(ro + rd * t);
		t = t - (h);
	}

	return t;
} 



	fn mainImage(invocation_id: vec4<f32>) -> vec4<f32> {

        glFragCoord = invocation_id.xy;

        let R: vec2<f32> = uniforms.resolution.xy;
        let y_inverted_location = vec2<i32>(i32(invocation_id.x), i32(R.y) - i32(invocation_id.y));
        let location = vec2<i32>(i32(invocation_id.x), i32(invocation_id.y));
        
        var fragColor: vec4<f32>;
        var fragCoord = vec2<f32>(f32(location.x), f32(location.y) );
    
        if (uniforms.time > 32.) { 
            ef = 0; 
        }
        
        let blend: f32 = min(2. * abs(sin(0.1 * uniforms.time * 3.1415 / 3.2)), 1.);
        
        var uv: vec2<f32>;
        
        var p: vec2<f32> = vec2<f32>(0.);

        if (ef == 1 || ef == 3) {

            uv.x = 1. + (((glFragCoord.x - sin(uniforms.time) * glFragCoord.y - uniforms.resolution.x / 2.) % (uniforms.resolution.x / 4. * (-1.5 * blend + 0.501) + uniforms.resolution.x / 4.)) - 1. * glFragCoord.x) / uniforms.resolution.x;
            uv.y = 1. + (((glFragCoord.y + sin(uniforms.time) * glFragCoord.x - uniforms.resolution.y / 2.) % (uniforms.resolution.y / 4. * (-1.5 * blend + 0.501) + uniforms.resolution.y / 4.)) - 1. * glFragCoord.y) / uniforms.resolution.y;
        
        }
        if (ef == 0 || ef == 2) {

            uv.x = 1. + (((glFragCoord.x - uniforms.resolution.x / 2.) % (uniforms.resolution.x / 4. * (-1.5 * blend + 0.501) + uniforms.resolution.x / 4.)) - 1. * glFragCoord.x) / uniforms.resolution.x;
            uv.y = 1. - glFragCoord.y / uniforms.resolution.y;
        }
        p = (1. - uv) * 2. - 1.;
        if (ef == 4) {
            
            var uvxy = uv.xy;

            uvxy = glFragCoord.xy / uniforms.resolution.xy;
            uv.x = uvxy.x;
            uv.y = uvxy.y;

            p = uv * 2. - 1.;

        }
        
        p.x = p.x * (uniforms.resolution.x / uniforms.resolution.y);

        let theta: f32 = sin(uniforms.time * 0.1) * 6.28;
        let x: f32 = 3. * cos(theta);
        let z: f32 = 3. * sin(theta);

        var ro: vec3<f32>;
        
        if (ef == 0 || ef == 2) {  ro = vec3<f32>(x * 2., 2. + 2. * sin((uniforms.time + 37.) * 0.15), z * 1.4); }
        if (ef == 1) { ro = vec3<f32>(x * 0.2 + 1., 4., 0.6 * z - 3.); }
        if (ef == 4) { ro = vec3<f32>(0., 0.3 + 0.1 * uniforms.time, 0.001); }
        if (ef == 3) { ro = vec3<f32>(0., 36. - 0.24 * uniforms.time, 0.001); }
        
        let cw: vec3<f32> = normalize(vec3<f32>(0., 0.25, 0.) - ro);
        
        let cp: vec3<f32> = vec3<f32>(0., 1., 0.);
        let cu: vec3<f32> = normalize(cross(cw, cp));
        let cv: vec3<f32> = normalize(cross(cu, cw));
        let rd: vec3<f32> = normalize(p.x * cu + p.y * cv + 7.5 * cw);

        var col: vec3<f32> = vec3<f32>(0.);
        var t: f32 = castRay(ro, rd, 12.);

        if (t >= 12.) { t = 12.; }
        let pos: vec3<f32> = ro + rd * t;
        let nor: vec3<f32> = calcNormal(pos);
        var ligvec: vec3<f32> = vec3<f32>(-0.5, 0.2, 0.5);
        if (ef == 4 || ef == 2 || ef == 1) { ligvec = vec3<f32>(0.5 * sin(uniforms.time * 0.2), 0.2, -0.5 * cos(uniforms.time * 0.3)); }
        let lig: vec3<f32> = normalize(ligvec);
        let dif: f32 = clamp(dot(lig, nor), 0., 1.);
        let spec: f32 = pow(clamp(dot(reflect(rd, nor), lig), 0., 1.), 16.);
        var color: vec3<f32> = (3.5 - 0.35 * t) * getColor(1.);
        col = 0.3 * dif + 0.5 * color + spec;
        let sh: f32 = softshadow(pos, lig);
        col = col * (clamp(sh, 0., 1.));
        let ro2r: vec3<f32> = pos - rd / t;
        let rd2r: vec3<f32> = reflect(rd, nor);
        let t2r: f32 = castRay(ro2r, rd2r, 7.);
        var pos2r: vec3<f32> = vec3<f32>(0.);
        pos2r = ro2r + rd2r * t2r;
        let nor2r: vec3<f32> = calcNormal(pos2r);
        let dif2r: f32 = clamp(dot(lig, nor2r), 0., 1.);
        let spec2r: f32 = pow(clamp(dot(reflect(rd2r, nor2r), lig), 0., 1.), 16.);
        col = col + (0.1 * (dif2r * color + spec2r));
        var rd2: vec3<f32> = refract(rd, nor, 0.78);
        var t2: f32 = castRay2(pos, rd2);
        var pos2: vec3<f32> = pos + rd2 * t2;
        var nor2: vec3<f32> = calcNormal(pos2);
        var dif2: f32 = clamp(dot(lig, nor2), 0., 1.);
        col.r = col.r + (0.3 * dif2);
        rd2 = refract(rd, nor, 0.82);
        t2 = castRay2(pos, rd2);
        pos2 = pos + rd2 * t2;
        nor2 = calcNormal(pos2);
        dif2 = clamp(dot(lig, nor2), 0., 1.);
        col.b = col.b + (0.3 * dif2);
        rd2 = refract(rd, nor, 0.8);
        t2 = castRay2(pos, rd2);
        pos2 = pos + rd2 * t2;
        nor2 = calcNormal(pos2);
        dif2 = clamp(dot(lig, nor2), 0., 1.);
        let spec2: f32 = pow(clamp(dot(reflect(rd2, nor2), lig), 0., 1.), 16.);
        col.g = col.g + (0.3 * dif2);
        col = col + (0.6 * spec2);
        let ro3: vec3<f32> = pos2 + rd;
        let rd3: vec3<f32> = rd2 + 0.002 * rand1(glFragCoord.xy);
        var t3: f32 = castRay(ro3, rd3, 10.);
        if (t3 >= 10.) { t3 = 10.; }
        let pos3: vec3<f32> = ro3 + rd3 * t3;
        let nor3: vec3<f32> = calcNormal(pos3);
        let dif3: f32 = clamp(dot(lig, -nor3), 0., 1.);

        color = clamp(vec3<f32>(1.0) + (vec3<f32>(1.0) - vec3<f32>(0.2) * t3) * getColor(1.0), vec3<f32>(0.0), vec3<f32>(8.0));

        col = col + (0.1 * dif3 * color);
        col = col + (0.04 * (1. - dif3) * color);
        col = mix(col, vec3<f32>(0.4, 0.5, 0.6), exp(-(2. - 0.18 * t)));
        let uv2: vec2<f32> = glFragCoord.xy / uniforms.resolution.xy;
        col = col - (0.04 * rand1(uv2.xy * uniforms.time));
        col = col * (0.9 + 0.1 * sin(2. * uv2.y * uniforms.resolution.y));
        col = col - (1. - dot(uv, 1. - uv) * 2.4);
    



        fragColor = vec4<f32>(col,1.0);

        return fragColor;

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