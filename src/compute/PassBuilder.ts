import { IPassBuilder } from "./IPassBuilder";
import { PassBase } from "./PassBase";


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

    createComputePipeline(computeShader: GPUShaderModule): GPUComputePipeline {

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
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
                }
            ],
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
