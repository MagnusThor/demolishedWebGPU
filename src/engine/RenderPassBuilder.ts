// import { IMaterialShader } from "./IMaterialShader";
// import { Material } from "./Material";
// import { ITextureData } from "./Scene";
// import { IPassBuilder } from "./compute/IPassBuilder";


// export class RenderPassBuilder {

//     pipelineLayout: GPUPipelineLayout;
//     bindGroup: GPUBindGroup;

//     device: GPUDevice;
//     constructor(device: GPUDevice, public canvas: HTMLCanvasElement) {
//         this.device = device;
//     }
  

//     getRenderPiplelineBindingGroupLayout(
//         uniformBuffer: GPUBuffer, sampler?: GPUSampler
//     ): Array<GPUBindGroupEntry> {

//         const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];
//         bindingGroupEntrys.push({
//             binding: 0,
//             resource: {
//                 buffer: uniformBuffer
//             }
//         });

//         const defaultSampler = this.device.createSampler({
//             addressModeU: 'repeat',
//             addressModeV: 'repeat',
//             magFilter: 'linear',
//             minFilter: 'nearest'
//         });

//         bindingGroupEntrys.push({
//             binding: 1,
//             resource: sampler || defaultSampler
//         });
//         return bindingGroupEntrys;
//     }

//     createRender2Pipeline(material:Material,textures:Array<ITextureData>):GPURenderPipeline{
//         const bindGroupLayoutEntries = new Array<GPUBindGroupLayoutEntry>();

//         bindGroupLayoutEntries.push(   {
//             binding: 0,
//             visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
//             storageTexture: {
//                 access: "write-only",
//                 format: "bgra8unorm",
//                 viewDimension: "2d"
//             },
//         },
//         {
//             binding: 1,
//             visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
//             buffer: {
//                 type: "uniform"
//             }
//         });

//         if (textures.length > 0) {
            
//             bindGroupLayoutEntries.push({ // sampler
//                 binding: 2,
//                 visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
//                 sampler: {
//                     type: "filtering"
//                 }
//             });

//             for (let i = 0; i < textures.length; i++) { //  1-n texture bindings
//                 if(textures[i].type === 0){
//                     bindGroupLayoutEntries.push({ 
//                         binding: 3 + i,
//                         visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
//                         texture: {
//                             sampleType: "float"
//                         }
//                     })
//                 }else{
//                     bindGroupLayoutEntries.push({ 
//                         binding: 3 + i,
//                         visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
//                         externalTexture:{ }
//                     })
//                 }
                
//             }
//         }

//         const bindGroupLayout = this.device.createBindGroupLayout({
//             entries: bindGroupLayoutEntries 
//         });


        

//         const pipeline = this.device.createRenderPipeline({
//             layout: this.device.createPipelineLayout({
//                 bindGroupLayouts: [bindGroupLayout],
//             }),
        
//             vertex: {
//                 module: material.vertexShaderModule,
//                 entryPoint:"main"
                
//             }   
            
//         });

//         return pipeline;
    

//     }

//     createRenderPipeline(material:Material,textures:Array<ITextureData>): GPURenderPipeline {


//         const bindGroupLayoutEntries = new Array<GPUBindGroupLayoutEntry>();


//         bindGroupLayoutEntries.push(   {
//             binding: 0,
//             visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
//             storageTexture: {
//                 access: "write-only",
//                 format: "bgra8unorm",
//                 viewDimension: "2d"
//             },
//         },
//         {
//             binding: 1, 
//             visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
//             buffer: {
//                 type: "uniform"
//             }
//         });


    
//         if (textures.length > 0) {
            
//             bindGroupLayoutEntries.push({ // sampler
//                 binding: 2,
//                 visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
//                 sampler: {
//                     type: "filtering"
//                 }
//             });

//             for (let i = 0; i < textures.length; i++) { //  1-n texture bindings
//                 if(textures[i].type === 0){
//                     bindGroupLayoutEntries.push({ 
//                         binding: 3 + i,
//                         visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
//                         texture: {
//                             sampleType: "float"
//                         }
//                     })
//                 }else{
//                     bindGroupLayoutEntries.push({ 
//                         binding: 3 + i,
//                         visibility: window.GPUShaderStage.COMPUTE,
//                         externalTexture:{ }
//                     })
//                 }
                
//             }
//         }


//         const bindGroupLayout = this.device.createBindGroupLayout({
//             entries: bindGroupLayoutEntries 
//         });

//         const pipeline = this.device.createRenderPipeline(
//             {
//             layout: this.device.createPipelineLayout({
//                 bindGroupLayouts: [bindGroupLayout],
//             }),

//             vertex: {
//                 module: material.vertexShaderModule
//             },
//             fragment:{
//                module: material.fragmentShaderModule,
//                targets:[
//                 {
//                     format: 'bgra8unorm'
//                 }
//                ]    
//             }
        
//         });

        
//         return pipeline;
//     }
// }
