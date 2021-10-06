"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mesh = void 0;
class Mesh {
    constructor(device, geometry, material, uniformBufferArray) {
        this.device = device;
        this.geometry = geometry;
        this.material = material;
        this.uniformBufferArray = uniformBufferArray;
        this.uniformBuffer = this.device.createBuffer({
            size: 20,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,
        });
        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: [{
                    binding: 0,
                    visibility: window.GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform"
                    }
                },
            ],
        });
        this.pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.bindGroupLayout],
        });
    }
    updateUniforms() {
        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformBufferArray.buffer, this.uniformBufferArray.byteOffset, this.uniformBufferArray.byteLength);
    }
    pipelineDescriptor() {
        const pipelineDescriptor = {
            vertex: {
                module: this.material.shaderModule,
                entryPoint: 'main_vertex',
                buffers: [this.geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: this.material.shaderModule,
                entryPoint: 'main_fragment',
                targets: [{
                        format: 'bgra8unorm'
                    }]
            },
            primitive: {
                topology: 'triangle-list',
            },
            layout: this.pipelineLayout
        };
        return pipelineDescriptor;
    }
}
exports.Mesh = Mesh;
