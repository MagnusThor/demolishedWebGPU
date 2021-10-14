import { IMaterialShader } from "./IMaterialShader";

export const defaultWglslVertex = /* wgsl */ `  
struct VertexInput {
  [[location(0)]] pos: vec2<f32>;
};  
struct VertexOutput {
  [[builtin(position)]] pos: vec4<f32>;
  [[location(0)]] uv: vec2<f32>;
};  
[[stage(vertex)]]
fn main_vertex(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  var pos: vec2<f32> = input.pos * 2.0 - 1.0;
  output.pos = vec4<f32>(pos, 0.0, 1.0);
  output.uv = input.pos;
  return output;
}`;


export class Material {
    vertexShaderModule: GPUShaderModule;
    fragmentShaderModule: GPUShaderModule;
    constructor(public device: GPUDevice, public shader: IMaterialShader) {
        this.vertexShaderModule = this.device.createShaderModule({
            code: shader.vertex,
        });
        this.fragmentShaderModule = this.device.createShaderModule({
            code: shader.fragment
        });
    }
    static createMaterialShader(spirvVert:Uint32Array,spirvFrag:Uint32Array,vertexEntryPoint:string,fragmentEntryPoint):IMaterialShader {
        const material:IMaterialShader = {
            fragment: spirvFrag,
            fragmentEntryPoint: fragmentEntryPoint,
            vertex:spirvVert,
            vertexEntryPoint: vertexEntryPoint
        } 
        return material;
    }
}
