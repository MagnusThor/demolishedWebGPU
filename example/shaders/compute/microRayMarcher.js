"use strict";
/*
void mainImage(out vec4 p,vec2 f){
  for(
p=vec4(f/iResolution.y,1,0)-.6;                                  // First set up camera
f.x-->0.;                                                        // Then while not done
p*=.9+.1*length(cos(.7*p.x+vec3(p.z+iTime,p)))+.01*cos(4.*p.y)); // march forward
p=(p+p.z)*.1;
}
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.microRayMarcherCompute = void 0;
exports.microRayMarcherCompute = ` 

        struct Uniforms {
            resolution: vec3<f32>,
            time: f32
        };
       
        @group(0) @binding(0) var outputTexture: texture_storage_2d<bgra8unorm, write>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;


        const lightdir: vec3<f32> = normalize(vec3<f32>(-1., 1., -0.5));
        const detail: f32 = 0.00002;

     
        fn de2(p: vec3<f32>) -> f32 {
          var p_var = p;
          var op: vec3<f32> = p_var;
          p_var = abs(1. - ((p_var) % (2.)));
          var r: f32 = 0.;
          let power: f32 = 8.;
          var dr: f32 = 1.;
          var z: vec3<f32> = p_var;
        
          for (var i: i32 = 0; i < 7; i = i + 1) {
            op = -1. + 2. * fract(0.5 * op + 0.5);
            let r2: f32 = dot(op, op);
            r = length(z);
            if (r > 1.616) {		break;
         }
            var theta: f32 = acos(z.z / r);
            var phi: f32 = atan2(z.y, z.x);
            dr = pow(r, power - 1.) * power * dr + 1.;
            let zr: f32 = pow(r, power);
            theta = theta * power;
            phi = phi * power;
            z = zr * vec3<f32>(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
            z = z + (p_var);
          }
        
          return 0.5 * log(r) * r / dr;
        } 
        
        fn de1(p: vec3<f32>) -> f32 {
          var s: f32 = 1.;
          var d: f32 = 0.;
          var r: vec3<f32> = p;
          let q: vec3<f32> = r;
          
          for (var j: i32 = 0; j < 6; j = j + 1) {
              r = abs(((q * s + 1.) % (2.)) - 1.);
              r = max(r, r.yzx);
              d = max(d, (0.3 - length(r * 0.95) * 0.3) / s);
              s = s * 2.;
          }
          
          return d;
      }
      fn map(p: vec3<f32>) -> f32 {
        return de1(p);
        //return min(de1(p), de2(p));
      
      } 
      
      fn normal(p: vec3<f32>) -> vec3<f32> {
        let e: vec2<f32> = vec2<f32>(1., -1.) * 0.5773 * 0.0005;
        return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
      } 
      
      fn shadow(ro: vec3<f32>, rd: vec3<f32>) -> f32 {
        var res: f32 = 0.;
        var t: f32 = 0.05;
        var h: f32;
      
        for (var i: i32 = 0; i < 4; i = i + 1) {
          h = map(ro + rd * t);
          res = min(6. * h / t, res);
          t = t + (h);
        }
        
       // return max(res, 0.);
      } 

      fn calcAO(pos: vec3<f32>, nor: vec3<f32>) -> f32 {
        let aodet: f32 = detail * 80.;
        var totao: f32 = 0.;
        var sca: f32 = 10.;
      
        for (var aoi: i32 = 0; aoi < 5; aoi = aoi + 1) {
          let hr: f32 = aodet + aodet * f32(aoi * aoi);
          
          let aopos: vec3<f32> = nor * hr + pos;
          
          let dd: f32 = map(aopos);
          
          totao = totao + (-(dd - hr) * sca);
          
          sca = sca * (0.75);

        }
        return clamp(1. - 5. * totao, 0., 1.);
      } 
      
      fn kset(p: vec3<f32>) -> f32 {
        var p_var = p;
        p_var = abs(0.5 - fract(p_var * 80.));
        var es: f32 = 0. ;
       
        var l: f32 = 0.;
      
        for (var i: i32 = 0; i < 13; i = i + 1) {
          let pl: f32 = l;
          l = length(p_var);
          p_var = abs(p_var) / dot(p_var, p_var) - 0.5;
          es = es + (exp(-1. / abs(l - pl)));
        }
      
        return es;
      } 
      
      fn light(p: vec3<f32>, dir: vec3<f32>) -> vec3<f32> {
        let n: vec3<f32> = normal(p);
        let sh: f32 = min(5., shadow(p, lightdir));
        let ao: f32 = calcAO(p, n);
        let diff: f32 = max(0., dot(lightdir, -n)) * sh * 1.3;
        let amb: f32 = max(0.2, dot(dir, -n)) * 0.4;
        let r: vec3<f32> = reflect(lightdir, n);
        let spec: f32 = pow(max(0., dot(dir, -r)) * sh, 10.) * (0.5 + ao * 0.5);
        let k: f32 = kset(p) * 0.18;
        var col: vec3<f32> = mix(vec3<f32>(k * 1.1, k * k * 1.3, k * k * k), vec3<f32>(k), 0.45) * 2.;
        col = col * ao * (amb * vec3<f32>(0.9, 0.85, 1.) + diff * vec3<f32>(1., 0.9, 0.9)) + spec * vec3<f32>(1., 0.9, 0.5) * 0.7;
        return col;
      } 
      
      fn raymarch(ro: vec3<f32>, rd: vec3<f32>) -> vec3<f32> {
        
        var color: vec3<f32>;
        var pos: vec3<f32>;
        var t: f32 = 0.;
        var td: f32 = 0.;
        var d: f32 = 0.;
        var det: f32 = 0.2;
      
        for (var i: i32 = 0; i < 128; i = i + 1) {
          pos = ro + t * rd;
          var precis: f32 = 0.001 * t;
          d = map(ro + rd * t);
        
          det = detail * (1. + t * 55.);
        
          if (d < 0.0002) {
            		break;
          }
          t = t + (d);
        }
      
        let backg: vec3<f32> = vec3<f32>(0.5);

        color = light(pos - det * dr * 1.5, rd);
        color = color * (vec3<f32>(1., 0.85, 0.8) * 0.9);
        color = mix(color, backg, 1. - exp(-1.3 * pow(t, 1.3)));
        
        return color;
      } 
      
      fn camPath(time: f32) -> vec3<f32> {
        let p: vec2<f32> = 600. * vec2<f32>(cos(1.4 + 0.37 * time), cos(3.2 + 0.31 * time));
        return vec3<f32>(p.x, 0., p.y);
      } 
      
      fn hash(p: vec2<f32>) -> f32 {
        return fract(sin(dot(p, vec2<f32>(12.9898, 78.233))) * 33758.547) - 0.5;
      } 

        @compute @workgroup_size(8,8,1) fn main(
        @builtin(global_invocation_id) invocation_id : vec3u
          )  {

            let res: vec2<u32> = textureDimensions(outputTexture);
            let fragCoord = invocation_id.xy;
            let uv: vec2<f32> = vec2<f32>(f32(fragCoord.x),f32(fragCoord.y)) / vec2<f32>(f32(res.x),f32(res.y));
            //let uv: vec2<f32> = fragCoord.xy / uniforms.resolution.xy - 0.5;

            let t: f32 = uniforms.time * 0.5;

            let s: vec2<f32> = uv * vec2<f32>(1.75, 1.);

            let campos: vec3<f32> = camPath(t * 0.001);
            let camtar: vec3<f32> = camPath(t + 2.);

            let roll: f32 = 0.4 * cos(0.4 * t);
            
            let cw: vec3<f32> = normalize(camtar - campos);
            let cp: vec3<f32> = vec3<f32>(sin(roll), cos(roll), 0.);
            let cu: vec3<f32> = normalize(cross(cw, cp));
            let cv: vec3<f32> = normalize(cross(cu, cw));
            
            let rd: vec3<f32> = normalize(s.x * cu + s.y * cv + 0.6 * cw);

            var col: vec3<f32> = raymarch(campos, rd);
        
            let color = vec4f(col.rgb, 1);   

            textureStore(outputTexture, fragCoord, color);

      }
    `;
