export class Helpers {


}


const computeShaderCode = /* glsl */ ` 

        struct Uniforms {
            resolution: vec3<f32>,
            time: f32
        };

        @group(0) @binding(0) var outputTexture: texture_storage_2d<bgra8unorm, write>;
        @group(0) @binding(1) var<uniform> uniforms: Uniforms;
       
      @compute @workgroup_size(1) fn main(
        @builtin(global_invocation_id) id : vec3u
      )  {
        
        let size = textureDimensions(tex);

        let center = vec2f(size) / 2.0;
        let pos = id.xy;
        
        let dist = distance(vec2f(pos), center);
        let stripe = dist / 32.0 % 2.0;
        let red = vec4f(1, 0, 0, 1);
        let cyan = vec4f(0, 1, 1, 1);

        let color = select(red, cyan, stripe < 1.0);

        textureStore(outputTexture, pos, color);
      }
    `;
    

export interface IPassBuilder {
    pipelineLayout: GPUPipelineLayout;
    bindGroupLayout: GPUBindGroupLayout;
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
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,
        });
        this.uniformBufferArray = new Float32Array([canvas.width,canvas.height, 0, 1.0]);

        console.log(this.uniformBufferArray);

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
    bindGroupLayout: GPUBindGroupLayout;
    device: GPUDevice;



    constructor(device: GPUDevice,public canvas: HTMLCanvasElement) {
        super(device);
        this.device = device;
        
    }

  
    createComputePipeline(computeShader: IMyShaderModule): GPUComputePipeline {


        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
              { binding: 0, 
                visibility: GPUShaderStage.COMPUTE,
                storageTexture: {                
                    format: "bgra8unorm",
                  },
                },

                { binding: 1, visibility: GPUShaderStage.COMPUTE, 
                    buffer: {
                        type: "uniform"
                    }
                }
             
            ],
          });

/*
 { binding: 1, visibility: GPUShaderStage.COMPUTE, 
                },
*/
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
    pipleline: GPUComputePipeline
    uniforms: Uniforms
}

export class MyRenderer {
    context: GPUCanvasContext;
    device: GPUDevice;
    passBacklog: Map<number, IPass>;
    renderTarget: GPUTexture;
    renderPipleline: GPURenderPipeline;
    constructor(public canvas: HTMLCanvasElement) {
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

        console.log(presentationFormat);


        context.configure({
            device,
            format:presentationFormat,
            usage: GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.STORAGE_BINDING,
        });

        const passBuilder = new PassBuilder(device,this.canvas);

        const shaderModule = new MyComputeShader(device, computeShaderCode)

        const computePipeline = passBuilder.createComputePipeline(shaderModule);
               
        this.passBacklog.set(0, {
            pipleline: computePipeline,
            uniforms: new Uniforms(device,this.canvas)
           
        });

        this.context = context;
        this.device = device;

    }

    update(ts: number) {
    
        const texture = this.context.getCurrentTexture();
        const item = this.passBacklog.get(0);      
        const pipleline = item.pipleline;

        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];
        bindingGroupEntrys.push({ binding: 0, resource: texture.createView()},      )
        bindingGroupEntrys.push({
            binding: 1,
            resource: {
                buffer:item.uniforms.uniformBuffer 
            }
        });

        const bindGroup = this.device.createBindGroup({
            layout: pipleline.getBindGroupLayout(0),
            entries:bindingGroupEntrys
          });
        
            const encoder = this.device.createCommandEncoder({ label: 'our encoder' });
            const pass = encoder.beginComputePass();
            pass.setPipeline(pipleline);
            pass.setBindGroup(0, bindGroup);
            pass.dispatchWorkgroups(texture.width, texture.height);
            pass.end();

            const commandBuffer = encoder.finish();
            this.device.queue.submit([commandBuffer]);

    }

}