import { IMaterialShader } from "../../../src/IMaterialShader";

export const magadoshShader: IMaterialShader = {
    vertexEntryPoint : "main",
    fragmentEntryPoint : "main",

    vertex:  /* wgsl */ `  
    [[stage(vertex)]]
    fn main([[location(0)]] pos: vec2<f32>)
         -> [[builtin(position)]] vec4<f32> {
        return vec4<f32>(pos, 0.0, 1.0);
    }`,
    fragment: /* wgsl */`#version 450
    #pragma shader_stage(fragment)
    layout(set = 0, binding = 0) uniform Uniforms {
        vec3 resolution;
        float time;
    } uniforms;
  
    layout(location = 0) out vec4 fragColor;


	void main(){
		
		vec2 resolution = uniforms.resolution.xy;
		float time = uniforms.time;

		vec3 col = vec3(1.0,0.0,0.0);
		fragColor = vec4(col,1.0);
	}
	
`,
}