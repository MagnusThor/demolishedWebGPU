import { Uniforms } from "./Uniforms";


export interface IPass {
    label: string;
    pipleline: GPUComputePipeline | GPURenderPipeline;
    uniforms: Uniforms;
    bindGroup: GPUBindGroup;
    buffer: GPUTexture;
    bufferView: GPUTextureView;
    type: number
    
}

export class RenderPass implements IPass
{
    constructor(public type:number,public label:string,public pipleline:GPUComputePipeline | GPURenderPipeline,
        public uniforms: Uniforms,public bindGroup:GPUBindGroup, public buffer:GPUTexture,
        public bufferView: GPUTextureView){

    }

}