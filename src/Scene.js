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
    constructor(key, device, canvas) {
        this.key = key;
        this.device = device;
        this.canvas = canvas;
        this.meshes = new Map();
        this.textures = new Array();
        this.bindingGroupEntrys = new Array();
        const dpr = window.devicePixelRatio || 1;
        const uniforms = new Float32Array([this.canvas.width * dpr, this.canvas.height * dpr, dpr, 0]);
        this.uniformBuffer = this.device.createBuffer({
            size: 40,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,
        });
        this.uniformBufferArray = uniforms;
        this.updateUniformBuffer();
        // this.setUniforms(uniforms,0);
    }
    getMesh(index = 0) {
        return Array.from(this.meshes.values())[index];
    }
    setDimensions(width, height, dpr = 0) {
        this.setUniforms([width, height, dpr], 0);
    }
    setUniforms(values, offset) {
        this.uniformBufferArray.set(values, offset); // time 
    }
    updateUniformBuffer() {
        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformBufferArray.buffer, this.uniformBufferArray.byteOffset, this.uniformBufferArray.byteLength);
    }
    build(key, customUniforms, textures, samplers) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < textures.length; i++) {
                this.textures.push(yield TextureLoader_1.TextureLoader.createTexture(this.device, textures[i]));
            }
            this.bindingGroupEntrys = [{
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                }];
            let textureBindingOffset = (samplers ? samplers.length : 0);
            // add a default sampler if there is textures passed 
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
                const entry = {
                    binding: i + textureBindingOffset,
                    resource: t.createView()
                };
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
