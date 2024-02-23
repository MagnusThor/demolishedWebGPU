// import { Geometry } from "./Geometry";
// import { ITexture } from "./ITexture";
// import { Material } from "./Material";

// export class RenderPipeline implements IPipeline{
//         pipeline: GPURenderPipeline;
//         pipelineLayout: GPUPipelineLayout;
//         bindGroupLayout: GPUBindGroupLayout;
//         commandEncoder: GPUCommandEncoder;

//         constructor(public device:GPUDevice, 
//                 public geometry: Geometry, public material: Material, public textures?: Array<ITexture>){

//         }
//         draw(ts:number): void {
          

//             this.bindingGroup = this.device.createBindGroup({
//             layout: this.foo(),
//             entries:this.scene.getBindingGroupEntrys(),
//             label:"renderer"
//         });
        
//         this.commandEncoder = this.device.createCommandEncoder();

//         const textureView = this.context.getCurrentTexture().createView();

//         const renderPassDescriptor: GPURenderPassDescriptor = {
//             colorAttachments: [{
//                 loadOp: 'clear',
//                 storeOp: 'store',
//                 view: textureView,
//                 clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
//             }]
//         };

//         this.scene.setUniforms([time],3) // time
//         this.scene.updateUniformBuffer();      

//         const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);

//         passEncoder.setPipeline(this.scene.getPipeline());

//         passEncoder.setVertexBuffer(0, this.scene.getMesh().geometry.vertexBuffer);
        
//         passEncoder.setViewport(0, 0, (this.canvas.width) , (this.canvas.height) , 0, .2);

//         passEncoder.setBindGroup(0, this.bindingGroup);
//         passEncoder.setIndexBuffer(this.scene.getMesh().geometry.indexBuffer, 'uint16');
//         passEncoder.drawIndexed(this.scene.getMesh().geometry.numOfVerticles, 1);

        
//         passEncoder.end();
        
//         this.device.queue.submit([this.commandEncoder.finish()]);



//         }
//         getPipleline(): GPURenderPipeline | GPUComputePipeline {
//                 return this.createPipeline();
//         }
//         createPipeline():GPURenderPipeline { 
//                 return this.device.createRenderPipeline(this.getDescriptor());
//         }
//         foo():GPUBindGroupLayout{
                
//                 const layoutEntrys: Array<GPUBindGroupLayoutEntry> = [
//                         { // uniforms is manadory
//                             binding: 0,
//                             visibility: window.GPUShaderStage.FRAGMENT,
//                             buffer: {
//                                 type: "uniform"
//                             }
//                         }
//                     ];
//                     if (this.textures.length > 0) {
//                         layoutEntrys.push({ // sampler
//                             binding: 1,
//                             visibility: window.GPUShaderStage.FRAGMENT,
//                             sampler: {
//                                 type: "filtering"
//                             }
//                         });
//                         for (let i = 0; i < this.textures.length; i++) { //  1-n texture bindings
//                             if(this.textures[i].type === 0){
//                                 layoutEntrys.push({ 
//                                     binding: 2 + i,
//                                     visibility: window.GPUShaderStage.FRAGMENT,
//                                     texture: {
//                                         sampleType: "float"
//                                     }
//                                 })
//                             }else{//  external texture ( video )
//                                 layoutEntrys.push({ 
//                                     binding: 2 + i,
//                                     visibility: window.GPUShaderStage.FRAGMENT,
//                                     externalTexture:{ }
//                                 })
//                             }
                            
//                         }
//                     }
//                     this.bindGroupLayout = this.device.createBindGroupLayout({
//                         entries: layoutEntrys
//                     });
            
//                     this.pipelineLayout = this.device.createPipelineLayout({
//                         bindGroupLayouts: [this.bindGroupLayout],
//                     });

//                     return this.bindGroupLayout;

//         }
               
    

//         getDescriptor(): GPURenderPipelineDescriptor {
//                 const pipelineDescriptor: GPURenderPipelineDescriptor = {
                    
//                     label:"pipleLineDescriptor",
//                     vertex: {
//                         module: this.material.vertexShaderModule,
//                         entryPoint: this.material.shader.vertexEntryPoint || 'main_vertex',
//                         buffers: [this.geometry.vertexBufferLayout(0)]
//                     },
//                     fragment: {
                    
//                         module: this.material.fragmentShaderModule,
//                         entryPoint: this.material.shader.fragmentEntryPoint || 'main_fragment',
//                         targets: [{
//                             format: 'bgra8unorm'
//                         }]
//                     },
//                     primitive: {
//                         topology: 'triangle-list',
//                     },
//                     layout: this.pipelineLayout
//                 };
//                 return pipelineDescriptor;
//             }
// }

// export class ComputePipleline implements IPipeline {
//         pipeline: GPURenderPipeline;    
//         pipelineLayout: GPUPipelineLayout;
//         constructor(){

//         }
//         draw(): void {
//                 throw new Error("Method not implemented.");
//         }
//         getPipleline(): GPURenderPipeline | GPUComputePipeline {
//                 throw new Error("Method not implemented.");
//         }
//         getDescriptor(): GPURenderPipelineDescriptor | GPUComputePipelineDescriptor {
//                 throw new Error("Method not implemented.");
//         }
       
       
//         createPipeline ():GPUComputePipeline{
//                 throw new Error("Method not implemented.");
//         }
// }



// export interface IPipeline {
//         pipeline: GPURenderPipeline | GPUComputePipeline
//         createPipeline(): GPURenderPipeline | GPUComputePipeline
//         getPipleline():GPURenderPipeline | GPUComputePipeline
//         getDescriptor(): GPURenderPipelineDescriptor | GPUComputePipelineDescriptor
//         pipelineLayout: GPUPipelineLayout
//         draw(timeStamp:number):void
        
// }


