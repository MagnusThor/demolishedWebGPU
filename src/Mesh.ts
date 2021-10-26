import { ITexture } from "..";
import { Geometry } from "./Geometry";
import { Material } from "./Material";

export class Mesh {
 
    private bindGroupLayout: GPUBindGroupLayout;
    pipelineLayout: GPUPipelineLayout;
    constructor(public device: GPUDevice, public geometry: Geometry, public material: Material, textures?: Array<ITexture>) {


       const layoutEntrys: Array<GPUBindGroupLayoutEntry> = [
            { // uniforms is manadory
                binding: 0,
                visibility: window.GPUShaderStage.FRAGMENT,
                buffer: {
                    type: "uniform"
                }
            }
        ];
        if (textures.length > 0) {
            layoutEntrys.push({ // sampler
                binding: 1,
                visibility: window.GPUShaderStage.FRAGMENT,
                sampler: {
                    type: "filtering"
                }
            });
            for (let i = 0; i < textures.length; i++) {
                if(textures[i].type === 0){
                    layoutEntrys.push({ // 1-n texture bindings
                        binding: 2 + i,
                        visibility: window.GPUShaderStage.FRAGMENT,
                        texture: {
                            sampleType: "float"
                        }
                    })
                }else{
                    layoutEntrys.push({ // 1-n texture bindings
                        binding: 2 + i,
                        visibility: window.GPUShaderStage.FRAGMENT,
                        externalTexture:{ }
                    })
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
