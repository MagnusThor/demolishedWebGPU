/// <reference types="dist" />
import { Geometry } from "./Geometry";
import { Material } from "./Material";
export declare class Mesh {
    device: GPUDevice;
    geometry: Geometry;
    material: Material;
    uniformBufferArray: Float32Array;
    uniformBuffer: GPUBuffer;
    private bindGroupLayout;
    pipelineLayout: GPUPipelineLayout;
    constructor(device: GPUDevice, geometry: Geometry, material: Material, uniformBufferArray: Float32Array, numOfTextures?: number);
    setDimensions(width: number, height: number, dpr?: number): void;
    updateUniforms(): void;
    pipelineDescriptor(): GPURenderPipelineDescriptor;
}
