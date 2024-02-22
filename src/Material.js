"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Material = exports.defaultWglslVertex = void 0;
exports.defaultWglslVertex = `  

struct VertexInput {
  @location(0) pos: vec2<f32>,
  @builtin(vertex_index) index : u32
};  

struct VertexOutput {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
};  

@vertex
fn main_vertex(input:VertexInput) -> VertexOutput {

    var output: VertexOutput;


    var pos: vec2<f32> = input.pos * 2.0 - 1.0;
    output.pos = vec4<f32>(pos, 0.0, 1.0);
    output.uv = pos;


    // var vtx = array<vec3<f32>, 6>(
    //   vec3<f32>(-1.0,  1.0, 0.0),
    //   vec3<f32>(-1.0, -1.0, 0.0),
    //   vec3<f32>( 1.0, -1.0, 0.0),
    //   vec3<f32>( 1.0,  1.0, 0.0),
    //   vec3<f32>(-1.0,  1.0, 0.0),
    //   vec3<f32>( 1.0, -1.0, 0.0),
    // );

     // var uv:vec2<f32> = vec2<f32>(vtx[i].x,vtx[i].y);

      // var pos = 2.0 * uv - vec2<f32>(1.0);
      // output.pos =   vec4<f32>(pos.xy,1., 1.0) ;
      // output.uv = vec2<f32>(0.);

  return output;
}`;
class Material {
    constructor(device, shader) {
        this.device = device;
        this.shader = shader;
        this.vertexShaderModule = this.device.createShaderModule({
            code: shader.vertex
        });
        this.fragmentShaderModule = this.device.createShaderModule({
            code: shader.fragment
        });
    }
    static createMaterialShader(vertex, fragment, vertexEntryPoint, fragmentEntryPoint) {
        const material = {
            fragment: fragment,
            fragmentEntryPoint: fragmentEntryPoint,
            vertex: vertex,
            vertexEntryPoint: vertexEntryPoint
        };
        return material;
    }
}
exports.Material = Material;
