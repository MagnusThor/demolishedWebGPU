import { Uniforms } from "./Uniforms";


export interface IPass {
    label: string;
    pipleline: GPUComputePipeline;
    uniforms: Uniforms;
    bindGroup: GPUBindGroup;
    buffer: GPUTexture;
    bufferView: GPUTextureView;
}
