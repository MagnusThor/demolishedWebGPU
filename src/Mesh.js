"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mesh = void 0;
class Mesh {
    constructor(device, geometry, material, textures) {
        this.device = device;
        this.geometry = geometry;
        this.material = material;
        const layoutEntrys = [
            {
                binding: 0,
                visibility: window.GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform"
                }
            }
        ];
        if (textures.length > 0) {
            layoutEntrys.push({
                binding: 1,
                visibility: window.GPUShaderStage.FRAGMENT,
                sampler: {
                    type: "filtering"
                }
            });
            for (let i = 0; i < textures.length; i++) {
                if (textures[i].type === 0) {
                    layoutEntrys.push({
                        binding: 2 + i,
                        visibility: window.GPUShaderStage.FRAGMENT,
                        texture: {
                            sampleType: "float"
                        }
                    });
                }
                else {
                    layoutEntrys.push({
                        binding: 2 + i,
                        visibility: window.GPUShaderStage.FRAGMENT,
                        externalTexture: {}
                    });
                }
            }
        }
        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: layoutEntrys
        });
        this.pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.bindGroupLayout],
        });
    }
    pipelineDescriptor() {
        const pipelineDescriptor = {
            vertex: {
                module: this.material.vertexShaderModule,
                entryPoint: this.material.shader.vertexEntryPoint || 'main_vertex',
                buffers: [this.geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: this.material.fragmentShaderModule,
                entryPoint: this.material.shader.fragmentEntryPoint || 'main_fragment',
                targets: [{
                        format: 'bgra8unorm'
                    }]
            },
            // depthStencil: {
            //     format: 'depth32float',
            //     depthWriteEnabled: true,
            //     depthCompare: 'less'
            // },
            primitive: {
                topology: 'triangle-list',
            },
            layout: this.pipelineLayout
        };
        return pipelineDescriptor;
    }
}
exports.Mesh = Mesh;
