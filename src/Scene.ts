import { ITexture } from "..";
import { Mesh } from "./Mesh";
import { TextureLoader } from "./TextureLoader";


// export class TextureCache {
//     entities: Map<string, any>
//     constructor() {
//         this.entities = new Map<string, any>();
//     }
// }

export interface ITextureData {
    type: number
     data: GPUTexture | HTMLVideoElement | HTMLImageElement 
}

export class Scene {

    meshes: Map<string, Mesh>;
    textures: Array<ITextureData>;
    bindingGroupEntrys: Array<GPUBindGroupEntry>;
    uniformBufferArray: Float32Array;
    uniformBuffer: GPUBuffer;

    mouse: { x: number; y: number; z: number; a: number; };

    getMesh(index: number = 0): Mesh {
        return Array.from(this.meshes.values())[index];
    }
    setDimensions(width: number, height: number, dpr: number = 0): void {
        this.setUniforms([width, height, dpr], 0);
    }
    setUniforms(values: ArrayLike<number>, offset: number) {
        this.uniformBufferArray.set(values, offset); 
    
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
    constructor(public key: string, public device: GPUDevice, public canvas: HTMLCanvasElement) {

        this.meshes = new Map<string, Mesh>();
        this.textures = new Array<ITextureData>();
        this.bindingGroupEntrys = new Array<GPUBindGroupEntry>();

        const dpr = window.devicePixelRatio || 1;
        this.uniformBuffer = this.device.createBuffer({
            size: 60,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,
        });

        this.uniformBufferArray = new Float32Array([this.canvas.width, this.canvas.height, 0, 1,0,0,0,0,0,0]);

        canvas.addEventListener("mousemove",(evt:MouseEvent) => {
            if(evt.buttons){
                const rect = canvas.getBoundingClientRect();
                const x = evt.clientX - rect.left;
                const y = evt.clientY - rect.top;
                this.setUniforms([x,y,evt.buttons,0],4)
                this.updateUniformBuffer();
            }
        });
        
  
       
    }

    getBindingGroupEntrys(): Array<GPUBindGroupEntry> {
        const bindingGroupEntrys: Array<GPUBindGroupEntry> = [];
        bindingGroupEntrys.push({
            binding: 0,
            resource: {
                buffer: this.uniformBuffer
            }
        });
        // todo: cache the samplers passed + default sampler ( linearSampler)
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
        
        this.textures.forEach((t, i) => {
            let entry: GPUBindGroupEntry;
            if (t.type === 0) {
                entry = {
                    binding: i + 2,
                    resource: (t.data as GPUTexture).createView()
                }
            } else {
                entry = {
                    binding: i + 2,
                    resource: this.device.importExternalTexture({ source: t.data as HTMLVideoElement }),
                };
            }
            bindingGroupEntrys.push(entry);
        });
        return bindingGroupEntrys;
    }

    async addAssets(textures?: Array<ITexture>, samplers?: Array<GPUSamplerDescriptor>) {


        for (let i = 0; i < textures.length; i++) {
            const texture = textures[i];
            if (texture.type == 0) {
                this.textures.push({ type: 0, data: await TextureLoader.createImageTexture(this.device, texture) });
            } else
                this.textures.push({ type: 1, data: await TextureLoader.createVideoTextue(this.device, texture) });
        }
        
        this.bindingGroupEntrys = [{
            binding: 0,
            resource: {
                buffer: this.uniformBuffer
            }
        }];
        let textureBindingOffset = (samplers ? samplers.length : 0)
        if (textures.length > 0 && !samplers) {
            const sampler = this.device.createSampler({
                addressModeU: 'repeat',
                addressModeV: 'repeat',
                magFilter: 'linear',
                minFilter: 'nearest'
            });
            this.bindingGroupEntrys.push({
                binding: 1,
                resource: sampler
            });
            textureBindingOffset = 2;
        } else {

            samplers.forEach((value, index) => {
                const sampler = this.device.createSampler(value);
                this.bindingGroupEntrys.push({
                    binding: index + 1,
                    resource: sampler
                });
                textureBindingOffset++;
            });
        }
        this.textures.forEach((t, i) => {
            let entry: GPUBindGroupEntry;
            if (t.type === 0) {
                entry = {
                    binding: i + textureBindingOffset,
                    resource: (t.data as GPUTexture).createView()
                }
            } else {

                entry = {
                    binding: i + textureBindingOffset,
                    resource: this.device.importExternalTexture({ source: t.data as HTMLVideoElement })
                };
            }
            this.bindingGroupEntrys.push(entry);
        });


    }

    addMesh(key: string, mesh: Mesh): void {
        this.meshes.set(key, mesh);
    }
    removeMesh(key: string): boolean {
        return this.meshes.delete(key);
    }
}
