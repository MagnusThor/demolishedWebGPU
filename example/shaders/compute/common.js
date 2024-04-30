"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonFunctions = void 0;
exports.commonFunctions = `

const PI: f32 = 3.1415927;

const ZERO_TRICK: i32 = 100;

fn Rotate(v: vec2<f32>, rad: f32) -> vec2<f32> {
	var cos: f32 = cos(rad);
	var sin: f32 = sin(rad);
	return vec2<f32>(cos * v.x - sin * v.y, sin * v.x + cos * v.y);
} 

fn RotateX(v: vec3<f32>, rad: f32) -> vec3<f32> {
	var cos: f32 = cos(rad);
	var sin: f32 = sin(rad);
	return vec3<f32>(v.x, cos * v.y + sin * v.z, -sin * v.y + cos * v.z);
} 

fn RotateY(v: vec3<f32>, rad: f32) -> vec3<f32> {
	var cos: f32 = cos(rad);
	var sin: f32 = sin(rad);
	return vec3<f32>(cos * v.x - sin * v.z, v.y, sin * v.x + cos * v.z);
} 

fn RotateZ(v: vec3<f32>, rad: f32) -> vec3<f32> {
	let cos: f32 = cos(rad);
	let sin: f32 = sin(rad);
	return vec3<f32>(cos * v.x + sin * v.y, -sin * v.x + cos * v.y, v.z);
} 

fn MakeBasis(normal: vec3<f32>) -> mat3x3<f32> {
	var result: mat3x3<f32>;
	result[0] = normal;
	if (abs(normal.y) > 0.5) {
		result[1] = normalize(cross(normal, vec3<f32>(1., 0., 0.)));
	} else { 
		result[1] = normalize(cross(normal, vec3<f32>(0., 1., 0.)));
	}
	result[2] = normalize(cross(normal, result[1]));
	return result;
} 

var<private> randomState: u32 = 4056649889u;

const invMax24Bit: f32 = 1. / f32(16777215.);

fn SmallHashA(seed: u32) -> u32 {
    return ((seed ^ 1057926937u) * 3812423987u) ^ (seed * seed * 4000000007u);
}

fn SmallHashB(seed: u32) -> u32 {
	return (seed ^ 2156034509u) * 3699529241u;
} 

fn RandFloat() -> f32 {
	randomState = SmallHashA(randomState);
	return f32(u32(randomState >> 8) & 16777215u) * invMax24Bit;

} 

fn RandVec2() -> vec2<f32> {
    randomState = SmallHashA(randomState);
    var tempState: u32 = (randomState << 13) | (randomState >> 19);
    tempState = SmallHashB(tempState);
    return vec2<f32>(f32(tempState & 65535u), f32((tempState >> 16) & 65535u)) / 65535.0;
}

fn RandVec3() -> vec3<f32> {
    randomState = SmallHashA(randomState);
    var tempState: u32 = (randomState << 13) | (randomState >> 19);
    tempState = SmallHashB(tempState);

    return vec3<f32>(
        f32((tempState >> 2) & 1023u),
        f32((tempState >> 12) & 1023u),
        f32((tempState >> 22) & 1023u)
    ) / 1023.0;
}



fn HashFloat(seed: u32) -> f32 {
	var seed_var = seed;
	seed_var = SmallHashA(seed_var);
//	return f32((seed_var >> 8) & 16777215.) * invMax24Bit;
    return f32((seed_var >> 8) & 16777215u) * invMax24Bit;

} 

fn HashVec2(seed: u32) -> vec2<f32> {
    var seed_var = seed;
    seed_var = SmallHashA(seed_var);
    seed_var = (seed_var << 13) | (seed_var >> 19);
    seed_var = SmallHashB(seed_var);
    return vec2<f32>(
        f32(seed_var & 65535u),
        f32((seed_var >> 16) & 65535u)
    ) / 65535.0; // Divide by a constant floating-point value
}


fn HashVec3(seed: u32) -> vec3<f32> {
    var seed_var = seed;
    seed_var = SmallHashA(seed_var);
    seed_var = (seed_var << 13) | (seed_var >> 19);
    seed_var = SmallHashB(seed_var);
    return vec3<f32>(
        f32((seed_var >> 2) & 1023u),
        f32((seed_var >> 12) & 1023u),
        f32((seed_var >> 22) & 1023u)
    ) / 1023.0; // Divide by a constant floating-point value
}


fn HashVec4(seed: u32) -> vec4<f32> {
    var seed_var = seed;
    seed_var = SmallHashA(seed_var);
    seed_var = (seed_var << 13) | (seed_var >> 19);
    seed_var = SmallHashB(seed_var);
    return vec4<f32>(
        f32((seed_var >> 8) & 63u),
        f32((seed_var >> 14) & 63u),
        f32((seed_var >> 20) & 63u),
        f32((seed_var >> 26) & 63u)
    ) / 63.0; // Divide by a constant floating-point value
}


fn HashFloatI2(seed2: vec2<i32>) -> f32 {
    return HashFloat(u32(seed2.x ^ (seed2.y * 65537)));
}


fn HashVec2I2(seed2: vec2<i32>) -> vec2<f32> {
	return HashVec2(u32(seed2.x ^ (seed2.y * 65537)));
} 

fn HashVec3I2(seed2: vec2<i32>) -> vec3<f32> {
	return HashVec3(u32(seed2.x ^ (seed2.y * 65537)));
} 

fn HashVec4I2(seed2: vec2<i32>) -> vec4<f32> {
	return HashVec4(u32(seed2.x ^ (seed2.y * 65537)));
} 

fn SetRandomSeed(fragCoord: vec2<f32>, iResolution: vec2<f32>, iFrame: i32) {
    let primex: u32 = max(u32(iResolution.x), 5003u);
    randomState = u32(fragCoord.x);
    randomState = randomState + (u32(fragCoord.y) * primex);
    randomState = randomState + (u32(iFrame) * primex * u32(iResolution.y));
    RandFloat();
}

fn mingrad(a: vec3<f32>, b: vec3<f32>) -> vec3<f32> {
	if (a.x < b.x) {	return a;
	} else { 	return b;
	}
} 

fn dCircle(uv: vec2<f32>, rad: f32) -> vec3<f32> {
	var grad: vec2<f32> = normalize(uv);
	return vec3<f32>(length(uv) - rad, grad);
} 

fn dBox(uv: vec2<f32>, rad: vec2<f32>) -> vec3<f32> {
    var grad: vec2<f32>; 
    if (abs(uv.x * rad.y) > abs(uv.y * rad.x)) {
        grad = vec2<f32>(1.0, 0.0);
    } else {
        grad = vec2<f32>(0.0, 1.0);
    }
    
    grad = grad * sign(uv);
    
    let dist: vec2<f32> = abs(uv) - rad;
    var d: f32 = min(max(dist.x, dist.y), 0.0) + length(max(dist, vec2<f32>(0.0)));
    
    return vec3<f32>(d, grad.x, grad.y);
}

fn texPanels(uv: vec2<f32>, normal: ptr<function, vec3<f32>>) -> vec4<f32> {
	var hash: vec4<f32> = HashVec4I2(vec2<i32>(floor(uv + 0.)));

	let hash2: vec4<f32> = HashVec4I2(vec2<i32>(i32(hash.x * 8192.0), i32(hash.y * 8192.0)));

    let hash3: vec4<f32> = HashVec4I2(vec2<i32>(i32(hash2.x * 8192.0), i32(hash2.y * 8192.0)));

//	let hash3: vec4<f32> = HashVec4I2(vec2<i32>(hash2 * 8192.));

	var fl: vec2<i32> = vec2<i32>(floor(uv));
	var centered: vec2<f32> = fract(uv) - 0.5;
	var radOut: vec2<f32> = 0.35 * hash2.xy + 0.1;

    
//	radOut = radOut * (f32(fl.x & 1 ^ fl.y & 1.) * 0.25 + 0.75);
    radOut = radOut * (f32((fl.x & 1) ^ (fl.y & 1)) * 0.25 + 0.75);

    //radOut = radOut * (f32((fl.x & 1) ^ (fl.y & 1u)) * 0.25 + 0.75);

	if (hash.z > 0.99) { radOut.x = radOut.y; }
	var radThick: f32 = 1. / 32.;
	let jitterPos: vec2<f32> = centered + (hash.xy * 2. - 1.) * (0.5 - radOut);
	var dc: vec3<f32>;
	if (hash.z > 0.99) {	dc = dCircle(jitterPos, radOut.x - radThick);
	} else { 	dc = dBox(jitterPos, vec2<f32>(radOut - radThick));
	}
	var d: f32 = clamp(dc.x / radThick, 0., 1.);
	if (d <= 0. || d >= 1.) { var dcyz = dc.yz;
	dcyz = vec2<f32>(0.);
	dc.y = dcyz.x;
	dc.z = dcyz.y; }
	(*normal) = normalize(vec3<f32>(dc.yz, 1.));
	return vec4<f32>(vec3<f32>(1., 1., 1.) - d * 0.1, 0.1 - d * 0.05);
} 

fn texSolarPanels(uv: vec2<f32>, normal: ptr<function, vec3<f32>>) -> vec4<f32> {
	var hash: vec4<f32> = HashVec4I2(vec2<i32>(floor(uv + vec2<f32>(0.5, 0.25))));
	var fl: vec2<i32> = vec2<i32>(floor(uv));
	var centered: vec2<f32> = fract(uv) - 0.5;
	var radThick: f32 = 1. / 64.;
	var dc: vec3<f32> = dBox(centered, vec2<f32>(0.02, 0.55) - radThick);
	dc.x = clamp(dc.x / radThick, 0., 1.);
	radThick = radThick * (0.5);
	var dc2: vec3<f32> = dBox(centered - vec2<f32>(0., 0.25), vec2<f32>(0.55, 0.0125) - radThick);
	dc2.x = clamp(dc2.x / radThick, 0., 1.);
	var dc3: vec3<f32> = dBox(centered + vec2<f32>(0., 0.25), vec2<f32>(0.55, 0.0125) - radThick);
	dc3.x = clamp(dc3.x / radThick, 0., 1.);
	dc2 = mingrad(dc3, dc2);
	dc = mingrad(dc, dc2);
	var d: f32 = dc.x;
	if (d <= 0. || d >= 1.) { var dcyz = dc.yz;
	dcyz = vec2<f32>(0.);
	dc.y = dcyz.x;
	dc.z = dcyz.y; }
	(*normal) = normalize(vec3<f32>(dc.yz + vec2<f32>(abs(sin((uv.x + 0.5) * PI) * 0.1), 0.), 1.));

    var pad: f32  = 0.; 
    if (d < 1.) {
         pad = 1.;
         } 
         else { 
            pad = 0.;    
    };

	let padCol: vec4<f32> = mix(vec4<f32>(1., 1., 1., 0.25) * 0.5, vec4<f32>(0.7, 0.5, 0.1, 0.5) * 0.25, hash.x);
	return mix(vec4<f32>(0.01, 0.015, 0.1, 0.8), padCol, pad);
} 

fn texHex(uv: vec2<f32>, normal: ptr<function, vec3<f32>>) -> vec4<f32> {
	let hash: vec4<f32> = HashVec4I2(vec2<i32>(floor(uv + 0.)));
	let fl: vec2<i32> = vec2<i32>(floor(uv));
	let centered: vec2<f32> = fract(uv) - 0.5;
	let repx: f32 = abs(fract(uv.x) - 0.5) * 2.;
	let repy: f32 = abs(fract(uv.y) - 0.5) * 2.;
	(*normal) = normalize(vec3<f32>(0., 0., 1.));
	return vec4<f32>(vec3<f32>(repx, repy, 1.), 0.);
}
`;
