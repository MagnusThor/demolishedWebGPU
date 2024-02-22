import { IMyShaderModule } from "./IMyShaderModule";
import { IPassBuilder } from "./IPassBuilder";
import { PassBase } from "./PassBase";


export class PassBuilder extends PassBase implements IPassBuilder {

    pipelineLayout: GPUPipelineLayout;

    device: GPUDevice;
    constructor(device: GPUDevice, public canvas: HTMLCanvasElement) {
        super(device);
        this.device = device;
    }
    bindGroup: GPUBindGroup;


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

        // todo: cache the samplers passed + default sampler ( linearSampler)
        const defaultSampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        // add the GPUSampler
        bindingGroupEntrys.push({
            binding: 1,
            resource: sampler || defaultSampler
        });

        return bindingGroupEntrys;


    }


    createComputePipeline(computeShader: IMyShaderModule): GPUComputePipeline {

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
                module: computeShader.shaderModule,
                entryPoint: 'main',
            },
        });
        return pipeline;
    }
}
