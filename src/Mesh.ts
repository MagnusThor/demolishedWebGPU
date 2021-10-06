import { Geometry } from "./Geometry";
import { Material } from "./Material";
export class Mesh {
    uniformBuffer: GPUBuffer;
    private bindGroupLayout: GPUBindGroupLayout;
    pipelineLayout: GPUPipelineLayout;
    constructor(public device: GPUDevice, public geometry: Geometry, public material: Material, public uniformBufferArray: Float32Array) {
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
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            this.uniformBufferArray.buffer,
            this.uniformBufferArray.byteOffset,
            this.uniformBufferArray.byteLength
        );
    }
    pipelineDescriptor(): GPURenderPipelineDescriptor {
        const pipelineDescriptor: GPURenderPipelineDescriptor = {
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
