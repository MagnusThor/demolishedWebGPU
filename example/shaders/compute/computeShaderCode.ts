export const computeShaderCode = /* glsl */ ` 

        struct Uniforms {
            resolution: vec3<f32>,
            time: f32
        };
       
        @group(0) @binding(0) var outputTexture: texture_storage_2d<bgra8unorm, write>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;
       
      @compute  @workgroup_size(8, 8,1) fn main(
        @builtin(global_invocation_id) id : vec3u
      )  {
        
        let size = textureDimensions(outputTexture);

        let center = vec2f(size) / 2.0;
        let pos = id.xy;
        
        let dist = distance(vec2f(pos), center);
        let stripe = dist / 32.0 % 2.0;
        let red = vec4f(1, 0, 0, 1);
        let cyan = vec4f(0, 1, 1, 1);

        let color = select(red, cyan, stripe < 1.0);

        textureStore(outputTexture, pos, color);
      }
    `;
