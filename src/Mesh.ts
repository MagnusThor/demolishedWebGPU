import { Geometry } from "./Geometry";
import { Material } from "./Material";
export class Mesh {
    uniformBuffer: GPUBuffer;
    private bindGroupLayout: GPUBindGroupLayout;
    pipelineLayout: GPUPipelineLayout;
    constructor(public device: GPUDevice, public geometry: Geometry, public material: Material, public uniformBufferArray: Float32Array, numOfTextures: number = 0) {

        this.uniformBuffer = this.device.createBuffer({
            size: 20,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,
        });

        const layoutEntrys: Array<GPUBindGroupLayoutEntry> = [
            { // uniforms is manadory
                binding: 0,
                visibility: window.GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform"
                }
            }
        ];
        if (numOfTextures > 0) {
            layoutEntrys.push({ // sampler
                binding: 1,
                visibility: window.GPUShaderStage.FRAGMENT,
                sampler: {
                    type: "filtering"
                }
            });
            for (let i = 0; i < numOfTextures; i++) {
                layoutEntrys.push({ // 1-n texture bindings
                    binding: 2 + i,
                    visibility: window.GPUShaderStage.FRAGMENT,
                    texture: {
                        sampleType: "float"
                    }
                })
            }
        }

        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: layoutEntrys
        });

        this.pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.bindGroupLayout],
        });
    }
    setDimensions(width: number, height: number, dpr: number = 0): void {
        this.uniformBufferArray.set([width, height, dpr], 0);
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
