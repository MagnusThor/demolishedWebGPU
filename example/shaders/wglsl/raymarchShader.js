"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raymarchShader = void 0;
const Material_1 = require("../../../src/Material");
exports.raymarchShader = {
    vertex: Material_1.defaultWglslVertex,
    fragment: /* glsl */ `
    
    struct Uniforms {
      resolution: vec3<f32>,
      time: f32
    };

    @group(0) @binding(0) var<uniform> uniforms: Uniforms;

    struct VertexOutput {
        @builtin(position) pos: vec4<f32>,
        @location(0) uv: vec2<f32>
      };  
      
    var<private> orb: vec4<f32>;

    fn rotate(k: vec2<f32>, t: f32) -> vec2<f32> {
        return vec2<f32>(cos(t) * k.x - sin(t) * k.y, sin(t) * k.x + cos(t) * k.y);
    }   
 
    fn map(p: vec3<f32>, s: f32) -> f32 {
        var p_var = p;
        var scale: f32 = 1.;
        orb = vec4<f32>(1000.);
    
        for (var i: i32 = 0; i < 8; i = i + 1) {
            p_var = -1. + 2. * fract(0.5 * p_var + 0.5);
            let r2: f32 = dot(p_var, p_var);
            orb = min(orb, vec4<f32>(abs(p_var), r2));
            let k: f32 = s / r2;
            p_var = p_var * (k);
            scale = scale * (k);
        }
    
        return 0.25 * abs(p_var.y) / scale;
    } 
    
    
    fn calcNormal(pos: vec3<f32>, t: f32, s: f32) -> vec3<f32> {
        let precis: f32 = 0.001 * t;
        let e: vec2<f32> = vec2<f32>(1., -1.) * precis;
        return normalize(e.xyy * map(pos + e.xyy, s) + e.yyx * map(pos + e.yyx, s) + e.yxy * map(pos + e.yxy, s) + e.xxx * map(pos + e.xxx, s));
    } 
  
    fn trace(ro: vec3<f32>, rd: vec3<f32>, s: f32) -> f32 {
  
        var maxd: f32 = 30.;
        var t: f32 = 0.01;
    
        for (var i: i32 = 0; i < 512; i = i + 1) {
            let precis: f32 = 0.001 * t;
            let h: f32 = map(ro + rd * t, s);
            if (h < precis || t > maxd) {		break;
     }
            t = t + (h);
        }
    
        if (t > maxd) { t = -1.; }
        return t;
    } 
    

    fn render(ro: vec3<f32>, rd: vec3<f32>, anim: f32) -> vec3<f32> {
        var col: vec3<f32> = vec3<f32>(0.);
        let t: f32 = trace(ro, rd, anim);
        if (t > 0.) {
            let tra: vec4<f32> = orb;
            let pos: vec3<f32> = ro + t * rd;
            let nor: vec3<f32> = calcNormal(pos, t, anim);
            let light1: vec3<f32> = vec3<f32>(0.577, 0.577, -0.577);
            let light2: vec3<f32> = vec3<f32>(-0.707, 0., 0.707);
            let key: f32 = clamp(dot(light1, nor), 0., 1.);
            let bac: f32 = clamp(0.2 + 0.8 * dot(light2, nor), 0., 1.);
            let amb: f32 = 0.7 + 0.3 * nor.y;
            let ao: f32 = pow(clamp(tra.w * 2., 0., 1.), 1.2);
            var brdf: vec3<f32> = 1. * vec3<f32>(0.4, 0.4, 0.4) * amb * ao;
            brdf = brdf + (1. * vec3<f32>(1., 1., 1.) * key * ao);
            brdf = brdf + (1. * vec3<f32>(0.4, 0.4, 0.4) * bac * ao);
            var rgb: vec3<f32> = vec3<f32>(1.);
            rgb = mix(rgb, vec3<f32>(1., 0.8, 0.2), clamp(6. * tra.y, 0., 1.));
            rgb = mix(rgb, vec3<f32>(1., 0.55, 0.), pow(clamp(1. - 2. * tra.z, 0., 1.), 8.));
            col = rgb * brdf * exp(-0.2 * t);
        }
        return sqrt(col);
    } 
    
    fn mainImage(fragCoord: vec4<f32>) -> vec4<f32> {
       
        let uv: vec2<f32> = fragCoord.xy / uniforms.resolution.xy ;

        let time: f32 = (uniforms.time * 0.25);
        let anim: f32 = 1.1 + 0.5 * smoothstep(-0.3, 0.3, cos(0.1 * uniforms.time));
    
        var tot: vec3<f32> = vec3<f32>(0.);

        let ii: i32 = 1;
        let jj: i32 = 1;
        let AA: i32 = 2;
        
        //vec2 q = fragCoord.xy+vec2(float(ii),float(jj))/float(AA);
        //vec2 p = (2.0*q-iResolution.xy)/iResolution.y;

        let q: vec2<f32> = fragCoord.xy + vec2<f32>(f32(ii), f32(jj)) / f32(AA);

        let p: vec2<f32> = (2. * q - uniforms.resolution.xy) / uniforms.resolution.y;

        // let p: vec2<f32> = (2. *q fragCoord.xy - uniforms.resolution.xy) / uniforms.resolution.y;

        let ro: vec3<f32> = vec3<f32>(2.8 * cos(0.1 + 0.33 * time), 0.4 + 0.3 * cos(0.37 * time), 2.8 * cos(0.5 + 0.35 * time));
        let ta: vec3<f32> = vec3<f32>(1.9 * cos(1.2 + 0.41 * time), 0.4 + 0.1 * cos(0.27 * time), 1.9 * cos(2. + 0.38 * time));
        
        let roll: f32 = 0.2 * cos(0.1 * time);
        let cw: vec3<f32> = normalize(ta - ro);
        let cp: vec3<f32> = vec3<f32>(sin(roll), cos(roll), 0.);
        let cu: vec3<f32> = normalize(cross(cw, cp));
        let cv: vec3<f32> = normalize(cross(cu, cw));
        let rd: vec3<f32> = normalize(p.x * cu + p.y * cv + 2. * cw);

        tot = tot + render(ro, rd, anim);

        return vec4<f32>(tot, 1.);
       
 
    } 
  
    @fragment
    fn main_fragment(in: VertexOutput) -> @location(0) vec4<f32> {      
        return mainImage(in.pos);
    }

    `
};
