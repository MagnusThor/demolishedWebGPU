import { Scene } from "./Scene";
 
export class Renderer {
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;
    context: GPUCanvasContext;
    pipeline: GPURenderPipeline;
    commandEncoder: GPUCommandEncoder;
    renderPipeline: GPURenderPipeline;


    frame: number;
    isPaused: boolean;
    scene: Scene;
    bindingGroup: GPUBindGroup;
    //uniforms: Float32Array;

    constructor(public canvas: HTMLCanvasElement) {
      //  this.textures = new Array<GPUTexture>();


    }
    async getDevice(config?:GPUCanvasConfiguration): Promise<GPUDevice> {

       
        const device = await this.initializeAPI();
        if (device) {
            this.context = this.canvas.getContext('webgpu');
            const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
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
            this.adapter = await entry.requestAdapter({
                powerPreference:"high-performance",
            });
            this.device = await this.adapter.requestDevice();
            this.queue = this.device.queue;
        } catch (e) {
            throw "Cannot initalize WebGPU ";
        }
        return this.device;
    }

    // updateCustomUniform(index:number,value:Float32Array){
    //     this.scene.mesh.uniformBufferArray.set(value,index)
    // }
  
    //async initialize(geometry:Geometry,material:Material,texture?:Array<ITexture>,customUniforms?:Float32Array,samplers?:Array<GPUSamplerDescriptor>): Promise<void> {
        
    async addScene(scene:Scene): Promise<void> {
        this.scene = scene;
        // if(scene.customUniforms){ // extend uniforms if custom is passeds
        //         uniforms.set(uniforms,4)
        // }        
      //  const mesh = scene.getMesh();
        this.renderPipeline = this.device.createRenderPipeline(this.scene.getMesh().pipelineDescriptor());
    }  
    draw(time: number) { 
        this.bindingGroup = this.device.createBindGroup({
            layout: this.renderPipeline.getBindGroupLayout(0),
            entries:this.scene.getBindingGroupEntrys(),
        });

        this.commandEncoder = this.device.createCommandEncoder();

        const textureView = this.context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                loadOp: 'clear',
                storeOp: 'store',
                view: textureView
            }]
        };

        this.scene.setUniforms([time],3) // time
        this.scene.updateUniformBuffer();      

        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);

        passEncoder.setPipeline(this.renderPipeline);
        passEncoder.setVertexBuffer(0, this.scene.getMesh().geometry.vertexBuffer);
        passEncoder.setBindGroup(0, this.bindingGroup);
        passEncoder.setIndexBuffer(this.scene.getMesh().geometry.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.scene.getMesh().geometry.numOfVerticles, 1);

        
        passEncoder.end();
        
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
                if(!this.isPaused)
                    this.draw(timestamp / 1000);
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop(t);
    }

    pause():void{
        this.isPaused = !this.isPaused
    }    
}
