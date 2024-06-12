"use strict";
/*
Awesome 'Let's self reflect' shader by mrange (https://www.shadertoy.com/view/XfyXRV)
WGLSL convertd by Magnus Thor
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.letsSelfRefectComputeShader = void 0;
exports.letsSelfRefectComputeShader = ` 

        struct Uniforms {
            resolution: vec3<f32>,
            time: f32
        };
       
        @group(0) @binding(0) var outputTexture: texture_storage_2d<bgra8unorm, write>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;


        // Constants for tolerance and ray marching parameters
        const TOLERANCE2: f32 = 0.0005;
        const MAX_RAY_MARCHES2: i32 = 50;
        const NORM_OFF2: f32 = 0.005;

        const TOLERANCE3: f32 = 0.0005;
        const MAX_RAY_LENGTH3: f32 = 10.0;
        const MAX_RAY_MARCHES3: i32 = 90;
        const NORM_OFF3: f32 = 0.005;

        const rotation_speed: f32 = 0.25;
        const poly_U: f32 = 1.;
        const poly_V: f32 = 0.5;
        const poly_W: f32 = 1.;
        const poly_type: i32 = 3;
        const poly_zoom: f32 = 2.;
        const inner_sphere: f32 = 1.;
        const refr_index: f32 = 0.9;
        const hsv2rgb_K: vec4<f32> = vec4<f32>(1., 2. / 3., 1. / 3., 3.);
        
        fn hsv2rgb(c: vec3<f32>) -> vec3<f32> {
            var p: vec3<f32> = abs(fract(c.xxx + hsv2rgb_K.xyz) * 6. - hsv2rgb_K.www);
            return c.z * mix(hsv2rgb_K.xxx, clamp(p - hsv2rgb_K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), c.y);
        }
        
        const rayOrigin: vec3<f32> = vec3<f32>(0., 1., -5.);
        const sunDir: vec3<f32> = normalize(-rayOrigin);
        const sunCol: vec3<f32> = vec3<f32>(0.06, 0.9, 0.01).z * mix(hsv2rgb_K.xxx, clamp(abs(fract(vec3<f32>(0.06, 0.9, 0.01).xxx + hsv2rgb_K.xyz) * 6. - hsv2rgb_K.www) - hsv2rgb_K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.06, 0.9, 0.01).y) * 1.;
        const bottomBoxCol: vec3<f32> = vec3<f32>(0.66, 0.8, 0.5).z * mix(hsv2rgb_K.xxx, clamp(abs(fract(vec3<f32>(0.66, 0.8, 0.5).xxx + hsv2rgb_K.xyz) * 6. - hsv2rgb_K.www) - hsv2rgb_K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.66, 0.8, 0.5).y) * 1.;
        const topBoxCol: vec3<f32> = vec3<f32>(0.6, 0.9, 1.).z * mix(hsv2rgb_K.xxx, clamp(abs(fract(vec3<f32>(0.6, 0.9, 1.).xxx + hsv2rgb_K.xyz) * 6. - hsv2rgb_K.www) - hsv2rgb_K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.6, 0.9, 1.).y) * 1.;
        const glowCol0: vec3<f32> = vec3<f32>(0.05, 0.7, 0.001).z * mix(hsv2rgb_K.xxx, clamp(abs(fract(vec3<f32>(0.05, 0.7, 0.001).xxx + hsv2rgb_K.xyz) * 6. - hsv2rgb_K.www) - hsv2rgb_K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.05, 0.7, 0.001).y) * 1.;
        const glowCol1: vec3<f32> = vec3<f32>(0.95, 0.7, 0.001).z * mix(hsv2rgb_K.xxx, clamp(abs(fract(vec3<f32>(0.95, 0.7, 0.001).xxx + hsv2rgb_K.xyz) * 6. - hsv2rgb_K.www) - hsv2rgb_K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.95, 0.7, 0.001).y) * 1.;
        const beerCol: vec3<f32> = -(vec3<f32>(0.15 + 0.5, 0.7, 2.).z * mix(hsv2rgb_K.xxx, clamp(abs(fract(vec3<f32>(0.15 + 0.5, 0.7, 2.).xxx + hsv2rgb_K.xyz) * 6. - hsv2rgb_K.www) - hsv2rgb_K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), vec3<f32>(0.15 + 0.5, 0.7, 2.).y));
        const rrefr_index: f32 = 1. / refr_index;
        const poly_cospin: f32 = cos(3.1415927 / f32(poly_type));
        const poly_scospin: f32 = sqrt(0.75 - poly_cospin * poly_cospin);
        const poly_nc: vec3<f32> = vec3<f32>(-0.5, -poly_cospin, poly_scospin);
        const poly_pab: vec3<f32> = vec3<f32>(0., 0., 1.);
        const poly_pbc_: vec3<f32> = vec3<f32>(poly_scospin, 0., 0.5);
        const poly_pca_: vec3<f32> = vec3<f32>(0., poly_scospin, poly_cospin);
        const poly_p: vec3<f32> = normalize(poly_U * poly_pab + poly_V * poly_pbc_ + poly_W * poly_pca_);
        const poly_pbc: vec3<f32> = normalize(poly_pbc_);
        const poly_pca: vec3<f32> = normalize(poly_pca_);
        
        var<workgroup> g_rot: mat3x3<f32>;
        var<workgroup> g_gd: vec2<f32>;
        
        fn rot(d: vec3<f32>, z: vec3<f32>) -> mat3x3<f32> {
            var v: vec3<f32> = cross(z, d);
            var c: f32 = dot(z, d);
            let k: f32 = 1. / (1. + c);
            return mat3x3<f32>(v.x * v.x * k + c, v.y * v.x * k - v.z, v.z * v.x * k + v.y, v.x * v.y * k + v.z, v.y * v.y * k + c, v.z * v.y * k - v.x, v.x * v.z * k - v.y, v.y * v.z * k + v.x, v.z * v.z * k + c);
        }
        

        fn aces_approx(v: vec3<f32>) -> vec3<f32> {
            var v_var = v;
            v_var = max(v_var, vec3<f32>(0.0));
            v_var = v_var * (0.6);
            var a: f32 = 2.51;
            let b: f32 = 0.03;
            let c: f32 = 2.43;
            var d: f32 = 0.59;
            let e: f32 = 0.14;
            return clamp(v_var * (a * v_var + b) / (v_var * (c * v_var + d) + e), vec3<f32>(0.0), vec3<f32>(1.0));
        }
        
        
        fn sphere(p: vec3<f32>, r: f32) -> f32 {
            return length(p) - r;
        } 
        
        fn box(p: vec2<f32>, b: vec2<f32>) -> f32 {
            var d: vec2<f32> = abs(p) - b;
            return length(max(d, vec2<f32>(0.0))) + min(max(d.x, d.y), 0.0);
        }
        
        
        fn poly_fold(pos: ptr<function, vec3<f32>>)  {
            var p: vec3<f32> = (*pos);
        
            for (var i: i32 = 0; i < poly_type; i++) {
                var pxy = p.xy;
            pxy = abs(p.xy);
            p.x = pxy.x;
            p.y = pxy.y;
                p = p - (2. * min(0., dot(p, poly_nc)) * poly_nc);
            }
        
            (*pos) = p;
        } 
        
        fn poly_plane(pos: vec3<f32>) -> f32 {
            var d0: f32 = dot(pos, poly_pab);
            var d1: f32 = dot(pos, poly_pbc);
            var d2: f32 = dot(pos, poly_pca);
            var d: f32 = d0;
            d = max(d, d1);
            d = max(d, d2);
            return d;
        } 
        
        fn poly_corner(pos: vec3<f32>) -> f32 {
            var d: f32 = length(pos) - 0.0125;
            return d;
        } 
        
        fn dot2(p: vec3<f32>) -> f32 {
            return dot(p, p);
        } 
        
        fn poly_edge(pos: vec3<f32>) -> f32 {
            let dla: f32 = dot2(pos - min(0., pos.x) * vec3<f32>(1., 0., 0.));
            let dlb: f32 = dot2(pos - min(0., pos.y) * vec3<f32>(0., 1., 0.));
            let dlc: f32 = dot2(pos - min(0., dot(pos, poly_nc)) * poly_nc);
            return sqrt(min(min(dla, dlb), dlc)) - 0.002;
        } 
        
        fn shape(pos: vec3<f32>) -> vec3<f32> {
            var pos_var = pos;
            pos_var = pos_var * (g_rot);
            pos_var = pos_var / (poly_zoom);
            poly_fold(&(pos_var));
            pos_var = pos_var - (poly_p);
            return vec3<f32>(poly_plane(pos_var), poly_edge(pos_var), poly_corner(pos_var)) * poly_zoom;
        } 
        
        fn render0(ro: vec3<f32>, rd: vec3<f32>) -> vec3<f32> {
            var col: vec3<f32> = vec3<f32>(0.);
            let srd: f32 = sign(rd.y);
            let tp: f32 = -(ro.y - 6.) / abs(rd.y);
            if (srd < 0.) {
                col = col + (bottomBoxCol * exp(-0.5 * length((ro + tp * rd).xz)));
            }
            if (srd > 0.) {
                let pos: vec3<f32> = ro + tp * rd;
                var pp: vec2<f32> = pos.xz;
                var db: f32 = box(pp, vec2<f32>(5., 9.)) - 3.;
                col = col + (topBoxCol * rd.y * rd.y * smoothstep(0.25, 0., db));
                col = col + (0.2 * topBoxCol * exp(-0.5 * max(db, 0.)));
                col = col + (0.05 * sqrt(topBoxCol) * max(-db, 0.));
            }
            col = col + (sunCol / (1.001 - dot(sunDir, rd)));
            return col;
        } 
        
        fn df2(p: vec3<f32>) -> f32 {
            var ds: vec3<f32> = shape(p);
            let d2: f32 = ds.y - 0.005;
            var d0: f32 = min(-ds.x, d2);
            var d1: f32 = sphere(p, inner_sphere);
            g_gd = min(g_gd, vec2<f32>(d2, d1));
            var d: f32 = min(d0, d1);
            return d;
        } 
        
        fn rayMarch2(ro: vec3<f32>, rd: vec3<f32>, tinit: f32) -> f32 {
            var t: f32 = tinit;
            var i: i32;
        
            for (i = 0;i < 50; i++) {
                var d: f32 = df2(ro + rd * t);
                if (d < 0.0005) {
                    break;
                }
                t = t + (d);
            }
        
            return t;
        } 
        
        fn normal2(pos: vec3<f32>) -> vec3<f32> {
            var eps: vec2<f32> = vec2<f32>(0.005, 0.);
            var nor: vec3<f32>;
            nor.x = df2(pos + eps.xyy) - df2(pos - eps.xyy);
            nor.y = df2(pos + eps.yxy) - df2(pos - eps.yxy);
            nor.z = df2(pos + eps.yyx) - df2(pos - eps.yyx);
            return normalize(nor);
        } 
        
        fn render2(ro: vec3<f32>, rd: vec3<f32>, db: f32) -> vec3<f32> {
            var db_var = db;
            var rd_var = rd;
            var ro_var = ro;
            var agg: vec3<f32> = vec3<f32>(0.);
            var ragg: f32 = 1.;
            var tagg: f32 = 0.;
        
            for (var bounce: i32 = 0; bounce < 6;   bounce++) {
                if (ragg < 0.1) {		break;
         }
                g_gd = vec2<f32>(1000.);
                let t2: f32 = rayMarch2(ro_var, rd_var, min(db_var + 0.05, 0.3));
                let gd2: vec2<f32> = g_gd;
                tagg = tagg + (t2);
                let p2: vec3<f32> = ro_var + rd_var * t2;
                let n2: vec3<f32> = normal2(p2);
                let r2: vec3<f32> = reflect(rd_var, n2);
                let rr2: vec3<f32> = refract(rd_var, n2, rrefr_index);
                let fre2: f32 = 1. + dot(n2, rd_var);
                let beer: vec3<f32> = ragg * exp(0.2 * beerCol * tagg);
                agg = agg + (glowCol1 * beer * ((1. + tagg * tagg * 0.04) * 6. / max(gd2.x, 0.0005 + tagg * tagg * 0.0002 / ragg)));
                let ocol: vec3<f32> = 0.2 * beer * render0(p2, rr2);
                if (gd2.y <= 0.0005) {
                    ragg = ragg * (1. - 0.9 * fre2);
                } else { 
                    agg = agg + (ocol);
                    ragg = ragg * (0.8);
                }
                ro_var = p2;
                rd_var = r2;
                db_var = gd2.x;
            }
        
            return agg;
        } 
        
        fn df3(p: vec3<f32>) -> f32 {
            let ds: vec3<f32> = shape(p);
            g_gd = min(g_gd, ds.yz);
            let sw: f32 = 0.02;
            let d1: f32 = min(ds.y, ds.z) - sw;
            var d0: f32 = ds.x;
            d0 = min(d0, ds.y);
            d0 = min(d0, ds.z);
            return d0;
        } 
        
        fn rayMarch3(ro: vec3<f32>, rd: vec3<f32>, tinit: f32, iter: ptr<function, i32>) -> f32 {
            var t: f32 = tinit;
            var i: i32;
        
            for (i = 0;i < MAX_RAY_MARCHES3; i++) {
                let d: f32 = df3(ro + rd * t);
                if (d < TOLERANCE3 || t > MAX_RAY_LENGTH3) {
                    break;
                }
                t = t + (d);
            }
        
            (*iter) = i;
            return t;
        } 
        
        fn normal3(pos: vec3<f32>) -> vec3<f32> {
            let eps: vec2<f32> = vec2<f32>(NORM_OFF3, 0.);
            var nor: vec3<f32>;
            nor.x = df3(pos + eps.xyy) - df3(pos - eps.xyy);
            nor.y = df3(pos + eps.yxy) - df3(pos - eps.yxy);
            nor.z = df3(pos + eps.yyx) - df3(pos - eps.yyx);
            return normalize(nor);
        } 
        
        fn render3(ro: vec3<f32>, rd: vec3<f32>) -> vec3<f32> {
            var iter: i32;
            let skyCol: vec3<f32> = render0(ro, rd);
            var col: vec3<f32> = skyCol;
            g_gd = vec2<f32>(1000.0, 0.0);
            let t1: f32 = rayMarch3(ro, rd, 0.1, &(iter));
            let gd1: vec2<f32> = g_gd;
            let p1: vec3<f32> = ro + t1 * rd;
            let n1: vec3<f32> = normal3(p1);
            var r1: vec3<f32> = reflect(rd, n1);
            let rr1: vec3<f32> = refract(rd, n1, refr_index);
            var fre1: f32 = 1.0 + dot(rd, n1);
            fre1 = fre1 * fre1;
            let ifo: f32 = mix(0.5, 1.0, smoothstep(1.0, 0.9, f32(iter) / f32(MAX_RAY_MARCHES3)));
            if (t1 < MAX_RAY_LENGTH3) {
                col = render0(p1, r1) * (0.5 + 0.5 * fre1) * ifo;
                let icol: vec3<f32> = render2(p1, rr1, gd1.x);
                if (gd1.x > TOLERANCE3 && gd1.y > TOLERANCE3 && all(rr1 != vec3<f32>(0.0))) {
                    col = col + (icol * (1.0 - 0.75 * fre1) * ifo);
                }
            }
            col = col + ((glowCol0 + 1.0 * fre1 * glowCol0) / max(gd1.x, 0.0003));
            return col;
        }
             
        fn effect(p: vec2<f32>, pp: vec2<f32>) -> vec3<f32> {
            let fov: f32 = 2.;
            let up: vec3<f32> = vec3<f32>(0., 1., 0.);
            let la: vec3<f32> = vec3<f32>(0.);
            let ww: vec3<f32> = normalize(normalize(la - rayOrigin));
            let uu: vec3<f32> = normalize(cross(up, ww));
            let vv: vec3<f32> = cross(ww, uu);
            let rd: vec3<f32> = normalize(-p.x * uu + p.y * vv + fov * ww);
            var col: vec3<f32> = vec3<f32>(0.);
            col = render3(rayOrigin, rd);
            col = col - (0.02 * vec3<f32>(2., 3., 1.) * (length(p) + 0.25));
            col = aces_approx(col);
            col = sqrt(col);
            return col;
        } 
       
       @compute @workgroup_size(8,8,1) fn main(
        @builtin(global_invocation_id) invocation_id : vec3u
          )  {

            let res: vec2<u32> = textureDimensions(outputTexture);
            let R: vec2<f32> = uniforms.resolution.xy;
            
            let y_inverted_location = vec2<i32>(i32(invocation_id.x), i32(R.y) - i32(invocation_id.y));
            let location = vec2<i32>(i32(invocation_id.x), i32(invocation_id.y));
            
            var fragColor: vec4<f32>;
            var fragCoord = vec2<f32>(f32(location.x), f32(location.y) );
        
            let q: vec2<f32> = fragCoord / R.xy;
            var p: vec2<f32> = -1. + 2. * q;
            let pp: vec2<f32> = p;
            p.x = p.x * (R.x / R.y);
            let a: f32 = uniforms.time * rotation_speed;
            let r0: vec3<f32> = vec3<f32>(1., sin(vec2<f32>(sqrt(0.5), 1.) * a));
            let r1: vec3<f32> = vec3<f32>(cos(vec2<f32>(sqrt(0.5), 1.) * 0.913 * a), 1.);
            let rot: mat3x3<f32> = rot(normalize(r0), normalize(r1));
            g_rot = rot;
            let col: vec3<f32> = effect(p, pp);
            fragColor = vec4<f32>(col, 1.);


        
            let intFragCoord = vec2<i32>(i32(invocation_id.x), i32(invocation_idjf.y));

            let color = vec4f(fragColor.rgb,1.);     
   
            textureStore(outputTexture, intFragCoord, color);

      }
    `;
