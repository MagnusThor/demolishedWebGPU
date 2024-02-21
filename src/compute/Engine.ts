import { Geometry } from "../Geometry";
import { Material } from "../Material";

export interface IPassBuilder {
    pipelineLayout: GPUPipelineLayout;
    bindGroup: GPUBindGroup;
    device: GPUDevice;
}

export interface IMyShaderModule {
    shaderModule: GPUShaderModule
}

export class PassBase {
    constructor(device: GPUDevice) {
    }
}


export class Uniforms {

    uniformBufferArray: Float32Array;
    uniformBuffer: GPUBuffer;

    constructor(public device: GPUDevice,canvas: HTMLCanvasElement){
        this.uniformBuffer = this.device.createBuffer({
            size: 40,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.uniformBufferArray = new Float32Array([canvas.width,canvas.height, 0, 1.0]);

    }

    bindingGroupEntry(index: number):GPUBindGroupEntry{
        return { binding: 1, resource: {buffer: this.uniformBuffer}}
    }

    setUniforms(values: ArrayLike<number>, offset: number) {
        this.uniformBufferArray.set(values, offset); // time 
    }
    updateUniformBuffer() {
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            this.uniformBufferArray.buffer,
            this.uniformBufferArray.byteOffset,
            this.uniformBufferArray.byteLength
        );
    }
}


export class PassBuilder extends PassBase implements IPassBuilder {

    pipelineLayout: GPUPipelineLayout;
   
    device: GPUDevice;
    constructor(device: GPUDevice,public canvas: HTMLCanvasElement) {
        super(device);
        this.device = device;        
    }
    bindGroup: GPUBindGroup;


    getRenderPiplelineBindingGroupLayout(
        uniformBuffer:GPUBuffer,sampler?:GPUSampler
        ):Array<GPUBindGroupEntry>{

        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];
        bindingGroupEntrys.push({
            binding: 0,
            resource: {
                buffer: uniformBuffer
            }
        });
        
        // todo: cache the samplers passed + default sampler ( linearSampler)
        const defaultSampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });

        // add the GPUSampler
        bindingGroupEntrys.push({
            binding: 1,
            resource: sampler || defaultSampler 
        });

        return bindingGroupEntrys;
    

    }

    
     createComputePipeline(computeShader: IMyShaderModule): GPUComputePipeline {

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
              { binding: 0, 
                visibility: GPUShaderStage.COMPUTE,                
                storageTexture: {     
                    access: "write-only",
                    format: "bgra8unorm",           
                    viewDimension: "2d"
                  },
                },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, 
                    buffer: {
                        type: "uniform"
                    }
                }             
            ],
          });
        const pipeline = this.device.createComputePipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout],
              }),
            compute: {
                module: computeShader.shaderModule,
                entryPoint: 'main',
            },
        });
        return pipeline;
    }
}


export class MyComputeShader {
    public shaderModule: GPUShaderModule;
    constructor(public device: GPUDevice, computeShaderCode: string) {
        this.shaderModule = this.device.createShaderModule(
            { code: computeShaderCode });
    }
}

export interface IPass {
    label:string
    pipleline: GPUComputePipeline
    uniforms: Uniforms
    bindGroup :GPUBindGroup 
}

export class MyRenderer {

    context: GPUCanvasContext;
    device: GPUDevice;
    passBacklog: Map<number, IPass>;
    renderTarget: GPUTexture;
    renderPipleline: GPURenderPipeline;
    passBuilder: PassBuilder;
    frame: number;
    isPaused: any;
    screen_bind_group: GPUBindGroup;
    geometry: Geometry;
    constructor(public canvas: HTMLCanvasElement,
        ) {
        this.passBacklog = new Map<number, IPass>();
    }

    async init() {

        const adapter = await navigator.gpu?.requestAdapter();
        const hasBGRA8unormStorage = adapter.features.has('bgra8unorm-storage');
        const device = await adapter?.requestDevice({
          requiredFeatures: hasBGRA8unormStorage
            ? ['bgra8unorm-storage']
            : [],
        });
        if (!device) {
          throw "need a browser that supports WebGPU";
        }
      
        const presentationFormat = hasBGRA8unormStorage
        ? navigator.gpu.getPreferredCanvasFormat()
        : 'rgba8unorm';

        const context = this.canvas.getContext("webgpu");
 
        context.configure({
            device,
            format:presentationFormat,
            usage: GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.passBuilder = new PassBuilder(device,this.canvas);
        this.context = context;
        this.device = device;

        this.createAssets();
    }

    computeBuffer: GPUTexture;
    compueBufferView: GPUTextureView;
    sampler: GPUSampler;


    createRenderPipeline(uniformBuffer:GPUBuffer,
        material:Material,geometry:Geometry        
        ):GPURenderPipeline{

        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];
        bindingGroupEntrys.push({
            binding: 0,
            resource: {
                buffer: uniformBuffer
            }
        });       
        const sampler = this.device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest'
        });        
        // add the GPUSampler
        bindingGroupEntrys.push({
            binding: 1,
            resource: sampler
        });

