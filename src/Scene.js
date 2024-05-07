"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
const TextureLoader_1 = require("./TextureLoader");
class Scene {
    getMesh(index = 0) {
        return Array.from(this.meshes.values())[index];
    }
    setDimensions(width, height, dpr = 0) {
        this.setUniforms([width, height, dpr], 0);
    }
    setUniforms(values, offset) {
        this.uniformBufferArray.set(values, offset);
    }
    updateUniformBuffer() {
        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformBufferArray.buffer, this.uniformBufferArray.byteOffset, this.uniformBufferArray.byteLength);
    }
    constructor(key, device, canvas) {
        this.key = key;
        this.device = device;
        this.canvas = canvas;
        this.meshes = new Map();
        this.textures = new Array();
        this.bindingGroupEntrys = new Array();
        const dpr = window.devicePixelRatio || 1;
        this.uniformBuffer = this.device.createBuffer({
            size: 60,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,
        });
        this.uniformBufferArray = new Float32Array([this.canvas.width, this.canvas.height, 0, 1.0, 0, 0, 0, 0, 0]);
        canvas.addEventListener("mousemove", (evt) => {
            //  if(evt.button){
            const rect = canvas.getBoundingClientRect();
            const x = evt.clientX - rect.left;
            const y = evt.clientY - rect.top;
            //this.mouse = {x: x, y: y,z: evt.button,a:0};
            this.setUniforms([x, y, evt.button, 0], 4); // time
            // this.updateUniformBuffer();
            //    console.log([x,y,evt.button,0]);
            // }
        });
        this.updateUniformBuffer();
    }
    getBindingGroupEntrys() {
        const bindingGroupEntrys = [];
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
            let entry;
            if (t.type === 0) {
                entry = {
                    binding: i + 2,
                    resource: t.data.createView()
                };
            }
            else {
                entry = {
                    binding: i + 2,
                    resource: this.device.importExternalTexture({ source: t.data }),
                };
            }
            bindingGroupEntrys.push(entry);
        });
        return bindingGroupEntrys;
    }
    addAssets(textures, samplers) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < textures.length; i++) {
                const texture = textures[i];
                if (texture.type == 0) {
                    this.textures.push({ type: 0, data: yield TextureLoader_1.TextureLoader.createImageTexture(this.device, texture) });
                }
                else
                    this.textures.push({ type: 1, data: yield TextureLoader_1.TextureLoader.createVideoTextue(this.device, texture) });
            }
            this.bindingGroupEntrys = [{
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                }];
            let textureBindingOffset = (samplers ? samplers.length : 0);
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
            }
            else {
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
                let entry;
                if (t.type === 0) {
                    entry = {
                        binding: i + textureBindingOffset,
                        resource: t.data.createView()
                    };
                }
                else {
                    entry = {
                        binding: i + textureBindingOffset,
                        resource: this.device.importExternalTexture({ source: t.data })
                    };
                }
                this.bindingGroupEntrys.push(entry);
            });
        });
    }
    addMesh(key, mesh) {
        this.meshes.set(key, mesh);
    }
    removeMesh(key) {
        return this.meshes.delete(key);
    }
}
exports.Scene = Scene;
