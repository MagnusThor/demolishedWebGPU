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
    constructor(canvas, mainVertex, mainFragment) {
        this.canvas = canvas;
        if (mainVertex && mainFragment) {
            this.mainPipelineLayout = this.device.createPipelineLayout({
                bindGroupLayouts: [],
            });
            this.mainRenderPipeline = this.device.createRenderPipeline({
                layout: this.mainPipelineLayout,
                vertex: {
                    module: mainVertex
                },
                fragment: {
                    module: mainFragment,
                    entryPoint: 'main',
                    targets: [
                        { format: 'rgba8unorm' },
                    ],
                },
            });
        }
        ;
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
            // this.renderPipeline = this.device.createRenderPipeline(this.scene.getMesh().pipelineDescriptor());
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
            layout: this.scene.renderPipleline.getBindGroupLayout(0),
            entries: this.scene.getBindingGroupEntrys(),
        });
        this.commandEncoder = this.device.createCommandEncoder();
        this.context.getCurrentTexture().createView();
        const renderPassDescriptor = {
            colorAttachments: [{
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: this.scene.renderTargetView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                }]
        };
        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.scene.renderPipleline);
        passEncoder.setVertexBuffer(0, this.scene.getMesh().geometry.vertexBuffer);
        passEncoder.setBindGroup(0, this.bindingGroup);
        passEncoder.setIndexBuffer(this.scene.getMesh().geometry.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.scene.getMesh().geometry.numOfVerticles, 1);
        passEncoder.end();
        this.device.queue.submit([this.commandEncoder.finish()]);
        const textureView = this.context.getCurrentTexture().createView();
        const mainbindingGroup = this.device.createBindGroup({
            layout: this.mainRenderPipeline.getBindGroupLayout(0),
            entries: this.scene.getBindingGroupEntrys(),
        });
        const commandEncoderSecondPass = this.device.createCommandEncoder();
        // Begin the render pass for the second shader
        const renderPassDescriptorSecondPass = {
            colorAttachments: [{
                    loadOp: 'clear',
                    storeOp: 'store',
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }, // Adjust as needed
                }]
        };
        const passEncoderSecondPass = commandEncoderSecondPass.beginRenderPass(renderPassDescriptorSecondPass);
        passEncoderSecondPass.setPipeline(this.mainRenderPipeline); // Use the pipeline for the second shader
        passEncoderSecondPass.setVertexBuffer(0, this.scene.getMesh().geometry.vertexBuffer);
        passEncoderSecondPass.setBindGroup(0, mainbindingGroup); // Use the binding group for the second shader
        // Set other render pass settings and draw commands for the second shader as needed
        // End the render pass for the second shader
        passEncoderSecondPass.end();
        // Finish encoding commands for the second pass
        const commandBufferSecondPass = commandEncoderSecondPass.finish();
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
