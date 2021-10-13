/// <reference types="dist" />
export declare const defaultWglslVertex = "  \nstruct VertexInput {\n  [[location(0)]] pos: vec2<f32>;\n};  \nstruct VertexOutput {\n  [[builtin(position)]] pos: vec4<f32>;\n  [[location(0)]] uv: vec2<f32>;\n};  \n[[stage(vertex)]]\nfn main_vertex(input: VertexInput) -> VertexOutput {\n  var output: VertexOutput;\n  var pos: vec2<f32> = input.pos * 2.0 - 1.0;\n  output.pos = vec4<f32>(pos, 0.0, 1.0);\n  output.uv = input.pos;\n  return output;\n} \n";
export interface IMaterialShader {
    vertex: any;
    vertexEntryPoint?: string;
    fragment: any;
    fragmentEntryPoint?: string;
    type?: number;
}
export declare class Material {
    device: GPUDevice;
    shader: IMaterialShader;
    vertexShaderModule: GPUShaderModule;
    fragmentShaderModule: GPUShaderModule;
    constructor(device: GPUDevice, shader: IMaterialShader);
    static createMaterialShader(spirvVert: Uint32Array, spirvFrag: Uint32Array, vertexEntryPoint: string, fragmentEntryPoint: any): IMaterialShader;
}
