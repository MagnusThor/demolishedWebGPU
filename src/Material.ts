import { IMaterialShader } from "./IMaterialShader";

export const defaultWglslVertex = /* glsl */ `  

struct VertexInput {
  @location(0) pos: vec2<f32>,
  @builtin(vertex_index) index : u32
};  

struct VertexOutput {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) fragCoord: vec2<f32>
};  


@vertex
fn main_vertex(input:VertexInput) -> VertexOutput {

    var output: VertexOutput;

    var pos: vec2<f32> = input.pos * 2.0 - 1.0;
    output.pos = vec4<f32>(pos, 0.0, 1.0);
    output.uv = pos;
    output.fragCoord = vec2<f32>((pos.x + 1.0) / 2.0, (1.0 - pos.y) / 2.0); 


  return output;
}`;




export class Material {
    vertexShaderModule: GPUShaderModule;
    fragmentShaderModule: GPUShaderModule;
    constructor(public device: GPUDevice, public shader: IMaterialShader) {
        
        this.vertexShaderModule = this.device.createShaderModule({
            code: shader.vertex
        });

        this.fragmentShaderModule = this.device.createShaderModule({
            code: shader.fragment
        });
    }
    
    static createMaterialShader(vertex:Uint32Array,fragment:Uint32Array,vertexEntryPoint:string,fragmentEntryPoint):IMaterialShader {
        const material:IMaterialShader = {
            fragment: fragment,
            fragmentEntryPoint: fragmentEntryPoint,
            vertex:vertex,
            vertexEntryPoint: vertexEntryPoint
        } 
        return material;
    }
}
