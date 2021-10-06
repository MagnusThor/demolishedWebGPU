"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geometry = void 0;
class Geometry {
    constructor(device, vertices) {
        this.device = device;
        this.vertexBuffer = this.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
        this.vertexBuffer.unmap();
    }
    vertexBufferLayout(shaderLocation) {
        const vertexBufferLayout = {
            attributes: [{
                    shaderLocation: shaderLocation,
                    offset: 0,
                    format: 'float32x2'
                }],
            arrayStride: 32,
            stepMode: 'vertex'
        };
        return vertexBufferLayout;
    }
}
exports.Geometry = Geometry;
