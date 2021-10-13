/// <reference types="dist" />
import { Geometry } from "./Geometry";
import { Material } from "./Material";
import { Mesh } from "./Mesh";
import { ITexture } from "./TextureLoader";
export declare class Renderer {
    canvas: HTMLCanvasElement;
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;
    context: GPUCanvasContext;
    pipeline: GPURenderPipeline;
    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    renderPipeline: GPURenderPipeline;
    bindingGroup: GPUBindGroup;
    geometry: Geometry;
    material: Material;
    mesh: Mesh;
    textures: Array<GPUTexture>;
    constructor(canvas: HTMLCanvasElement);
    getDevice(config?: GPUCanvasConfiguration): Promise<GPUDevice>;
    initializeAPI(): Promise<GPUDevice>;
    updateCustomUniform(index: number, value: Float32Array): void;
    initialize(geometry: Geometry, material: Material, texture?: Array<ITexture>, customUniforms?: Float32Array): Promise<void>;
    draw(time: number): void;
    render: () => void;
    start(startTime: number): void;
    stop(): void;
}
