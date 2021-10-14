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
    frame: number;
    isPaused: any;

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
  
    async initialize(geometry:Geometry,material:Material,texture?:Array<ITexture>,customUniforms?:Float32Array,samplers?:Array<GPUSamplerDescriptor>): Promise<void> {
        const dpr = window.devicePixelRatio || 1;
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

        let textureBindingOffset = (samplers ? samplers.length : 0) 

        // add a default sampler if there is textures passed 
        if(this.textures.length >0 &&  !samplers){
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
            textureBindingOffset = 2;
        }else{
            
            samplers.forEach( (value,index) => {
                console.log(index);
                const sampler = this.device.createSampler(value);
                bindingGroupEntrys.push({
                    binding:index+1,
                    resource: sampler
                });
                textureBindingOffset++;
            });
        }



       console.log(textureBindingOffset,samplers);

        this.textures.forEach( (t,i) => {
            const entry:GPUBindGroupEntry = {
                    binding:i+textureBindingOffset,
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
        const clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                loadValue: clearColor,
                storeOp: 'store',
                view: this.context.getCurrentTexture().createView()
            }]
        };
        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);

       
        this.mesh.setUniforms([time],3) // time
        this.mesh.updateUniformBuffer();
       
        passEncoder.setPipeline(this.renderPipeline);
        passEncoder.setVertexBuffer(0, this.mesh.geometry.vertexBuffer);
        passEncoder.setBindGroup(0, this.bindingGroup);
        passEncoder.draw(6, 1, 0, 0);
        passEncoder.endPass();
        this.device.queue.submit([this.commandEncoder.finish()]);
    }
   

    start(t: number, maxFps: number = 200): void {
        let startTime = null;
        let frame = -1;
        const renderLoop = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            let segment = Math.floor((timestamp - startTime) / (1000 / maxFps));
            if (segment > frame) {
                frame = segment;
                this.frame = frame;
                this.draw(timestamp / 1000);
            }
            if(!this.isPaused)
                requestAnimationFrame(renderLoop);
        };
        renderLoop(t);
    }

    pause():void{
        this.isPaused = !this.isPaused
    }
    
}
