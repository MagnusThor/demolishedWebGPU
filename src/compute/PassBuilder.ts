
import { ITextureData } from "../Scene";
import { IPassBuilder } from "./IPassBuilder";

export class PassBuilder implements IPassBuilder {

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


        // deal with the textures and samplers

        if (textures.length > 0) {
            
            bindGroupLayoutEntries.push({ // sampler
                binding: 2,
                visibility: window.GPUShaderStage.COMPUTE,
                sampler: {
                    type: "filtering"
                }
            });

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
