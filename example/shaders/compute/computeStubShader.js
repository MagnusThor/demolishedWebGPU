"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeedStubShader = void 0;
exports.computeedStubShader = ` 

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
        
        fn noised(x: vec2<f32>) -> vec3<f32> {
            
            var f: vec2<f32> = fract(x);
            let u: vec2<f32> = f * f * f * (f * (f * 6. - 15.) + 10.);
            let du: vec2<f32> = 30. * f * f * (f * (f - 2.) + 1.);
            var p: vec2<f32> = floor(x);
            
            var a: f32 = myTextureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(0.5, 0.5)) / 256., i32(0.)).x;
            var b: f32 = myTextureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(1.5, 0.5)) / 256., i32(0.)).x;
            var c: f32 = myTextureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(0.5, 1.5)) / 256., i32(0.)).x;
            var d: f32 = myTextureLoadLevel(BUFFER_iChannel0, (p + vec2<f32>(1.5, 1.5)) / 256., i32(0.)).x;
            return vec3<f32>(a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y, du * (vec2<f32>(b - a, c - a) + (a - b - c + d) * u.yx));
        } 
   
        @compute @workgroup_size(8,8,1) 
        fn main(@builtin(global_invocation_id) invocation_id : vec3u)  { 
               
            let resolution = textureDimensions(outputTexture);

            // if (invocation_id.x >= resolution.x || invocation_id.y >= resolution.y) { 
            //     return; 
            // }

            let fragCoord = vec2<f32>(f32(invocation_id.x) + .5, f32(resolution.y - invocation_id.y) - .5);

            let uv = fragCoord / vec2<f32>(resolution); // vec2<f32>

            let color = noised(vec2<f32>(fragCoord.xy));

        
        
            textureStore(outputTexture, vec2<u32>(uv.xy), vec4f(color.xyz,1));


        } 
        
        




    `;
