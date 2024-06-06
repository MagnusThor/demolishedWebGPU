"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderPass = void 0;
class RenderPass {
    constructor(type, label, pipleline, uniforms, bindGroup, buffer, bufferView) {
        this.type = type;
        this.label = label;
        this.pipleline = pipleline;
        this.uniforms = uniforms;
        this.bindGroup = bindGroup;
        this.buffer = buffer;
        this.bufferView = bufferView;
    }
}
exports.RenderPass = RenderPass;
