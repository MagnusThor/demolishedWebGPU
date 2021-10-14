"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Material = exports.defaultWglslVertex = void 0;
exports.defaultWglslVertex = `  
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
class Material {
    constructor(device, shader) {
        this.device = device;
        this.shader = shader;
        this.vertexShaderModule = this.device.createShaderModule({
            code: shader.vertex,
        });
        this.fragmentShaderModule = this.device.createShaderModule({
            code: shader.fragment
        });
    }
    static createMaterialShader(spirvVert, spirvFrag, vertexEntryPoint, fragmentEntryPoint) {
        const material = {
            fragment: spirvFrag,
            fragmentEntryPoint: fragmentEntryPoint,
            vertex: spirvVert,
            vertexEntryPoint: vertexEntryPoint
        };
        return material;
    }
}
exports.Material = Material;
