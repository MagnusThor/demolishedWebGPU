"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uniforms = void 0;
class Uniforms {
    static initialize(w, h) {
        return new Float32Array([w, h, 0, 1, 0, 0, 0, 0, 0, 0]);
    }
    constructor(device, canvas) {
        this.device = device;
        this.uniformBuffer = this.device.createBuffer({
            size: 60,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.uniformBufferArray = new Float32Array([canvas.width, canvas.height, 0, 1, 0, 0, 0, 0, 0, 0]);
    }
    setUniforms(values, offset) {
        this.uniformBufferArray.set(values, offset); // time 
    }
    updateUniformBuffer() {
        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformBufferArray.buffer, this.uniformBufferArray.byteOffset, this.uniformBufferArray.byteLength);
    }
}
exports.Uniforms = Uniforms;
