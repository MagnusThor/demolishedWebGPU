
import { Geometry } from "../Geometry";
import { IMaterialShader } from "../interface/IMaterialShader";
import { Material } from "../Material";
import { ITextureData } from "../interface/ITextureData";
import { IPassBuilder } from "./IPassBuilder";

export class ComputePassBuilder implements IPassBuilder {

    pipelineLayout: GPUPipelineLayout;
    bindGroup: GPUBindGroup;

    device: GPUDevice;
    constructor(device: GPUDevice, public canvas: HTMLCanvasElement) {
        this.device = device;
    }
  

    getRenderPiplelineBindingGroupLayout(
        uniformBuffer: GPUBuffer, sampler?: GPUSampler
    ): Array<GPUBindGroupEntry> {

        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];
        bindingGroupEntrys.push({
            binding: 0,
            resource: {
                buffer: uniformBuffer
            }
        });

        const defaultSampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        bindingGroupEntrys.push({
            binding: 1,
            resource: sampler || defaultSampler
        });
        return bindingGroupEntrys;
    }

    createRenderPipeline(material:Material,geometry: Geometry,textures:Array<ITextureData>):GPURenderPipeline{

        const bindGroupLayoutEntries = new Array<GPUBindGroupLayoutEntry>();

        bindGroupLayoutEntries.push(  
        {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
            buffer: {
                type: "uniform"
            }
        });

        // const sampler = this.device.createSampler({
        //     addressModeU: 'repeat',
        //     addressModeV: 'repeat',
        //     magFilter: 'linear',
        //     minFilter: 'nearest'
        // });
        
       
        bindGroupLayoutEntries.push({ // sampler
            binding: 1,
            visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
            sampler: {
                type: "filtering"
            }
        });

        if (textures.length > 0) {

            for (let i = 0; i < textures.length; i++) { //  1-n texture bindings
                if(textures[i].type === 0){
                    bindGroupLayoutEntries.push({ 
                        binding: 2 + i,
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: {
                            sampleType: "float"
                        }
                    })
                }else{
                    bindGroupLayoutEntries.push({ 
                        binding: 2 + i,
                        visibility:  GPUShaderStage.FRAGMENT,
                        externalTexture:{ }
                    })
                }
                
            }
        }

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: bindGroupLayoutEntries 
        });

      

        const pipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout],
            }),
        
            vertex: {
                module: material.vertexShaderModule,            
                entryPoint: "main_vertex",
                buffers: [geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: material.fragmentShaderModule,
                entryPoint: "main_fragment",
                targets:[
                {
                    format: 'bgra8unorm'
                }
                ]   
            }   
            
        });

        return pipeline;
    

    }

    createComputePipeline(computeShader: GPUShaderModule,textures:Array<ITextureData>): GPUComputePipeline {
        const bindGroupLayoutEntries = new Array<GPUBindGroupLayoutEntry>();
        bindGroupLayoutEntries.push(   {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            storageTexture: {
                access: "write-only",
                format: "bgra8unorm",
                viewDimension: "2d"
            },
        },
        {
            binding: 1, visibility: GPUShaderStage.COMPUTE,
            buffer: {
                type: "uniform"
            }
        });
        if (textures.length > 0) {
            for (let i = 0; i < textures.length; i++) { //  1-n texture bindings
                if(textures[i].type === 0){
                    bindGroupLayoutEntries.push({ 
                        binding: 3 + i,
                        visibility: window.GPUShaderStage.COMPUTE,
                        texture: {
                            sampleType: "float"
                        }
                    })
                }else{
                    bindGroupLayoutEntries.push({ 
                        binding: 3 + i,
                        visibility: window.GPUShaderStage.COMPUTE,
                        externalTexture:{ }
                    })
                }
                
            }
        }
        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: bindGroupLayoutEntries 
        });
        const pipeline = this.device.createComputePipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout],
            }),
            compute: {
                module: computeShader,
                entryPoint: 'main',
            },
        });
        return pipeline;
    }
}
