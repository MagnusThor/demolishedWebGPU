"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyComputeShader = void 0;
class MyComputeShader {
    constructor(device, computeShaderCode) {
        this.device = device;
        this.shaderModule = this.device.createShaderModule({ code: computeShaderCode });
    }
}
exports.MyComputeShader = MyComputeShader;
