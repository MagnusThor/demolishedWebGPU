/// <reference types="dist" />
export declare class Geometry {
    device: GPUDevice;
    vertices: Float32Array;
    vertexBuffer: GPUBuffer;
    numOfVerticles: number;
    constructor(device: GPUDevice, vertices: Float32Array);
    vertexBufferLayout(shaderLocation: number): GPUVertexBufferLayout;
}
