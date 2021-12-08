import { defaultWglslVertex } from "../../../src/Material";
import { IMaterialShader } from "../../../src/IMaterialShader";

export const cloudShader: IMaterialShader = {
  vertex: defaultWglslVertex,
  fragment:/* wgsl */ `
  [[block]] struct Uniforms {
    resolution: vec3<f32>;
    time: f32;
  };
  
  [[group(0), binding(0)]] var<uniform> u: Uniforms;
  
  
  struct VertexOutput {
    [[builtin(position)]] pos: vec4<f32>;
    [[location(0)]] uv: vec2<f32>;
  };

 let cloudscale: vec2<f32> = vec2<f32>(1.1, 1.1);
 let speed: f32 = 0.03;
 let clouddark: f32 = 0.5;
 let cloudlight: f32 = 0.3;
 let cloudcover: f32 = 0.2;
 let cloudalpha: f32 = 8.0;
 let skytint: f32 = 0.5;
 let skycolor1: vec3<f32> = vec3<f32>(0.2, 0.4, 0.6);
 let skycolor2: vec3<f32> = vec3<f32>(0.4, 0.7, 1.0);

 let m: mat2x2<f32> = mat2x2<f32>(vec2<f32>(1.6,  1.2), vec2<f32>(-1.2,  1.6) );

 let ZERO_VEC3: vec3<f32> = vec3<f32>(0., 0., 0.);

fn hash(p: vec2<f32>) -> vec2<f32> {
    var r: vec2<f32> = vec2<f32>(dot(p, vec2<f32>(127.1, 311.7)), dot(p, vec2<f32>(269.5, 183.3)));
    return vec2<f32>(-1.0, -1.0) + 2.0 * fract(sin(r) * 43758.5453123);
}

fn noise(p: vec2<f32>) -> f32 {
    let K1: f32 = 0.366025404; // (sqrt(3)-1)/2;
    let K2: f32 = 0.211324865; // (3-sqrt(3))/6;
    var i: vec2<f32> = floor(p + vec2<f32>((p.x + p.y) * K1, (p.x + p.y) * K1));	
    var a: vec2<f32> = p - i + vec2<f32>((i.x + i.y) * K2, (i.x + i.y) * K2);
    var o: vec2<f32>;
    if (a.x > a.y) {
        o = vec2<f32>(1.0, 0.0);
    } else {
        o = vec2<f32>(0.0, 1.0);
    }
    var b: vec2<f32> = a - o + vec2<f32>(K2, K2);
    var c: vec2<f32> = a + vec2<f32>(K2 * 2. - 1.0, K2 * 2. - 1.0);
    var h: vec3<f32> = max(vec3<f32>(0.5, 0.5, 0.5) - vec3<f32>(dot(a, a), dot(b, b), dot(c, c) ), ZERO_VEC3);
    var n: vec3<f32> = h * h * h * h * vec3<f32>(dot(a, hash(i + vec2<f32>(0.0, 0.0))), dot(b, hash(i + o)), dot(c, hash(i + vec2<f32>(1.0, 1.0))));
    return dot(n, vec3<f32>(70.0, 70.0, 70.0));	
}

  
  
fn main(fragCoord: vec2<f32>) -> vec4<f32> {

var p: vec2<f32> = (fragCoord + vec2<f32>(1., 1.)) * vec2<f32>(0.5, 0.5);
var aspect: f32 = u.resolution.x / u.resolution.y;
var uv: vec2<f32> = p * vec2<f32>(aspect, 1.0);    
var time: f32 = u.time * speed;
var q: f32 = 0.;

//ridged noise shape
var r: f32 = 0.0;
uv = uv * cloudscale;
uv = uv - vec2<f32>(q - time, q - time);
var weight: f32 = 0.8;
for (var i: i32 = 0; i < 8; i = i + 1){
 r = r + abs(weight * noise(uv));
    uv = m * uv + vec2<f32>(time, time);
 weight = weight * 0.7;
}

//noise shape
var f: f32 = 0.0;
uv = p * vec2<f32>(aspect, 1.0);
uv = uv * cloudscale;
uv = uv - vec2<f32>(q - time, q - time);
weight = 0.7;
for (var i: i32 = 0; i < 8; i = i + 1){
 f = f + weight * noise( uv );
    uv = m * uv + vec2<f32>(time, time);
 weight = weight * 0.6;
}

f = f * (r + f);

//noise color
var c: f32 = 0.0;
time = u.time * speed * 2.0;
uv = p * vec2<f32>(aspect, 1.0);
uv = uv * cloudscale * 2.0 ;
uv = uv - vec2<f32>(q - time, q - time);
weight = 0.4;
for (var i: i32 = 0; i < 7; i = i + 1){
 c = c + weight * noise(uv);
    uv = m * uv + vec2<f32>(time, time);
 weight = weight * 0.6;
}

//noise ridge color
var c1: f32 = 0.0;
time = u.time * speed * 3.;
uv = p * vec2<f32>(aspect, 1.0);
uv = uv * cloudscale * 3.0;
uv = uv - vec2<f32>(q - time, q - time);
weight = 0.4;
for (var i: i32 = 0; i < 7; i = i + 1) {
     c1 = c1 + abs(weight * noise(uv));
    uv = m * uv + vec2<f32>(time, time);
     weight = weight * 0.6;
}

c = c + c1;

var skycolor: vec3<f32> = mix(skycolor2, skycolor1, vec3<f32>(p.y, p.y, p.y));
var cloudcolor: vec3<f32> = vec3<f32>(1.1, 1.1, 0.9) * clamp((clouddark + cloudlight * c), 0.0, 1.0);

f = cloudcover + cloudalpha * f * r;

var fc: f32 = clamp(f + c, 0.0, 1.0);
var result: vec3<f32> = mix(skycolor, clamp(skytint * skycolor + cloudcolor, ZERO_VEC3, vec3<f32>(1.0, 1.0, 1.0)), vec3<f32>(fc, fc, fc));
    
return vec4<f32>(result,1.0);

}
  
[[stage(fragment)]]
  fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {
      let x = u.resolution; // need to use all inputs
      return main(in.uv);
  }`


};

