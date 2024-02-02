/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./example/ExampleCompute.js":
/*!***********************************!*\
  !*** ./example/ExampleCompute.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst Engine_1 = __webpack_require__(/*! ../src/Engine */ \"./src/Engine.js\");\ndocument.addEventListener(\"DOMContentLoaded\", () => __awaiter(void 0, void 0, void 0, function* () {\n    const renderer = new Engine_1.MyRenderer(document.querySelector(\"canvas\"));\n    yield renderer.init();\n    renderer.update(0);\n}));\n\n\n//# sourceURL=webpack://demolishedwebgpu/./example/ExampleCompute.js?");

/***/ }),

/***/ "./src/Engine.js":
/*!***********************!*\
  !*** ./src/Engine.js ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports) {

eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.MyRenderer = exports.MyComputeShader = exports.PassBuilder = exports.Uniforms = exports.PassBase = exports.Helpers = void 0;\nclass Helpers {\n}\nexports.Helpers = Helpers;\nconst computeShaderCode = /* glsl */ ` \r\n\r\nstruct Uniforms {\r\n    resolution: vec3<f32>,\r\n    time: f32\r\n  };\r\n\r\n        @group(0) @binding(0) var tex: texture_storage_2d<bgra8unorm, write>;\r\n        @group(0) @binding(1) var<uniform> uniforms: Uniforms;\r\n       \r\n      @compute @workgroup_size(1) fn main(\r\n        @builtin(global_invocation_id) id : vec3u\r\n      )  {\r\n        let size = textureDimensions(tex);\r\n        let center = vec2f(size) / 2.0;\r\n        let pos = id.xy;\r\n        let dist = distance(vec2f(pos), center);\r\n        let stripe = dist / 32.0 % 2.0;\r\n        let red = vec4f(1, 0, 0, 1);\r\n        let cyan = vec4f(0, 1, 1, 1);\r\n        let color = select(red, cyan, stripe < 1.0);\r\n        textureStore(tex, pos, color);\r\n      }\r\n    `;\nclass PassBase {\n    constructor(device) {\n    }\n}\nexports.PassBase = PassBase;\nclass Uniforms {\n    constructor(device, canvas) {\n        this.device = device;\n        this.uniformBuffer = this.device.createBuffer({\n            size: 40,\n            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,\n        });\n        this.uniformBufferArray = new Float32Array([canvas.width, canvas.height, 0, 1.0]);\n        console.log(this.uniformBufferArray);\n    }\n    bindingGroupEntry(index) {\n        return { binding: 1, resource: { buffer: this.uniformBuffer } };\n    }\n    setUniforms(values, offset) {\n        this.uniformBufferArray.set(values, offset); // time \n    }\n    updateUniformBuffer() {\n        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformBufferArray.buffer, this.uniformBufferArray.byteOffset, this.uniformBufferArray.byteLength);\n    }\n}\nexports.Uniforms = Uniforms;\nclass PassBuilder extends PassBase {\n    constructor(device, canvas) {\n        super(device);\n        this.canvas = canvas;\n        this.device = device;\n    }\n    createComputePipeline(computeShader) {\n        const bindGroupLayout = this.device.createBindGroupLayout({\n            entries: [\n                { binding: 0,\n                    visibility: GPUShaderStage.COMPUTE,\n                    storageTexture: {\n                        format: \"bgra8unorm\",\n                    },\n                },\n                { binding: 1, visibility: GPUShaderStage.COMPUTE,\n                    buffer: {\n                        type: \"uniform\"\n                    }\n                }\n            ],\n        });\n        /*\n         { binding: 1, visibility: GPUShaderStage.COMPUTE,\n                        },\n        */\n        const pipeline = this.device.createComputePipeline({\n            layout: this.device.createPipelineLayout({\n                bindGroupLayouts: [bindGroupLayout],\n            }),\n            compute: {\n                module: computeShader.shaderModule,\n                entryPoint: 'main',\n            },\n        });\n        return pipeline;\n    }\n}\nexports.PassBuilder = PassBuilder;\nclass MyComputeShader {\n    constructor(device, computeShaderCode) {\n        this.device = device;\n        this.shaderModule = this.device.createShaderModule({ code: computeShaderCode });\n    }\n}\nexports.MyComputeShader = MyComputeShader;\nclass MyRenderer {\n    constructor(canvas) {\n        this.canvas = canvas;\n        this.passBacklog = new Map();\n    }\n    init() {\n        var _a;\n        return __awaiter(this, void 0, void 0, function* () {\n            const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());\n            const hasBGRA8unormStorage = adapter.features.has('bgra8unorm-storage');\n            const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice({\n                requiredFeatures: hasBGRA8unormStorage\n                    ? ['bgra8unorm-storage']\n                    : [],\n            }));\n            if (!device) {\n                throw \"need a browser that supports WebGPU\";\n            }\n            const presentationFormat = hasBGRA8unormStorage\n                ? navigator.gpu.getPreferredCanvasFormat()\n                : 'rgba8unorm';\n            const context = this.canvas.getContext(\"webgpu\");\n            console.log(presentationFormat);\n            context.configure({\n                device,\n                format: presentationFormat,\n                usage: GPUTextureUsage.TEXTURE_BINDING |\n                    GPUTextureUsage.STORAGE_BINDING,\n            });\n            const passBuilder = new PassBuilder(device, this.canvas);\n            const shaderModule = new MyComputeShader(device, computeShaderCode);\n            const computePipeline = passBuilder.createComputePipeline(shaderModule);\n            this.passBacklog.set(0, {\n                pipleline: computePipeline,\n                uniforms: new Uniforms(device, this.canvas)\n            });\n            this.context = context;\n            this.device = device;\n        });\n    }\n    update(ts) {\n        const texture = this.context.getCurrentTexture();\n        const item = this.passBacklog.get(0);\n        const bindingGroupEntrys = [];\n        const pipleline = item.pipleline;\n        bindingGroupEntrys.push({ binding: 0, resource: texture.createView() });\n        bindingGroupEntrys.push({\n            binding: 1,\n            resource: {\n                buffer: item.uniforms.uniformBuffer\n            }\n        });\n        const bindGroup = this.device.createBindGroup({\n            layout: pipleline.getBindGroupLayout(0),\n            entries: bindingGroupEntrys\n        });\n        const encoder = this.device.createCommandEncoder({ label: 'our encoder' });\n        const pass = encoder.beginComputePass();\n        pass.setPipeline(pipleline);\n        pass.setBindGroup(0, bindGroup);\n        pass.dispatchWorkgroups(texture.width, texture.height);\n        pass.end();\n        const commandBuffer = encoder.finish();\n        this.device.queue.submit([commandBuffer]);\n    }\n}\nexports.MyRenderer = MyRenderer;\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Engine.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./example/ExampleCompute.js");
/******/ 	
/******/ })()
;