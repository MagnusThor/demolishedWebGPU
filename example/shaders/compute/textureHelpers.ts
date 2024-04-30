
export const textureHelpers = /* glsl */ `


fn sample_texture(tex:texture_2d<f32>,smp:sampler,uv:vec2<f32>) -> vec4<f32>{
    let result:vec4<f32> = textureSample(textureB, smp, -uv);
    return result;
}   

`;