        bindingGroupEntrys.push(
            {
                binding: 1,
                resource: this.compueBufferView
            }
        )
        
        const screen_bind_group_layout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: "uniform"
                    }
                },
            ]
        });

        this.screen_bind_group = this.device.createBindGroup({
            layout: screen_bind_group_layout,
            entries: [
                {
                    binding: 0,
                    resource:  this.sampler
                },
                {
                    binding: 1,
                    resource: this.compueBufferView
                },
                {
                    binding:2,
                    resource: {
                        buffer: uniformBuffer
                    } 
                }
            ]
        });
        

        const screen_pipeline_layout = this.device.createPipelineLayout({
            bindGroupLayouts: [screen_bind_group_layout]
        });

        const pipelineDescriptor: GPURenderPipelineDescriptor = {
            vertex: {
                module: material.vertexShaderModule,
                entryPoint: material.shader.vertexEntryPoint || 'main_vertex',
                buffers: [geometry.vertexBufferLayout(0)]
            },
            fragment: {
                module: material.fragmentShaderModule,
                entryPoint: material.shader.fragmentEntryPoint || 'main_fragment',
                targets: [{
                    format: 'bgra8unorm'
                }]
            },
          
            primitive: {
                topology: 'triangle-list',
            },
            layout: screen_pipeline_layout
        };    
        return this.device.createRenderPipeline(pipelineDescriptor);
    }


    createAssets(){
        this.computeBuffer = this.device.createTexture(
            {
                size: {
                    width: this.canvas.width,
                    height: this.canvas.height,
                },
                format: "bgra8unorm",
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
            }
        );

        
        this.compueBufferView = this.computeBuffer.createView();
        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        };
        this.sampler = this.device.createSampler(samplerDescriptor);
    }

    addRenderPass(material:Material,geometry:Geometry){
            // set up the renderpipleline
            let uniforms = new Uniforms(this.device,this.canvas);
            this.renderPipleline = this.createRenderPipeline(uniforms.uniformBuffer,
             material,geometry);

             this.geometry = geometry;


            
    }

    addComputePass(label:string,compteShaderCode:string){
        const shaderModule = new MyComputeShader(this.device, compteShaderCode)
        const computePipeline = this.passBuilder.createComputePipeline(shaderModule);
        const uniforms  = new Uniforms(this.device,this.canvas)
        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];
        bindingGroupEntrys.push({ binding: 0, 
            resource: 
            this.compueBufferView
        });
        bindingGroupEntrys.push({
            binding: 1,
            resource: {
                buffer: uniforms.uniformBuffer
            }
        });
        

        const bindGroup = this.device.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: bindingGroupEntrys
          });

        this.passBacklog.set(0, {
            label: label,
            pipleline: computePipeline,
            uniforms: new Uniforms(this.device,this.canvas),
            bindGroup:bindGroup
        });

     

    }

    update(ts: number) {
    
             const pass = this.passBacklog.get(0);      

            pass.uniforms.setUniforms([ts],3) // time        
            pass.uniforms.updateUniformBuffer();
        
            const encoder = this.device.createCommandEncoder({ label: `Ecoder for ${pass.label} ` });
            const computePass = encoder.beginComputePass();
            computePass.setPipeline(pass.pipleline);
            computePass.setBindGroup(0, pass.bindGroup);

            computePass.dispatchWorkgroups( Math.floor((this.canvas.width + 7) / 8),  Math.floor((this.canvas.height + 7) / 8),1);
            computePass.end();

            
        const textureView : GPUTextureView = this.context.getCurrentTexture().createView();
        
        const renderpass : GPURenderPassEncoder = encoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {r: 0.5, g: 0.0, b: 0.25, a: 1.0},
                loadOp: "clear",
                storeOp: "store"
            }]
        });
    
        renderpass.setPipeline(this.renderPipleline);
        renderpass.setVertexBuffer(0, this.geometry.vertexBuffer);
        renderpass.setBindGroup(0, this.screen_bind_group);
        renderpass.setIndexBuffer(this.geometry.indexBuffer, 'uint16');
        renderpass.drawIndexed(this.geometry.numOfVerticles, 1);
       
        renderpass.end();

        this.device.queue.submit([ encoder.finish()]);

        

    }

    start(t: number, maxFps: number = 200,onFrame?:(frame:number)=> void): void {
        let startTime = null;
        let frame = -1;
        const renderLoop = (ts: number) => {
            if (!startTime) startTime = ts;
            let segment = Math.floor((ts - startTime) / (1000 / maxFps));
            if (segment > frame) {
                frame = segment;
                this.frame = frame;
                if(!this.isPaused)
                    this.update(ts / 1000);
                if(onFrame) onFrame(frame);
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop(t);
    }
    pause():void{
        this.isPaused = !this.isPaused
    }    
}