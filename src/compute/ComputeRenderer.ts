
import { rectGeometry } from "../../example/meshes/Rectangle";
import { Geometry, IGeometry } from "../Geometry";
import { IMaterialShader } from "../IMaterialShader";
import { ITexture } from "../ITexture";
import { Material } from "../Material";
import { ITextureData } from "../Scene";
import { TextureLoader } from "../TextureLoader";
import { IPass, RenderPass } from "./IPass";
import { ComputePassBuilder } from "./ComputePassBuilder";
import { Uniforms } from "./Uniforms";
//import { RenderPassBuilder } from "../RenderPassBuilder";


export class ComputeRenderer {

    context: GPUCanvasContext;
    device: GPUDevice;

    renderPassBacklog: Map<string, IPass>;

    renderTarget: GPUTexture;
    renderPipleline: GPURenderPipeline;
    // renderSampler: GPUSampler;

    renderPassBuilder: ComputePassBuilder;

    frameCount: number;
    isPaused: any;

    screen_bind_group: GPUBindGroup;

    geometry: Geometry;
    textures: Array<ITextureData>;
    //renderPassBuilder: RenderPassBuilder;

    // computeBuffer: GPUTexture;
    // computeBufferView: GPUTextureView;
    constructor(public canvas: HTMLCanvasElement
    ) {
        this.renderPassBacklog = new Map<string, IPass>();
        this.textures = new Array<ITextureData>();
    }

