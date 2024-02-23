"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeRenderer = void 0;
const Rectangle_1 = require("../../example/meshes/Rectangle");
const Geometry_1 = require("../Geometry");
const PassBuilder_1 = require("./PassBuilder");
const Uniforms_1 = require("./Uniforms");
class ComputeRenderer {
    // computeBuffer: GPUTexture;
    // computeBufferView: GPUTextureView;
    constructor(canvas) {
        this.canvas = canvas;
        this.computePassbacklog = new Map();
    }
    init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
            const hasBGRA8unormStorage = adapter.features.has('bgra8unorm-storage');
            const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice({
                requiredFeatures: hasBGRA8unormStorage
                    ? ['bgra8unorm-storage']
                    : [],
            }));
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
            this.cumputePassBuilder = new PassBuilder_1.PassBuilder(device, this.canvas);
            this.device = device;
            this.context = context;
            const samplerDescriptor = {
                addressModeU: "repeat",
                addressModeV: "repeat",
                magFilter: "linear",
                minFilter: "nearest",
                mipmapFilter: "nearest",
                maxAnisotropy: 1
            };
            this.renderSampler = this.device.createSampler(samplerDescriptor);
            this.geometry = new Geometry_1.Geometry(device, Rectangle_1.rectGeometry);
        });
    }
    createRenderPipeline(uniformBuffer, material) {
        const bindingGroupEntrys = [];
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
        const layout = new Array();
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
            layout.push({
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
        const pipelineDescriptor = {
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
    createAssets() {
        const buffer = this.device.createTexture({
            size: {
                width: this.canvas.width,
                height: this.canvas.height,
            },
            format: "bgra8unorm",
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        });
        return { buffer, bufferView: buffer.createView() };
    }
    createBuffer(arr, usage, vertexSize) {
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
    addRenderPass(material) {
        let uniforms = new Uniforms_1.Uniforms(this.device, this.canvas);
        this.renderPipleline = this.createRenderPipeline(uniforms.uniformBuffer, material);
    }
    addComputeRenderPass(label, computeShaderCode) {
        const shaderModule = this.device.createShaderModule({ code: computeShaderCode });
        const computePipeline = this.cumputePassBuilder.createComputePipeline(shaderModule);
        const uniforms = new Uniforms_1.Uniforms(this.device, this.canvas);
        const assets = this.createAssets();
        const bindingGroupEntrys = [];
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
    update(ts) {
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
        const renderpass = encoder.beginRenderPass({
            colorAttachments: [{
                    view: this.context.getCurrentTexture().createView(),
                    clearValue: { r: 0.0, g: 0, b: 0.0, a: 1 },
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
    start(t, maxFps = 200, onFrame) {
        let startTime = null;
        let frame = -1;
        const renderLoop = (ts) => {
            if (!startTime)
                startTime = ts;
            let segment = Math.floor((ts - startTime) / (1000 / maxFps));
            if (segment > frame) {
                frame = segment;
                this.frameCount = frame;
                if (!this.isPaused)
                    this.update(ts / 1000);
                if (onFrame)
                    onFrame(frame);
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop(t);
    }
    pause() {
        this.isPaused = !this.isPaused;
    }
}
exports.ComputeRenderer = ComputeRenderer;
