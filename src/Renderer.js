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
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
    }
    getDevice(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = yield this.initializeAPI();
            if (device) {
                this.context = this.canvas.getContext('webgpu');
                const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
                const canvasConfig = config || {
                    device: this.device,
                    format: presentationFormat, // 'bgra8unorm',
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
                this.adapter = yield entry.requestAdapter({
                    powerPreference: "high-performance",
                });
                this.device = yield this.adapter.requestDevice();
                this.queue = this.device.queue;
            }
            catch (e) {
                throw "Cannot initalize WebGPU ";
            }
            return this.device;
        });
    }
    addScene(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene = scene;
            this.renderPipeline = this.device.createRenderPipeline(this.scene.getMesh().pipelineDescriptor());
            this.textureView = this.context.getCurrentTexture().createView();
            let entities = this.scene.getBindingGroupEntrys();
            entities.push({
                binding: entities.length,
                resource: this.textureView,
            });
        });
    }
    draw(time) {
        this.scene.setUniforms([time], 3); // time
        this.scene.updateUniformBuffer();
        this.bindingGroup = this.device.createBindGroup({
            layout: this.renderPipeline.getBindGroupLayout(0),
            entries: this.scene.getBindingGroupEntrys(),
        });
        this.commandEncoder = this.device.createCommandEncoder();
        this.textureView = this.context.getCurrentTexture().createView();
        const renderPassDescriptor = {
            colorAttachments: [{
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: this.textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                }]
        };
        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.renderPipeline);
        passEncoder.setVertexBuffer(0, this.scene.getMesh().geometry.vertexBuffer);
        passEncoder.setBindGroup(0, this.bindingGroup);
        passEncoder.setIndexBuffer(this.scene.getMesh().geometry.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.scene.getMesh().geometry.numOfVerticles, 1);
        passEncoder.end();
        this.device.queue.submit([this.commandEncoder.finish()]);
    }
    start(t, maxFps = 200, onFrame) {
        let startTime = null;
        let lastFrameTime = null; // Track the timestamp of the previous frame
        this.frame = -1;
        const renderLoop = (ts) => {
            if (!startTime) {
                startTime = ts;
                lastFrameTime = ts;
            }
            const deltaTime = (ts - lastFrameTime);
            let segment = Math.floor((ts - startTime) / (1000 / maxFps));
            if (segment > this.frame) {
                this.frame = segment;
                if (!this.isPaused)
                    this.draw(ts / 1000);
                if (onFrame)
                    onFrame(this.frame, deltaTime); // Pass deltaTime to the callback
                this.scene.setUniforms([this.frame], 8);
            }
            lastFrameTime = ts; // Update lastFrameTime
            requestAnimationFrame(renderLoop);
        };
        renderLoop(t);
    }
    pause() {
        this.isPaused = !this.isPaused;
    }
}
exports.Renderer = Renderer;
