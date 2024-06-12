"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullSpectrumCyberShader = void 0;
const Material_1 = require("../../../src/engine/Material");
exports.fullSpectrumCyberShader = {
    vertex: Material_1.defaultWglslVertex,
    fragment: /* glsl */ `
    
    struct Uniforms {
      resolution: vec3<f32>,
      time: f32
    };

    @group(0) @binding(0) var<uniform> uniforms: Uniforms;

	@group(0) @binding(1) var linearSampler: sampler;
  	@group(0) @binding(2) var iChannel0: texture_2d<f32>; 


    struct VertexOutput {
        @builtin(position) pos: vec4<f32>,
        @location(0) uv: vec2<f32>
    };  


var<private> hexid: i32;
var<private> hpos: vec3<f32>;
var<private> point: vec3<f32>;
var<private> pt: vec3<f32>;
var<private> tcol: f32 = 0.;
var<private> bcol: f32 = 0.;
var<private> hitbol: f32 = 0.;
var<private> hexpos: f32 = 0.;
var<private> fparam: f32 = 0.;


fn rot(a: f32) -> mat2x2<f32> {
	let s: f32 = sin(a);
	let c: f32 = cos(a);
	return mat2x2<f32>(c, s, -s, c);
} 


fn path(t: f32) -> vec3<f32> {
	return vec3<f32>(sin(t * 0.3 + cos(t * 0.2) * 0.5) * 4., cos(t * 0.2) * 3., t);
} 

fn hexagon(p: vec2<f32>, r: f32) -> f32 {
	var p_var = p;
	let k: vec3<f32> = vec3<f32>(-0.8660254, 0.5, 0.57735026);
	p_var = abs(p_var);
	p_var = p_var - (2. * min(dot(k.xy, p_var), 0.) * k.xy);
	p_var = p_var - (vec2<f32>(clamp(p_var.x, -k.z * r, k.z * r), r));
	return length(p_var) * sign(p_var.y);
} 

fn hex(p: vec2<f32>) -> f32 {
	var p_var = p;
	p_var.x = p_var.x * (0.57735 * 2.);
	p_var.y = p_var.y + (((floor(p_var.x)) % (2.)) * 0.5);
	p_var = abs(((p_var) % (1.)) - 0.5);
	return abs(max(p_var.x * 1.5 + p_var.y, p_var.y * 2.) - 1.);
} 

fn lookat(dir: vec3<f32>) -> mat3x3<f32> {
	let up: vec3<f32> = vec3<f32>(0., 1., 0.);
	let rt: vec3<f32> = normalize(cross(dir, up));
	return mat3x3<f32>(rt, cross(rt, dir), dir);
} 

fn hash12(p: vec2<f32>) -> f32 {
	var p_var = p;
	p_var = p_var * (1000.);
	var p3: vec3<f32> = fract(vec3<f32>(p_var.xyx) * 0.1031);
	p3 = p3 + (dot(p3, p3.yzx + 33.33));
	return fract((p3.x + p3.y) * p3.z);
} 

fn de(p: vec3<f32>) -> f32 {
	pt = vec3<f32>(p.xy - path(p.z).xy, p.z);
	var h: f32 = abs(hexagon(pt.xy, 3. + fparam));
	hexpos = hex(pt.yz);
	tcol = smoothstep(0., 0.15, hexpos);
	h = h - (tcol * 0.1);
	var pp: vec3<f32> = p - hpos;
	pp = lookat(point) * pp;
	pp.y = pp.y - (abs(sin(uniforms.time)) * 3. + (fparam - (2. - fparam)));
	var ppyz = pp.yz;
	ppyz = pp.yz * (rot(-uniforms.time));
	pp.y = ppyz.x;
	pp.z = ppyz.y;
	var bola: f32 = length(pp) - 1.;
	bcol = smoothstep(0., 0.5, hex(pp.xy * 3.));
	bola = bola - (bcol * 0.1);
	var pr: vec3<f32> = p;
	pr.z = ((p.z) % (6.)) - 3.;
	let d: f32 = min(h, bola);
	if (d == bola) {
		tcol = 1.;
		hitbol = 1.;
	} else { 
		hitbol = 0.;
		bcol = 1.;
	}
	return d * 0.5;
} 

fn normal(p: vec3<f32>) -> vec3<f32> {
	let e: vec2<f32> = vec2<f32>(0., 0.005);
	return normalize(vec3<f32>(de(p + e.yxx), de(p + e.xyx), de(p + e.xxy)) - de(p));
} 




fn march(ro: vec3<f32>, rd: vec3<f32>) -> vec3<f32> {
	var rd_var = rd;
	let odir: vec3<f32> = rd_var;
	var p: vec3<f32> =  ro;
	var col: vec3<f32> = vec3<f32>(0.);
	var d: f32 = 0.;
	var td: f32 = 0.;
	var g: vec3<f32> = vec3<f32>(0.);

	for (var i: i32 = 0; i < 200; i = i + 1) {
		d = de(p);
		if (d < 0.001 || td > 200.) {		break;
 }
		p = p + (rd_var * d);
		td = td + (d);
		g = g + (0.1 / (0.1 + d) * hitbol * abs(normalize(point)));
	}

	let hp: f32 = hexpos * (1. - hitbol);
	p = p - (rd_var * 0.01);
	let n: vec3<f32> = normal(p);
	if (d < 0.001) {
		col = pow(max(0., dot(-rd_var, n)), 2.) * vec3<f32>(0.6, 0.7, 0.8) * tcol * bcol;
	}
	col = col + (f32(hexid));
	let pr: vec3<f32> = pt;
	rd_var = reflect(rd_var, n);
	td = 0.;

	for (var i: i32 = 0; i < 200; i = i + 1) {
		d = de(p);
		if (d < 0.001 || td > 200.) {		break;
 }
		p = p + (rd_var * d);
		td = td + (d);
		g = g + (0.1 / (0.1 + d) * abs(normalize(point)));
	}

	let zz: f32 = p.z;
	if (d < 0.001) {
		let refcol: vec3<f32> = pow(max(0., dot(-odir, n)), 2.) * vec3<f32>(0.6, 0.7, 0.8) * tcol * bcol;
		p = pr;
		p = abs(0.5 - fract(p * 0.1));
		var m: f32 = 100.;

		for (var i: i32 = 0; i < 10; i = i + 1) {
			p = abs(p) / dot(p, p) - 0.8;
			m = min(m, length(p));
		}

		col = mix(col, refcol, m) - m * 0.3;
		col = col + (step(0.3, hp) * step(0.9, fract(pr.z * 0.05 + uniforms.time * 0.5 + hp * 0.1)) * 0.7);
		col = col + (step(0.3, hexpos) * step(0.9, fract(zz * 0.05 + uniforms.time + hexpos * 0.1)) * 0.3);
	}
	col = col + (g * 0.03);
	var colrb = col.rb;
	colrb = col.rb * (rot(odir.y * 0.5));
	col.r = colrb.x;
	col.b = colrb.y;
	return col;
} 

	// Full Spectrum Cyber made by Kali 
	// https://www.shadertoy.com/view/XcXXzS

fn mainImage(fragCoord: vec2<f32>) -> vec4<f32> {

	var uv: vec2<f32> = fragCoord.xy / uniforms.resolution.xy - 0.5;
	
	uv.x = uv.x * (uniforms.resolution.x / uniforms.resolution.y);

	let t: f32 = uniforms.time * 2.;
	
	var pth: vec3<f32> = path(t);

	if (((uniforms.time - 10.) % (20.)) > 10.) {
		pth = path(floor(t / 20.) * 20. + 10.);
		pth.x = pth.x + (2.);
	}

	hpos = path(t + 3.);
	
	let adv: vec3<f32> = path(t + 2.);
	var dir: vec3<f32> = normalize(vec3<f32>(uv, 0.7));
	let dd: vec3<f32> = normalize(adv - pth);
	point = normalize(adv - hpos);
	var pointxz = point.xz;
	pointxz = point.xz * (rot(sin(uniforms.time) * 0.2));
	point.x = pointxz.x;
	point.z = pointxz.y;
	dir = lookat(dd) * dir;
	var col: vec3<f32> = march(pth, dir);
	col = col * (vec3<f32>(1., 0.9, 0.8));

	return vec4<f32>(col, 1.);
  }


@fragment
fn main_fragment(in: VertexOutput) -> @location(0) vec4<f32> {      
    return mainImage(in.pos.xy);
}

`
};
