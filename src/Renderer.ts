import { Geometry } from "./Geometry";
import { Material } from "./Material";
import { Mesh } from "./Mesh";

export class Renderer {
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

    constructor(public canvas: HTMLCanvasElement) {
    }
    async getDevice(): Promise<GPUDevice> {
        const device = await this.initializeAPI();
        if (device) {
            this.context = this.canvas.getContext('webgpu');
            const canvasConfig: GPUCanvasConfiguration = {
                device: this.device,
                format: 'bgra8unorm',
                usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
            };
            this.context.configure(canvasConfig);
            return device;
        }
    }
    async initializeAPI(): Promise<GPUDevice> {
        try {
            const entry: GPU = navigator.gpu;
            if (!entry) {
                throw "Cannot initalize WebGPU ";
            }
            this.adapter = await entry.requestAdapter();
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.queue;
        } catch (e) {

            throw "Cannot initalize WebGPU ";
        }
        return this.device;
    }
  
    async initialize(geometry:Geometry,material:Material,uniforms:Float32Array): Promise<void> {
        this.mesh = new Mesh(this.device, geometry,material, uniforms);
        this.renderPipeline = this.device.createRenderPipeline(this.mesh.pipelineDescriptor());
        this.bindingGroup = this.device.createBindGroup({
            layout: this.renderPipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.mesh.uniformBuffer
                }
            }],
        });
    }  
    draw(time: number) {
        this.commandEncoder = this.device.createCommandEncoder();
        const clearColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 };
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                loadValue: clearColor,
                storeOp: 'store',
                view: this.context.getCurrentTexture().createView()
            }]
        };
        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);
        this.mesh.uniformBufferArray.set([time], 3); // time    
        this.mesh.updateUniforms();
        passEncoder.setPipeline(this.renderPipeline);
        passEncoder.setVertexBuffer(0, this.mesh.geometry.vertexBuffer);
        passEncoder.setBindGroup(0, this.bindingGroup);

        passEncoder.draw(6, 1, 0, 0);
        passEncoder.endPass();
        this.device.queue.submit([this.commandEncoder.finish()]);
    }

    render = () => {
        this.draw(performance.now() / 1000);
        requestAnimationFrame(this.render);
    };
}
