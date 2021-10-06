"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Material = void 0;
class Material {
    constructor(device, wglsl) {
        this.device = device;
        this.shaderModule = this.device.createShaderModule({
            code: wglsl
        });
    }
}
exports.Material = Material;