    async init() {

        const adapter = await navigator.gpu?.requestAdapter();
        const hasBGRA8unormStorage = adapter.features.has('bgra8unorm-storage');
        const device = await adapter?.requestDevice({
            requiredFeatures: hasBGRA8unormStorage
                ? ['bgra8unorm-storage']
                : [],
        });
        if (!device) {
            throw "need a browser that supports WebGPU";
        }

        const presentationFormat = hasBGRA8unormStorage
            ? navigator.gpu.getPreferredCanvasFormat()
            : 'rgba8unorm';

        const context = this.canvas.getContext("webgpu");

        context.configure({
            device,
            format: presentationFormat,
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.renderPassBuilder = new ComputePassBuilder(device, this.canvas);
        //    this.renderPassBuilder = new RenderPassBuilder(device,this.canvas);

        this.device = device;
        this.context = context;

        // const samplerDescriptor: GPUSamplerDescriptor = {
        //     addressModeU: "repeat",
        //     addressModeV: "repeat",
        //     magFilter: "linear",
        //     minFilter: "nearest",
        //     mipmapFilter: "nearest",
        //     maxAnisotropy: 1
        // };
        // this.renderSampler = this.device.createSampler(samplerDescriptor);
        this.geometry = new Geometry(device, rectGeometry);

    }


    creatRenderPipeline(uniformBuffer: GPUBuffer, material: Material): GPURenderPipeline {

        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];

        const sampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        bindingGroupEntrys.push({
            binding: 0,
            resource: sampler
        }, {
            binding: 1,
            resource: {
                buffer: uniformBuffer
            }
        });


        const layout = new Array<GPUBindGroupLayoutEntry>();

        layout.push({
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {}
        }, {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {
                type: "uniform"
            }
        });


        const pipleline_group_layout = this.device.createBindGroupLayout({
            entries: layout
        });


        const pipeline_layout = this.device.createPipelineLayout({
            bindGroupLayouts: [pipleline_group_layout]
        });

        const pipelineDescriptor: GPURenderPipelineDescriptor = {
            vertex: {
                module: material.vertexShaderModule,
                entryPoint: material.shader.vertexEntryPoint || 'main_vertex',
                buffers: [this.geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: material.fragmentShaderModule,
                entryPoint: material.shader.fragmentEntryPoint || 'main_fragment',
                targets: [{
                    format: 'bgra8unorm'
                }]
            },
            primitive: {
                topology: 'triangle-list',
            },
            layout: pipeline_layout
        };
        return this.device.createRenderPipeline(pipelineDescriptor);
    }

    createMainRenderPipeline(uniformBuffer: GPUBuffer, material: Material): GPURenderPipeline {

        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];

        const sampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        bindingGroupEntrys.push({
            binding: 0,
            resource: sampler
        }, {
            binding: 1,
            resource: {
                buffer: uniformBuffer
            }
        });

        const layout = new Array<GPUBindGroupLayoutEntry>();

        layout.push({
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {}
        }, {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {
                type: "uniform"
            }
        });

        const computesPasses = Array.from(this.renderPassBacklog.values());

        computesPasses.forEach((pass, i) => {
            bindingGroupEntrys.push({
                binding: 2 + i,
                resource: pass.bufferView
            });
            layout.push(
                {
                    binding: 2 + i,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                });

        });

        const screen_bind_group_layout = this.device.createBindGroupLayout({
            entries: layout
        });

        this.screen_bind_group = this.device.createBindGroup({
            layout: screen_bind_group_layout,
            entries: bindingGroupEntrys
        });

        const screen_pipeline_layout = this.device.createPipelineLayout({
            bindGroupLayouts: [screen_bind_group_layout]
        });


        const pipelineDescriptor: GPURenderPipelineDescriptor = {
            vertex: {
                module: material.vertexShaderModule,
                entryPoint: material.shader.vertexEntryPoint || 'main_vertex',
                buffers: [this.geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: material.fragmentShaderModule,
                entryPoint: material.shader.fragmentEntryPoint || 'main_fragment',
                targets: [{
                    format: 'bgra8unorm'
                }]
            },
            primitive: {
                topology: 'triangle-list',
            },
            layout: screen_pipeline_layout
        };

        return this.device.createRenderPipeline(pipelineDescriptor);

    }

    createAssets(): { buffer: GPUTexture; bufferView: GPUTextureView; } {
        const buffer = this.device.createTexture(
            {
                size: {
                    width: this.canvas.width,
                    height: this.canvas.height,
                },
                format: "bgra8unorm",
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
            }
        );
        return { buffer, bufferView: buffer.createView() };

    }

    createBuffer(arr: Float32Array | Uint16Array, usage: number, vertexSize: number) {
        let bufferDescriptor = {
            size: (arr.byteLength + vertexSize) & ~vertexSize,
            usage,
            mappedAtCreation: true
        };
        let buffer = this.device.createBuffer(bufferDescriptor);
        const writeArray = arr instanceof Uint16Array
            ? new Uint16Array(buffer.getMappedRange())
            : new Float32Array(buffer.getMappedRange());
        writeArray.set(arr);
        buffer.unmap();
        return buffer;
    }


    addMainPass(material: Material) {
        let uniforms = new Uniforms(this.device, this.canvas);
        this.renderPipleline = this.createMainRenderPipeline(uniforms.uniformBuffer,
            material);
    }

    async addRenderPass(label: string, material: Material, geometry: Geometry,
        textures?: Array<ITexture> | [], samplers?: Array<GPUSamplerDescriptor>
    ) {

        if (samplers) throw "Samplers not yet implememted, using default binding 2"



        const uniforms = new Uniforms(this.device, this.canvas);

        if (textures) {
            for (let i = 0; i < textures.length; i++) {
                const texture = textures[i];
                if (texture.type == 0) {
                    this.textures.push({ type: 0, data: await TextureLoader.createImageTexture(this.device, texture) });
                } else
                    this.textures.push({ type: 1, data: await TextureLoader.createVideoTextue(this.device, texture) });
            }
        }

        const renderPipeline = this.renderPassBuilder.createRenderPipeline(material, geometry,
            this.textures);

        const assets = this.createAssets();
        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];

        const sampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        /*
{
            binding: 0,
            resource: assets.bufferView
        }
        */

        bindingGroupEntrys.push({
            binding: 0,
            resource: {
                buffer: uniforms.uniformBuffer
            }
        }, {
            binding: 1,
            resource: sampler
        }

        );
        // add the bindings for the textures and samplers.

        const offset = bindingGroupEntrys.length;

        this.textures.forEach((t, i) => {
            let entry: GPUBindGroupEntry;
            if (t.type === 0) {
                entry = {
                    binding: i + offset,
                    resource: (t.data as GPUTexture).createView()
                }
            } else {
                entry = {
                    binding: i + 2,
                    resource: this.device.importExternalTexture({ source: t.data as HTMLVideoElement }),
                };
            }
            bindingGroupEntrys.push(entry);
        });

        const bindGroup = this.device.createBindGroup({
            layout: renderPipeline.getBindGroupLayout(0),
            entries: bindingGroupEntrys,
            label: `${label} renderpass`
        });



        const renderPass = new RenderPass(
            1, label, renderPipeline, uniforms, bindGroup, assets.buffer, assets.bufferView
        );

        this.renderPassBacklog.set(label, renderPass);
    }



    async addComputeRenderPass(label: string, computeShaderCode: string,
        textures?: Array<ITexture>, samplers?: Array<GPUSamplerDescriptor>
    ) {

        if (samplers) throw "Samplers not yet implememted, using default binding 2"

        const shaderModule = this.device.createShaderModule(
            { code: computeShaderCode });

        const uniforms = new Uniforms(this.device, this.canvas);

        for (let i = 0; i < textures.length; i++) {
            const texture = textures[i];
            if (texture.type == 0) {
                this.textures.push({ type: 0, data: await TextureLoader.createImageTexture(this.device, texture) });
            } else
                this.textures.push({ type: 1, data: await TextureLoader.createVideoTextue(this.device, texture) });
        }

        const computePipeline = this.renderPassBuilder.createComputePipeline(shaderModule,
            this.textures);

        const assets = this.createAssets();
        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];

        const sampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        bindingGroupEntrys.push({
            binding: 0,
            resource: assets.bufferView
        }, {
            binding: 1,
            resource: {
                buffer: uniforms.uniformBuffer
            }
        }

        );

        const offset = bindingGroupEntrys.length;

        this.textures.forEach((t, i) => {
            let entry: GPUBindGroupEntry;
            if (t.type === 0) {
                entry = {
                    binding: i + offset,
                    resource: (t.data as GPUTexture).createView()
                }
            } else {
                entry = {
                    binding: i + 2,
                    resource: this.device.importExternalTexture({ source: t.data as HTMLVideoElement }),
                };
            }
            bindingGroupEntrys.push(entry);
        });

        const bindGroup = this.device.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: bindingGroupEntrys
        });

        const renderPass = new RenderPass(
            0, label, computePipeline, uniforms, bindGroup, assets.buffer, assets.bufferView
        );

        console.log("adding a computeRender pass", label);

        this.renderPassBacklog.set(label, renderPass);
    }

    update(ts: number) {

        const encoder = this.device.createCommandEncoder();
        const arrRenderPasses = Array.from(this.renderPassBacklog.values());
        // get the compute shaders from the back log
        arrRenderPasses.filter((pre) => {
            return pre.type == 0
        }).forEach(pass => {
                pass.uniforms.setUniforms([ts], 3);
                pass.uniforms.updateUniformBuffer();
                const computePass = encoder.beginComputePass();
                computePass.setPipeline(pass.pipleline as GPUComputePipeline);
                computePass.setBindGroup(0, pass.bindGroup);
                computePass.dispatchWorkgroups(Math.floor((this.canvas.width + 7) / 8), Math.floor((this.canvas.height + 7) / 8), 1);
                computePass.end();
            });

        arrRenderPasses.filter(pre => {
            return pre.type == 1
        }).forEach(pass => {
            const renderPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: pass.bufferView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                }]
            };
            pass.uniforms.setUniforms([ts], 3);
            pass.uniforms.updateUniformBuffer();
            const renderPass = encoder.beginRenderPass(renderPassDescriptor);
            renderPass.setPipeline(pass.pipleline as GPURenderPipeline)
            renderPass.setBindGroup(0, pass.bindGroup);
            renderPass.setVertexBuffer(0, this.geometry.vertexBuffer);
            renderPass.setIndexBuffer(this.geometry.indexBuffer, 'uint16');
            renderPass.drawIndexed(this.geometry.numOfVerticles, 1);
            renderPass.end();

        });


        const mainRenderer: GPURenderPassEncoder = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.0, g: 0, b: 0.0, a: 1 },
                loadOp: "clear",
                storeOp: "store"
            }]
        });

        mainRenderer.setPipeline(this.renderPipleline);
        mainRenderer.setVertexBuffer(0, this.geometry.vertexBuffer);
        mainRenderer.setBindGroup(0, this.screen_bind_group);
        mainRenderer.draw(6, 1, 0, 0);
        mainRenderer.end();

        this.device.queue.submit([encoder.finish()]);

    }

    start(t: number, maxFps: number = 200, onFrame?: (frame: number) => void): void {
        let startTime = null;
        let frame = -1;
        const renderLoop = (ts: number) => {
            if (!startTime) startTime = ts;
            let segment = Math.floor((ts - startTime) / (1000 / maxFps));
            if (segment > frame) {
                frame = segment;
                this.frameCount = frame;
                if (!this.isPaused)
                    this.update(ts / 1000);
                if (onFrame) onFrame(frame);
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop(t);
    }
    pause(): void {
        this.isPaused = !this.isPaused;
    }
}
