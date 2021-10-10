import { Geometry } from "./Geometry";
import { Material } from "./Material";
import { Mesh } from "./Mesh";
import { ITexture, TextureLoader } from "./TextureLoader";

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

    textures: Array<GPUTexture>;

    constructor(public canvas: HTMLCanvasElement) {
        this.textures = new Array<GPUTexture>();
    }
    async getDevice(config?:GPUCanvasConfiguration): Promise<GPUDevice> {
        const device = await this.initializeAPI();
        if (device) {
            this.context = this.canvas.getContext('webgpu');
            const presentationFormat = this.context.getPreferredFormat(this.adapter);
            const canvasConfig: GPUCanvasConfiguration = config || {
                device: this.device,
                format: presentationFormat,// 'bgra8unorm',
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

    updateCustomUniform(index:number,value:Float32Array){
        this.mesh.uniformBufferArray.set(value,index)
    }
  
    async initialize(geometry:Geometry,material:Material,texture?:Array<ITexture>,customUniforms?:Float32Array): Promise<void> {


        const dpr = devicePixelRatio || 1;

        const uniforms = new Float32Array([this.canvas.width * dpr, this.canvas.height * dpr, dpr, 0]);

        if(customUniforms){ // extend uniforms if custom is passed
                uniforms.set(uniforms,4)
        }

        for(let i = 0 ; i < texture.length;i++){
            this.textures.push(await TextureLoader.createTexture(this.device,texture[i]));            
        }     
        
        this.mesh = new Mesh(this.device, geometry,material, uniforms,texture.length);

        this.renderPipeline = this.device.createRenderPipeline(this.mesh.pipelineDescriptor());

        const bindingGroupEntrys:Array<GPUBindGroupEntry> =  [{
            binding: 0,
            resource: {
                buffer: this.mesh.uniformBuffer
            }
        }];        

        // add a sampler if there is textures passed 
        if(this.textures.length >0){
            const sampler = this.device.createSampler({
                addressModeU: 'repeat',
                addressModeV: 'repeat',
                magFilter: 'linear',
                minFilter: 'nearest'
              });

            bindingGroupEntrys.push({
                binding:1,
                resource: sampler
            });
        }

        this.textures.forEach( (t,i) => {
            const entry:GPUBindGroupEntry = {
                    binding:i+2,
                    resource: t.createView()
            }
            bindingGroupEntrys.push(entry);     
        });

        this.bindingGroup = this.device.createBindGroup({
            layout: this.renderPipeline.getBindGroupLayout(0),
            entries:bindingGroupEntrys,
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
