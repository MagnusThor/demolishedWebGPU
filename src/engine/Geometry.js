"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geometry = exports.DefaultIndicies = exports.VERTEXType = void 0;
var VERTEXType;
(function (VERTEXType) {
    VERTEXType[VERTEXType["xyz"] = 3] = "xyz";
    VERTEXType[VERTEXType["xyzw"] = 4] = "xyzw";
    VERTEXType[VERTEXType["xyzrgba"] = 7] = "xyzrgba";
    VERTEXType[VERTEXType["xyzwrgba"] = 8] = "xyzwrgba";
})(VERTEXType || (exports.VERTEXType = VERTEXType = {}));
exports.DefaultIndicies = new Uint16Array([0, 1, 2, 3, 4, 5]);
// let createBuffer = (arr: Float32Array | Uint16Array, usage: number) => {
//     let desc = {
//         size: (arr.byteLength + 3) & ~3,
//         usage,
//         mappedAtCreation: true
//     };
//     let buffer = this.device.createBuffer(desc);
//     const writeArray =
//         arr instanceof Uint16Array
//             ? new Uint16Array(buffer.getMappedRange())
//             : new Float32Array(buffer.getMappedRange());
//     writeArray.set(arr);
//     buffer.unmap();
//     return buffer;
//};
class Geometry {
    createBuffer(arr, usage, vertexSize) {
        let desc = {
            size: (arr.byteLength + vertexSize) & ~vertexSize,
            usage,
            mappedAtCreation: true
        };
        let buffer = this.device.createBuffer(desc);
        const writeArray = arr instanceof Uint16Array
            ? new Uint16Array(buffer.getMappedRange())
            : new Float32Array(buffer.getMappedRange());
        writeArray.set(arr);
        buffer.unmap();
        return buffer;
    }
    constructor(device, model) {
        this.device = device;
        this.model = model;
        this.vertexBuffer = this.createBuffer(model.vertices, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, model.verticesType);
        this.indexBuffer = this.createBuffer(model.indicies, GPUBufferUsage.INDEX, 3);
        this.numOfVerticles = model.vertices.length / model.verticesType;
    }
    vertexBufferLayout(shaderLocation) {
        const vertexBufferLayout = {
            attributes: [{
                    shaderLocation: shaderLocation,
                    offset: 0,
                    format: 'float32x2'
                }],
            arrayStride: 4 * this.model.verticesType,
            stepMode: 'vertex'
        };
        return vertexBufferLayout;
    }
}
exports.Geometry = Geometry;
