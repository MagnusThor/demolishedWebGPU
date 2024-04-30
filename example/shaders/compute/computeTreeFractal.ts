export const computeTreeFractal = /* glsl */ ` 

        struct Uniforms {
            resolution: vec3<f32>,
            time: f32
        };
       
        @group(0) @binding(0) var outputTexture: texture_storage_2d<bgra8unorm, write>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;


var<private> max_iter: i32 = 130;

const bone: vec3<f32> = vec3<f32>(0.89, 0.855, 0.788);

fn rot(p: ptr<function, vec2<f32>>, a: f32)  {
	var c: f32 = cos(a);
	var s: f32 = sin(a);
	(*p) = vec2<f32>(c * (*p).x + s * (*p).y, -s * (*p).x + c * (*p).y);
} 

fn box(p: vec3<f32>, b: vec3<f32>) -> f32 {
	var q: vec3<f32> = abs(p) - b;
	return 0.;//length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.);
} 


// fn mod(a:f32,b:f32) -> f32 {
//         return a - b * floor(a / b);
//}
/*
fn mod1(p: ptr<function, f32>, size: f32) -> f32 {
	var halfsize: f32 = size * 0.5;
	var c: f32 = floor(((*p) + halfsize) / size);
	(*p) = mod((*p) + halfsize, size) - halfsize;
	return c;
} 
*/
fn mod1(p: ptr<function, f32>, size: f32) -> f32 {
    let halfsize: f32 = size * 0.5;
    let c: f32 = floor(((*p) + halfsize) / size);
    // Manually perform the modulo operation
    (*p) = ((*p) + halfsize) - size * floor(((*p) + halfsize) / size);
    // Fix the return value to be within the range [0, size)
    return mod(c, size);
}

fn modMirror2(p: ptr<function, vec2<f32>>, size: vec2<f32>) -> vec2<f32> {
    
	let halfsize: vec2<f32> = size * 0.5;
    let c: vec2<f32> = floor(((*p) + halfsize) / size);  
    (*p) = ((*p) + halfsize) - size * floor(((*p) + halfsize) / size);
    (*p) = (*p) * (fract(c * 0.5) * 2.0 - vec2<f32>(1.0));

    return c;
}
fn apollian(p: vec3<f32>) -> f32 {
	var p_var = p;
	let op: vec3<f32> = p_var;
	let s: f32 = 1.3 + smoothstep(0.15, 1.5, p_var.y) * 0.95;
	var scale: f32 = 1.;
	var r: f32 = 0.2;
	let o: vec3<f32> = vec3<f32>(0.22, 0., 0.);
	var d: f32 = 10000.;
	var rep: i32 = 7;

	for (var i: i32 = 0; i < rep; i = i + 1) {
		mod1(p_var.y, 2.);
		modMirror2(p_var.xz, vec2<f32>(2.));
		rot(p_var.xz, PI / 5.5);
		let r2: f32 = dot(p_var, p_var) + 0.;
		let k: f32 = s / r2;
		let r: f32 = 0.5;
		p_var = p_var * (k);
		scale = scale * (k);
	}

	d = box(p_var - 0.1, 1. * vec3<f32>(1., 2., 1.)) - 0.5;
	d = abs(d) - 0.01;
	return 0.25 * d / scale;
} 

fn df(p: vec3<f32>) -> f32 {
	let d1: f32 = apollian(p);
	let db: f32 = box(p - vec3<f32>(0., 0.5, 0.), vec3<f32>(0.75, 1., 0.75)) - 0.5;
	let dp: f32 = p.y;
	return min(dp, max(d1, db));
} 

fn intersect(ro: vec3<f32>, rd: vec3<f32>, iter: ptr<function, i32>) -> f32 {
	var res: f32;
	var t: f32 = 0.2;
	(*iter) = max_(*iter);

	for (var i: i32 = 0; i < max_(*iter);   i = i + 1) {
		var p: vec3<f32> = ro + rd * t;
		res = df(p);
		if (res < 0.0003 * t || res > 20.) {
			(*iter) = i;
			break;
		}
		t = t + (res);
	}

	if (res > 20.) { t = -1.; }
	return t;
} 

fn ambientOcclusion(p: vec3<f32>, n: vec3<f32>) -> f32 {
	let stepSize: f32 = 0.012;
	var t: f32 = stepSize;
	var oc: f32 = 0.;

	for (var i: i32 = 0; i < 12; i = i + 1) {
		let d: f32 = df(p + n * t);
		oc = oc + (t - d);
		t = t + (stepSize);
	}

	return clamp(oc, 0., 1.);
} 

fn normal(pos: vec3<f32>) -> vec3<f32> {
	let eps: vec3<f32> = vec3<f32>(0.001, 0., 0.);
	var nor: vec3<f32>;
	nor.x = df(pos + eps.xyy) - df(pos - eps.xyy);
	nor.y = df(pos + eps.yxy) - df(pos - eps.yxy);
	nor.z = df(pos + eps.yyx) - df(pos - eps.yyx);
	return normalize(nor);
} 

fn lighting(p: vec3<f32>, rd: vec3<f32>, iter: i32) -> vec3<f32> {
	let n: vec3<f32> = normal(p);
	let fake: f32 = f32(iter) / f32(max_iter);
	let fakeAmb: f32 = exp(-fake * fake * 9.);
	let amb: f32 = ambientOcclusion(p, n);
	var col: vec3<f32> = vec3<f32>(mix(1., 0.125, pow(amb, 3.))) * vec3<f32>(fakeAmb) * bone;
	return col;
} 

fn post(col: vec3<f32>, q: vec2<f32>) -> vec3<f32> {
	var col_var = col;
	col_var = pow(clamp(col_var, 0., 1.), vec3<f32>(0.65));
	col_var = col_var * 0.6 + 0.4 * col_var * col_var * (3. - 2. * col_var);
	col_var = mix(col_var, vec3<f32>(dot(col_var, vec3<f32>(0.33))), -0.5);
	col_var = col_var * (0.5 + 0.5 * pow(19. * q.x * q.y * (1. - q.x) * (1. - q.y), 0.7));
	return col_var;
} 

    
        @compute @workgroup_size(8,8,1) 
        fn main(@builtin(global_invocation_id) invocation_id : vec3u)  { 

            let R: vec2<f32> = uniforms.resolution.xy;
            let y_inverted_location = vec2<i32>(i32(invocation_id.x), i32(R.y) - i32(invocation_id.y));
            let location = vec2<i32>(i32(invocation_id.x), i32(invocation_id.y));
            
            var fragColor: vec4<f32>;
            var fragCoord = vec2<f32>(f32(location.x), f32(location.y) );
        
            let q: vec2<f32> = fragCoord.xy / uniforms.resolution.xy;
            var uv: vec2<f32> = -1. + 2. * q;
            uv.y = uv.y + (0.225);
            uv.x = uv.x * (uniforms.resolution.x / uniforms.resolution.y);
            let la: vec3<f32> = vec3<f32>(0., 0.5, 0.);
            let ro: vec3<f32> = vec3<f32>(-4., 1., -0.);
            rot(ro.xz, 2. * PI * uniforms.time / 120.);
            let cf: vec3<f32> = normalize(la - ro);
            let cs: vec3<f32> = normalize(cross(cf, vec3<f32>(0., 1., 0.)));
            let cu: vec3<f32> = normalize(cross(cs, cf));
            let rd: vec3<f32> = normalize(uv.x * cs + uv.y * cu + 3. * cf);
            let bg: vec3<f32> = mix(bone * 0.5, bone, smoothstep(-1., 1., uv.y));
            var col: vec3<f32> = bg;
            var p: vec3<f32> = ro;
            let iter: i32 = 0;
            let t: f32 = intersect(ro, rd, iter);
            if (t > -0.5) {
                p = ro + t * rd;
                col = lighting(p, rd, iter);
                col = mix(col, bg, 1. - exp(-0.001 * t * t));
            }
            col = post(col, q);

            fragColor = vec4<f32>(col.x, col.y, col.z, 1.);

            textureStore(outputTexture, vec2<u32>(fragCoord.xy), vec4f(fragColor,1));

        }       
    `;
