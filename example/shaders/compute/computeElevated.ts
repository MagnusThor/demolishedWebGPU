// https://www.shadertoy.com/view/MdX3Rr by Inigo Quilez 
// An attempt at converting from glsl (WebGL) to WebGPU and wglsl
export const computeElevatedShader = /* glsl */ ` 

        struct Uniforms {
            resolution: vec3<f32>,
            time: f32
        };
       
        @group(0) @binding(0) var outputTexture: texture_storage_2d<bgra8unorm, write>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;

        @group(0) @binding(2) var buffer_sampler: sampler;
        @group(0) @binding(3) var BUFFER_iChannel0: texture_2d<f32>; 

        const m2: mat2x2<f32> = mat2x2<f32>(0.8, -0.6, 0.6, 0.8);   
        
        fn myTextureLoad(tex:texture_2d<f32>,p:vec2<f32>) -> vec4<f32> {
            let result = textureLoad(tex,vec2<u32>(p),0);
            return result;
        }

        fn myTextureLoadLevel(tex:texture_2d<f32>,p:vec2<f32>,r:i32) -> vec4<f32> {
            let result = textureLoad(tex,vec2<u32>(p),r);
            return result;
        }
    
     

        fn noised(x: vec2<f32>) -> vec3<f32> {

            var f: vec2<f32> = fract(x);
            let u: vec2<f32> = f * f * f * (f * (f * 6. - 15.) + 10.);
            let du: vec2<f32> = 30. * f * f * (f * (f - 2.) + 1.);
            var p: vec2<f32> = floor(x);
            
            /*
            var a: f32 = textureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(0.5, 0.5)) / 256., f32(0.)).x;
            var b: f32 = textureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(1.5, 0.5)) / 256., f32(0.)).x;
            let c: f32 = textureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(0.5, 1.5)) / 256., f32(0.)).x;
            var d: f32 = textureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(1.5, 1.5)) / 256., f32(0.)).x;
            */

            var a: f32 = myTextureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(0.5, 0.5)) / 256., i32(0.)).x;

            var b: f32 = myTextureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(1.5, 0.5)) / 256., i32(0.)).x;

            var c: f32 = myTextureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(0.5, 1.5)) / 256., i32(0.)).x;

            var d: f32 = myTextureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(1.5, 1.5)) / 256., i32(0.)).x;

            return vec3<f32>(a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y, du * (vec2<f32>(b - a, c - a) + (a - b - c + d) * u.yx));
        } 
        
        
        
        fn terrainH(x: vec2<f32>) -> f32 {
            var p: vec2<f32> = x * 0.003 / 250.;
            var a: f32 = 0.;
            var b: f32 = 1.;
            var d: vec2<f32> = vec2<f32>(0.);
        
            for (var i: i32 = 0; i < 16; i = i + 1) {
                var n: vec3<f32> = noised(p);
                d = d + (n.yz);
                a = a + (b * n.x / (1. + dot(d, d)));
                b = b * (0.5);
                p = m2 * p * 2.;
            }
        
            return 250. * 120. * a;
        } 
        
        fn terrainM(x: vec2<f32>) -> f32 {

            var p: vec2<f32> = x * 0.003 / 250.;
            var a: f32 = 0.;
            var b: f32 = 1.;
            var d: vec2<f32> = vec2<f32>(0.);
        
            for (var i: i32 = 0; i < 9; i = i + 1) {
                var n: vec3<f32> = noised(p);
                d = d + (n.yz);
                a = a + (b * n.x / (1. + dot(d, d)));
                b = b * (0.5);
                p = m2 * p * 2.;
            }
        
            return 250. * 120. * a;
        } 
        
        fn terrainL(x: vec2<f32>) -> f32 {
            var p: vec2<f32> = x * 0.003 / 250.;
            var a: f32 = 0.;
            var b: f32 = 1.;
            var d: vec2<f32> = vec2<f32>(0.);
        
            for (var i: i32 = 0; i < 3; i = i + 1) {
                let n: vec3<f32> = noised(p);
                d = d + (n.yz);
                a = a + (b * n.x / (1. + dot(d, d)));
                b = b * (0.5);
                p = m2 * p * 2.;
            }
        
            return 250. * 120. * a;
        } 
        
        fn raycast(ro: vec3<f32>, rd: vec3<f32>, tmin: f32, tmax: f32) -> f32 {
            var t: f32 = tmin;
        
            for (var i: i32 = 0; i < 300; i = i + 1) {
                var pos: vec3<f32> = ro + t * rd;
                var h: f32 = pos.y - terrainM(pos.xz);
                if (abs(h) < 0.0015 * t || t > tmax) {		break;
         }
                t = t + (0.4 * h);
            }
        
            return t;
        } 
        
        fn softShadow(ro: vec3<f32>, rd: vec3<f32>, dis: f32) -> f32 {
            let minStep: f32 = clamp(dis * 0.01, 250. * 0.5, 250. * 50.);
            var res: f32 = 1.;
            var t: f32 = 0.001;
        
            for (var i: i32 = 0; i < 80; i = i + 1) {
                var p: vec3<f32> = ro + t * rd;
                var h: f32 = p.y - terrainM(p.xz);
                res = min(res, 16. * h / t);
                t = t + (max(minStep, h));
                if (res < 0.001 || p.y > 250. * 200.) {		break;
              }
            }
        
            return clamp(res, 0., 1.);
        } 
        
        fn calcNormal(pos: vec3<f32>, t: f32) -> vec3<f32> {

            let eps: vec2<f32> = vec2<f32>(0.001 * t, 0.);
            return normalize(vec3<f32>(terrainH(pos.xz - eps.xy) - terrainH(pos.xz + eps.xy), 2. * eps.x, terrainH(pos.xz - eps.yx) - terrainH(pos.xz + eps.yx)));
     
        } 

        
        fn fbm(p: vec2<f32>) -> f32 {

            var p_var = p;
            var f: f32 = 0.;
            
            f = f + (0.5 * myTextureLoad(BUFFER_iChannel0, p_var / 256.).x);
            p_var = m2 * p_var * 2.02;

            f = f + (0.25 * myTextureLoad(BUFFER_iChannel0, p_var / 256.).x);
            p_var = m2 * p_var * 2.03;
            f = f + (0.125 * myTextureLoad(BUFFER_iChannel0, p_var / 256.).x);
            p_var = m2 * p_var * 2.01;
            f = f + (0.0625 * myTextureLoad(BUFFER_iChannel0, p_var / 256.).x);
            return f / 0.9375;

        } 
        
        const kMaxT: f32 = 5000. * 250.;

        fn render(ro: vec3<f32>, rd: vec3<f32>) -> vec4<f32> {
            let light1: vec3<f32> = normalize(vec3<f32>(-0.8, 0.4, -0.3));
            let tmin: f32 = 1.;
            let tmax: f32 = kMaxT;
            let sundot: f32 = clamp(dot(rd, light1), 0., 1.);
            var col: vec3<f32>;
            var t: f32 = raycast(ro, rd, tmin, tmax);
           
            if (t > tmax) {
                col = vec3<f32>(0.3, 0.5, 0.85) - rd.y * rd.y * 0.5;
                col = mix(col, 0.85 * vec3<f32>(0.7, 0.75, 0.85), pow(1. - max(rd.y, 0.), 4.));
                col = col + (0.25 * vec3<f32>(1., 0.7, 0.4) * pow(sundot, 5.));
                col = col + (0.25 * vec3<f32>(1., 0.8, 0.6) * pow(sundot, 64.));
                col = col + (0.2 * vec3<f32>(1., 0.8, 0.6) * pow(sundot, 512.));
                let sc: vec2<f32> = ro.xz + rd.xz * (250. * 1000. - ro.y) / rd.y;
                col = mix(col, vec3<f32>(1., 0.95, 1.), 0.5 * smoothstep(0.5, 0.8, fbm(0.0005 * sc / 250.)));
                col = mix(col, 0.68 * vec3<f32>(0.4, 0.65, 1.), pow(1. - max(rd.y, 0.), 16.));
                t = -1.;
            } else { 
                let pos: vec3<f32> = ro + t * rd;
                let nor: vec3<f32> = calcNormal(pos, t);
                let _ref: vec3<f32> = reflect(rd, nor);
                let fre: f32 = clamp(1. + dot(rd, nor), 0., 1.);
                let hal: vec3<f32> = normalize(light1 - rd);

                let r: f32 = myTextureLoad(BUFFER_iChannel0, 7. / 250. * pos.xz / 256.).x;
                
                col = (r * 0.25 + 0.75) * 0.9 * mix(vec3<f32>(0.08, 0.05, 0.03), vec3<f32>(0.1, 0.09, 0.08), 
                    myTextureLoad(BUFFER_iChannel0, 0.00007 * vec2<f32>(pos.x, pos.y * 48.) / 250.).x);

                col = mix(col, 0.2 * vec3<f32>(0.45, 0.3, 0.15) * (0.5 + 0.5 * r), smoothstep(0.7, 0.9, nor.y));

                col = mix(col, 0.15 * vec3<f32>(0.3, 0.3, 0.1) * (0.25 + 0.75 * r), smoothstep(0.95, 1., nor.y));

                col = col * (0.1 + 1.8 * sqrt(fbm(pos.xz * 0.04) * fbm(pos.xz * 0.005)));
                let h: f32 = smoothstep(55., 80., pos.y / 250. + 25. * fbm(0.01 * pos.xz / 250.));
                let e: f32 = smoothstep(1. - 0.5 * h, 1. - 0.1 * h, nor.y);
                let o: f32 = 0.3 + 0.7 * smoothstep(0., 0.1, nor.x + h * h);
                var s: f32 = h * e * o;
                col = mix(col, 0.29 * vec3<f32>(0.62, 0.65, 0.7), smoothstep(0.1, 0.9, s));

                let amb: f32 = clamp(0.5 + 0.5 * nor.y, 0., 1.);
                var dif: f32 = clamp(dot(light1, nor), 0., 1.);
                let bac: f32 = clamp(0.2 + 0.8 * dot(normalize(vec3<f32>(-light1.x, 0., light1.z)), nor), 0., 1.);

                var sh: f32 = 1.;
                
                if (dif >= 0.0001) { 
                    sh = softShadow(pos + light1 * 250. * 0.05, light1, t);
                 }

                var lin: vec3<f32> = vec3<f32>(0.);
                    lin = lin + (dif * vec3<f32>(8., 5., 3.) * 1.3 * vec3<f32>(sh, sh * sh * 0.5 + 0.5 * sh, sh * sh * 0.8 + 0.2 * sh));
                    lin = lin + (amb * vec3<f32>(0.4, 0.6, 1.) * 1.2);
                    lin = lin + (bac * vec3<f32>(0.4, 0.5, 0.6));
                    
                col = col * (lin);
                col = col + ((0.7 + 0.3 * s) * (0.04 + 0.96 * pow(clamp(1. + dot(hal, rd), 0., 1.), 5.)) * vec3<f32>(7., 5., 3.) * dif * sh * pow(clamp(dot(nor, hal), 0., 1.), 16.));
                col = col + (s * 0.65 * pow(fre, 4.) * vec3<f32>(0.3, 0.5, 0.6) * smoothstep(0., 0.6, _ref.y));
                
                let fo: f32 = 1. - exp(-pow(0.001 * t / 250., 1.5));
                let fco: vec3<f32> = 0.65 * vec3<f32>(0.4, 0.65, 1.);

                col = mix(col, fco, fo);

            }

            col = col + (0.3 * vec3<f32>(1., 0.7, 0.3) * pow(sundot, 8.));
            col = sqrt(col);

            return vec4<f32>(col, t);

        } 
        
        fn camPath(time: f32) -> vec3<f32> {
            return 250. * 1100. * vec3<f32>(cos(0. + 0.23 * time), 0., cos(1.5 + 0.21 * time));
        } 

        fn setCamera(ro: vec3<f32>, ta: vec3<f32>, cr: f32) -> mat3x3<f32> {
            let cw: vec3<f32> = normalize(ta - ro);
            let cp: vec3<f32> = vec3<f32>(sin(cr), cos(cr), 0.);
            let cu: vec3<f32> = normalize(cross(cw, cp));
            let cv: vec3<f32> = normalize(cross(cu, cw));
            return mat3x3<f32>(cu, cv, cw);
        } 

        
        fn moveCamera(time: f32, 
            oRo: ptr<function, vec3<f32>>, 
            oTa: ptr<function, vec3<f32>>, 
            oCr: ptr<function, f32>, oFl: ptr<function, f32>)
            {
        
            var ro: vec3<f32> = camPath(time);
            var ta: vec3<f32> = camPath(time + 3.);
            ro.y = terrainL(ro.xz) + 22. * 250.;
            ta.y = ro.y - 20. * 250.;
            let cr: f32 = 0.2 * cos(0.1 * time);
            (*oRo) = ro;
            (*oTa) = ta;
            (*oCr) = cr;
            (*oFl) = 3.;
        } 
        
        @compute @workgroup_size(8,8,1) 
        fn main(@builtin(global_invocation_id) invocation_id : vec3u)  {                

            let resolution = textureDimensions(outputTexture);

            let fragCoord = vec2<f32>(f32(invocation_id.x),f32(invocation_id.x));
        
           
            let uv: vec2<f32> = vec2<f32>(f32(fragCoord.x),f32(fragCoord.y)) / vec2<f32>(f32(resolution.x),f32(resolution.y));
         
            let y_inverted_location = vec2<i32>(i32(invocation_id.x), i32(resolution.y) - i32(invocation_id.y));
            let location = vec2<i32>(i32(invocation_id.x), i32(invocation_id.y));
            
            var fragColor: vec4<f32>;
         
            let time: f32 = uniforms.time * 0.1 - 0.1 + 0.3 + 4.;

            var ro: vec3<f32> = vec3<f32>(0.);
            var ta: vec3<f32>;
            var cr: f32;
            var fl: f32;

            moveCamera(time, &(ro), &(ta), &(cr), &(fl));

            let cam: mat3x3<f32> = setCamera(ro, ta, cr);

            let p: vec2<f32> = (-uniforms.resolution.xy + 2.0 * fragCoord.xy) / uniforms.resolution.y;

            var t: f32 = kMaxT;
            var tot: vec3<f32> = vec3<f32>(0.);
            let s: vec2<f32> = p;
            let rd: vec3<f32> = cam * normalize(vec3<f32>(s, fl));
            let res: vec4<f32> = render(ro, rd);
            t = min(t, res.w);
            tot = tot + (res.xyz);
            var vel: f32 = 0.;
            if (t < 0.) {
                vel = -1.;
            } else { 
                let oldTime: f32 = time - 0.1 * 1. / 24.;
                
                var oldRo: vec3<f32>;
                var oldTa: vec3<f32>;
                var oldCr: f32;
                var oldFl: f32;

                moveCamera(oldTime, &(oldRo), &(oldTa), &(oldCr), &(oldFl));

                let oldCam: mat3x3<f32> = setCamera(oldRo, oldTa, oldCr);
                let wpos: vec3<f32> = ro + rd * t;
                let cpos: vec3<f32> = vec3<f32>(dot(wpos - oldRo, oldCam[0]), dot(wpos - oldRo, oldCam[1]), dot(wpos - oldRo, oldCam[2]));
                let npos: vec2<f32> = oldFl * cpos.xy / cpos.z;

                var spos: vec2<f32> = 0.5 + 0.5 * npos * vec2<f32>(uniforms.resolution.y / uniforms.resolution.x, 1.);
                
                let uv: vec2<f32> = fragCoord / uniforms.resolution.xy;
                
               // spos = clamp(0.5 + 0.5 * (spos - uv) / 0.25, 0., 1.);
                spos = clamp(0.5 + 0.5 * (spos - uv) / 0.25, vec2<f32>(0.0), vec2<f32>(1.0));


                vel = floor(spos.x * 1023.) + floor(spos.y * 1023.) * 1024.;
            }


             //fragColor = vec4<f32>(tot, vel);

             let mycolor = vec4f(tot.rgb, 1);     

               
            textureStore(outputTexture, invocation_id.xy, mycolor);


        } 
        
        




    `;
