
import { rectGeometry } from "../../example/meshes/Rectangle";
import { Geometry } from "../Geometry";
import { Material } from "../Material";
import { IPass } from "./IPass";
import { PassBuilder } from "./PassBuilder";
import { Uniforms } from "./Uniforms";


export class ComputeRenderer {

    context: GPUCanvasContext;
    device: GPUDevice;

    computePassbacklog: Map<string, IPass>;

    renderTarget: GPUTexture;
    renderPipleline: GPURenderPipeline;
    renderSampler: GPUSampler;

    cumputePassBuilder: PassBuilder;

    frameCount: number;
    isPaused: any;

    screen_bind_group: GPUBindGroup;

    geometry: Geometry;

    // computeBuffer: GPUTexture;
    // computeBufferView: GPUTextureView;
    constructor(public canvas: HTMLCanvasElement
    ) {
        this.computePassbacklog = new Map<string, IPass>();
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
        this.cumputePassBuilder = new PassBuilder(device, this.canvas);
        this.device = device;
        this.context = context;

        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        };
        this.renderSampler = this.device.createSampler(samplerDescriptor);
        this.geometry = new Geometry(device,rectGeometry);

    }


    createRenderPipeline(uniformBuffer: GPUBuffer, material: Material): GPURenderPipeline {

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

        const computesPasses = Array.from(this.computePassbacklog.values());
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


    addRenderPass(material: Material) {
        let uniforms = new Uniforms(this.device, this.canvas);
        this.renderPipleline = this.createRenderPipeline(uniforms.uniformBuffer,
            material);

    }

    addComputeRenderPass(label: string, computeShaderCode: string) {
        const shaderModule =  this.device.createShaderModule(
            { code: computeShaderCode });
          
        const computePipeline = this.cumputePassBuilder.createComputePipeline(shaderModule);
        const uniforms = new Uniforms(this.device, this.canvas);

        const assets = this.createAssets();
        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];

        bindingGroupEntrys.push({
            binding: 0,
            resource: assets.bufferView
        });
        bindingGroupEntrys.push({
            binding: 1,
            resource: {
                buffer: uniforms.uniformBuffer
            }
        });
        const bindGroup = this.device.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: bindingGroupEntrys
        });
    
        this.computePassbacklog.set(label, {
            label: label,
            pipleline: computePipeline,
            uniforms: uniforms,
            bindGroup: bindGroup,
            buffer: assets.buffer,
            bufferView: assets.bufferView
        });

    }

    update(ts: number) {

        const encoder = this.device.createCommandEncoder();

        this.computePassbacklog.forEach(pass => {
            pass.uniforms.setUniforms([ts], 3);        
            pass.uniforms.updateUniformBuffer();
            const computePass = encoder.beginComputePass();
                computePass.setPipeline(pass.pipleline);
                computePass.setBindGroup(0, pass.bindGroup);
                computePass.dispatchWorkgroups(Math.floor((this.canvas.width + 7) / 8), Math.floor((this.canvas.height + 7) / 8), 1);
            computePass.end();
        });

        const renderpass: GPURenderPassEncoder = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.0, g: 0, b: 0.0, a: 1},
                loadOp: "clear",
                storeOp: "store"
            }]
        });

        renderpass.setPipeline(this.renderPipleline);
        renderpass.setVertexBuffer(0, this.geometry.vertexBuffer);
        renderpass.setBindGroup(0, this.screen_bind_group);
        renderpass.draw(6, 1, 0, 0);
        renderpass.end();

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
