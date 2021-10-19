import { ITexture } from "..";
import { Mesh } from "./Mesh";
import { TextureLoader } from "./TextureLoader";


export class Scene {

    meshes: Map<string, Mesh>;
    //bindingGroup: GPUBindGroup;
    textures: Array<GPUTexture>;
    bindingGroupEntrys: Array<GPUBindGroupEntry>;
    uniformBufferArray: Float32Array;
    uniformBuffer: GPUBuffer;

    getMesh(index: number = 0): Mesh {
        return Array.from(this.meshes.values())[index];
    }

    setDimensions(width: number, height: number, dpr: number = 0): void {
        this.setUniforms([width, height, dpr], 0);
    }
    setUniforms(values: any, offset: number) {
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
    constructor(public key: string, public device: GPUDevice, public canvas: HTMLCanvasElement) {
        this.meshes = new Map<string, Mesh>();
        this.textures = new Array<GPUTexture>();
        this.bindingGroupEntrys = new Array<GPUBindGroupEntry>();
        const dpr = window.devicePixelRatio || 1;
        this.uniformBuffer = this.device.createBuffer({
            size: 40,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,
        });
        this.uniformBufferArray = new Float32Array([this.canvas.width * dpr, this.canvas.height * dpr, dpr, 0]);;
        this.updateUniformBuffer();
    }

    async build(customUniforms?: Float32Array, textures?: Array<ITexture>, samplers?: Array<GPUSamplerDescriptor>) {
        for (let i = 0; i < textures.length; i++) {
            this.textures.push(await TextureLoader.createTexture(this.device, textures[i]));
        }
        this.bindingGroupEntrys = [{
            binding: 0,
            resource: {
                buffer: this.uniformBuffer
            }
        }];
        let textureBindingOffset = (samplers ? samplers.length : 0)
        if (this.textures.length > 0 && !samplers) {
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
            const entry: GPUBindGroupEntry = {
                binding: i + textureBindingOffset,
                resource: t.createView()
            }
            this.bindingGroupEntrys.push(entry);
        });

    }

    addMesh(key: string, mesh: Mesh) {
        this.meshes.set(key, mesh);
    }
    removeMesh(key: string): boolean {
        return this.meshes.delete(key);
    }
}
