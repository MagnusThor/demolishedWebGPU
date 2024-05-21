"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputePassBuilder = void 0;
class ComputePassBuilder {
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
    createRenderPipeline(material, geometry, textures) {
        const bindGroupLayoutEntries = new Array();
        bindGroupLayoutEntries.push({
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
        bindGroupLayoutEntries.push({
            binding: 1,
            visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
            sampler: {
                type: "filtering"
            }
        });
        if (textures.length > 0) {
            for (let i = 0; i < textures.length; i++) { //  1-n texture bindings
                if (textures[i].type === 0) {
                    bindGroupLayoutEntries.push({
                        binding: 2 + i,
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: {
                            sampleType: "float"
                        }
                    });
                }
                else {
                    bindGroupLayoutEntries.push({
                        binding: 2 + i,
                        visibility: GPUShaderStage.FRAGMENT,
                        externalTexture: {}
                    });
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
                targets: [
                    {
                        format: 'bgra8unorm'
                    }
                ]
            }
        });
        return pipeline;
    }
    createComputePipeline(computeShader, textures) {
        const bindGroupLayoutEntries = new Array();
        bindGroupLayoutEntries.push({
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            storageTexture: {
                access: "write-only",
                format: "bgra8unorm",
                viewDimension: "2d"
            },
        }, {
            binding: 1, visibility: GPUShaderStage.COMPUTE,
            buffer: {
                type: "uniform"
            }
        });
        if (textures.length > 0) {
            for (let i = 0; i < textures.length; i++) { //  1-n texture bindings
                if (textures[i].type === 0) {
                    bindGroupLayoutEntries.push({
                        binding: 3 + i,
                        visibility: window.GPUShaderStage.COMPUTE,
                        texture: {
                            sampleType: "float"
                        }
                    });
                }
                else {
                    bindGroupLayoutEntries.push({
                        binding: 3 + i,
                        visibility: window.GPUShaderStage.COMPUTE,
                        externalTexture: {}
                    });
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
exports.ComputePassBuilder = ComputePassBuilder;
