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
exports.MyRenderer = exports.MyComputeShader = exports.PassBuilder = exports.Uniforms = exports.PassBase = exports.Helpers = void 0;
class Helpers {
}
exports.Helpers = Helpers;
const computeShaderCode = /* glsl */ ` 

struct Uniforms {
    resolution: vec3<f32>,
    time: f32
  };

        @group(0) @binding(0) var tex: texture_storage_2d<bgra8unorm, write>;
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
        textureStore(tex, pos, color);
      }
    `;
class PassBase {
    constructor(device) {
    }
}
exports.PassBase = PassBase;
class Uniforms {
    constructor(device, canvas) {
        this.device = device;
        this.uniformBuffer = this.device.createBuffer({
            size: 40,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,
        });
        this.uniformBufferArray = new Float32Array([canvas.width, canvas.height, 0, 1.0]);
        console.log(this.uniformBufferArray);
    }
    bindingGroupEntry(index) {
        return { binding: 1, resource: { buffer: this.uniformBuffer } };
    }
    setUniforms(values, offset) {
        this.uniformBufferArray.set(values, offset); // time 
    }
    updateUniformBuffer() {
        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformBufferArray.buffer, this.uniformBufferArray.byteOffset, this.uniformBufferArray.byteLength);
    }
}
exports.Uniforms = Uniforms;
class PassBuilder extends PassBase {
    constructor(device, canvas) {
        super(device);
        this.canvas = canvas;
        this.device = device;
    }
    createComputePipeline(computeShader) {
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
exports.PassBuilder = PassBuilder;
class MyComputeShader {
    constructor(device, computeShaderCode) {
        this.device = device;
        this.shaderModule = this.device.createShaderModule({ code: computeShaderCode });
    }
}
exports.MyComputeShader = MyComputeShader;
class MyRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.passBacklog = new Map();
    }
    init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
            const hasBGRA8unormStorage = adapter.features.has('bgra8unorm-storage');
            const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice({
                requiredFeatures: hasBGRA8unormStorage
                    ? ['bgra8unorm-storage']
                    : [],
            }));
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
                format: presentationFormat,
                usage: GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.STORAGE_BINDING,
            });
            const passBuilder = new PassBuilder(device, this.canvas);
            const shaderModule = new MyComputeShader(device, computeShaderCode);
            const computePipeline = passBuilder.createComputePipeline(shaderModule);
            this.passBacklog.set(0, {
                pipleline: computePipeline,
                uniforms: new Uniforms(device, this.canvas)
            });
            this.context = context;
            this.device = device;
        });
    }
    update(ts) {
        const texture = this.context.getCurrentTexture();
        const item = this.passBacklog.get(0);
        const bindingGroupEntrys = [];
        const pipleline = item.pipleline;
        bindingGroupEntrys.push({ binding: 0, resource: texture.createView() });
        bindingGroupEntrys.push({
            binding: 1,
            resource: {
                buffer: item.uniforms.uniformBuffer
            }
        });
        const bindGroup = this.device.createBindGroup({
            layout: pipleline.getBindGroupLayout(0),
            entries: bindingGroupEntrys
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
exports.MyRenderer = MyRenderer;
