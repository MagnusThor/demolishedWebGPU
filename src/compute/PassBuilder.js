"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassBuilder = void 0;
class PassBuilder {
    constructor(device, canvas) {
        this.canvas = canvas;
        this.device = device;
    }
    getRenderPiplelineBindingGroupLayout(uniformBuffer, sampler) {
        const bindingGroupEntrys = [];
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
    createComputePipeline(computeShader) {
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
exports.PassBuilder = PassBuilder;
