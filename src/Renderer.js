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
exports.Renderer = void 0;
const Mesh_1 = require("./Mesh");
const TextureLoader_1 = require("./TextureLoader");
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.render = () => {
            this.draw(performance.now() / 1000);
            requestAnimationFrame(this.render);
        };
        this.textures = new Array();
    }
    getDevice(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = yield this.initializeAPI();
            if (device) {
                this.context = this.canvas.getContext('webgpu');
                const presentationFormat = this.context.getPreferredFormat(this.adapter);
                const canvasConfig = config || {
                    device: this.device,
                    format: presentationFormat,
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
                };
                this.context.configure(canvasConfig);
                return device;
            }
        });
    }
    initializeAPI() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const entry = navigator.gpu;
                if (!entry) {
                    throw "Cannot initalize WebGPU ";
                }
                this.adapter = yield entry.requestAdapter();
                this.device = yield this.adapter.requestDevice();
                this.queue = this.device.queue;
            }
            catch (e) {
                throw "Cannot initalize WebGPU ";
            }
            return this.device;
        });
    }
    updateCustomUniform(index, value) {
        this.mesh.uniformBufferArray.set(value, index);
    }
    initialize(geometry, material, texture, customUniforms) {
        return __awaiter(this, void 0, void 0, function* () {
            const dpr = devicePixelRatio || 1;
            const uniforms = new Float32Array([this.canvas.width * dpr, this.canvas.height * dpr, dpr, 0]);
            if (customUniforms) { // extend uniforms if custom is passed
                uniforms.set(uniforms, 4);
            }
            for (let i = 0; i < texture.length; i++) {
                this.textures.push(yield TextureLoader_1.TextureLoader.createTexture(this.device, texture[i]));
            }
            this.mesh = new Mesh_1.Mesh(this.device, geometry, material, uniforms, texture.length);
            this.renderPipeline = this.device.createRenderPipeline(this.mesh.pipelineDescriptor());
            const bindingGroupEntrys = [{
                    binding: 0,
                    resource: {
                        buffer: this.mesh.uniformBuffer
                    }
                }];
            // add a sampler if there is textures passed 
            if (this.textures.length > 0) {
                const sampler = this.device.createSampler({
                    addressModeU: 'repeat',
                    addressModeV: 'repeat',
                    magFilter: 'linear',
                    minFilter: 'nearest'
                });
                bindingGroupEntrys.push({
                    binding: 1,
                    resource: sampler
                });
            }
            this.textures.forEach((t, i) => {
                const entry = {
                    binding: i + 2,
                    resource: t.createView()
                };
                bindingGroupEntrys.push(entry);
            });
            this.bindingGroup = this.device.createBindGroup({
                layout: this.renderPipeline.getBindGroupLayout(0),
                entries: bindingGroupEntrys,
            });
        });
    }
    draw(time) {
        this.commandEncoder = this.device.createCommandEncoder();
        const clearColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 };
        const renderPassDescriptor = {
            colorAttachments: [{
                    loadValue: clearColor,
                    storeOp: 'store',
                    view: this.context.getCurrentTexture().createView()
                }]
        };
        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);
        this.mesh.uniformBufferArray.set([time], 3); // time    
        this.mesh.updateUniforms();
        passEncoder.setPipeline(this.renderPipeline);
        passEncoder.setVertexBuffer(0, this.mesh.geometry.vertexBuffer);
        passEncoder.setBindGroup(0, this.bindingGroup);
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.endPass();
        this.device.queue.submit([this.commandEncoder.finish()]);
    }
}
exports.Renderer = Renderer;