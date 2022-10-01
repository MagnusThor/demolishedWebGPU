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
    //uniforms: Float32Array;
    constructor(canvas) {
        //  this.textures = new Array<GPUTexture>();
        this.canvas = canvas;
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
    // updateCustomUniform(index:number,value:Float32Array){
    //     this.scene.mesh.uniformBufferArray.set(value,index)
    // }
    //async initialize(geometry:Geometry,material:Material,texture?:Array<ITexture>,customUniforms?:Float32Array,samplers?:Array<GPUSamplerDescriptor>): Promise<void> {
    addScene(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene = scene;
            // if(scene.customUniforms){ // extend uniforms if custom is passeds
            //         uniforms.set(uniforms,4)
            // }        
            //  const mesh = scene.getMesh();
            this.renderPipeline = this.device.createRenderPipeline(this.scene.getMesh().pipelineDescriptor());
        });
    }
    draw(time) {
        this.bindingGroup = this.device.createBindGroup({
            layout: this.renderPipeline.getBindGroupLayout(0),
            entries: this.scene.getBindingGroupEntrys(),
        });
        this.commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();
        const clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };
        const renderPassDescriptor = {
            colorAttachments: [{
                    loadValue: clearColor,
                    storeOp: 'store',
                    view: textureView
                }]
        };
        this.scene.setUniforms([time], 3); // time
        this.scene.updateUniformBuffer();
        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.renderPipeline);
        passEncoder.setVertexBuffer(0, this.scene.getMesh().geometry.vertexBuffer);
        passEncoder.setBindGroup(0, this.bindingGroup);
        passEncoder.setIndexBuffer(this.scene.getMesh().geometry.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.scene.getMesh().geometry.numOfVerticles, 1);
        //passEncoder.draw(6, 1, 0, 0);
        passEncoder.endPass();
        this.device.queue.submit([this.commandEncoder.finish()]);
    }
    start(t, maxFps = 200) {
        let startTime = null;
        let frame = -1;
        const renderLoop = (timestamp) => {
            if (!startTime)
                startTime = timestamp;
            let segment = Math.floor((timestamp - startTime) / (1000 / maxFps));
            if (segment > frame) {
                frame = segment;
                this.frame = frame;
                if (!this.isPaused)
                    this.draw(timestamp / 1000);
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop(t);
    }
    pause() {
        this.isPaused = !this.isPaused;
    }
}
exports.Renderer = Renderer;
