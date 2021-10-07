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

/***/ "./example/Example.js":
/*!****************************!*\
  !*** ./example/Example.js ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst Geometry_1 = __webpack_require__(/*! ../src/Geometry */ \"./src/Geometry.js\");\r\nconst Material_1 = __webpack_require__(/*! ../src/Material */ \"./src/Material.js\");\r\nconst Renderer_1 = __webpack_require__(/*! ../src/Renderer */ \"./src/Renderer.js\");\r\n//import { cloudWglsl } from \"./shaders/cloud\";\r\nconst plasma_1 = __webpack_require__(/*! ./shaders/plasma */ \"./example/shaders/plasma.js\");\r\ndocument.addEventListener(\"DOMContentLoaded\", () => {\r\n    const renderer = new Renderer_1.Renderer(document.querySelector('canvas'));\r\n    renderer.getDevice().then((device) => __awaiter(void 0, void 0, void 0, function* () {\r\n        // quad (2x tri's)\r\n        // x,y,z,w,r,g,b,a\r\n        const vertices = new Float32Array([\r\n            -1, 1, 0, 1, 0, 1, 1, 1,\r\n            -1, -1, 0, 1, 0, 1, 1, 1,\r\n            1, -1, 0, 1, 0, 1, 1, 1,\r\n            -1, 1, 0, 1, 0, 1, 1, 1,\r\n            1, -1, 0, 1, 0, 1, 1, 1,\r\n            1, 1, 0, 1, 0, 1, 1, 1,\r\n        ]);\r\n        // width,height,devicePixelRatio,time \r\n        const uniforms = new Float32Array([renderer.canvas.width, renderer.canvas.height, devicePixelRatio, 0]);\r\n        const geometry = new Geometry_1.Geometry(device, vertices);\r\n        const material = new Material_1.Material(device, plasma_1.plasmaWglsl);\r\n        const textures = [{\r\n                key: \"textureA\",\r\n                path: \"/example/assets/channel0.jpg\"\r\n            },\r\n            {\r\n                key: \"textureB\",\r\n                path: \"/example/assets/channel1.jpg\"\r\n            }\r\n        ];\r\n        renderer.initialize(geometry, material, uniforms, textures).then(() => {\r\n            renderer.render();\r\n        });\r\n    }));\r\n});\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./example/Example.js?");

/***/ }),

/***/ "./example/shaders/plasma.js":
/*!***********************************!*\
  !*** ./example/shaders/plasma.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.plasmaWglsl = void 0;\r\nexports.plasmaWglsl = \r\n/* wgsl */ `\r\n      [[block]] struct Uniforms {\r\n        resolution: vec3<f32>;\r\n        time: f32;\r\n      };\r\n      \r\n      [[group(0), binding(0)]] var<uniform> uniforms: Uniforms;\r\n      \r\n      struct VertexInput {\r\n        [[location(0)]] pos: vec2<f32>;\r\n      };\r\n      \r\n      struct VertexOutput {\r\n        [[builtin(position)]] pos: vec4<f32>;\r\n        [[location(0)]] uv: vec2<f32>;\r\n      };\r\n      \r\n      [[stage(vertex)]]\r\n      fn main_vertex(input: VertexInput) -> VertexOutput {\r\n        var output: VertexOutput;\r\n        var pos: vec2<f32> = input.pos * 2.0 - 1.0;\r\n        output.pos = vec4<f32>(pos, 0.0, 1.0);\r\n        output.uv = input.pos;\r\n        return output;\r\n      }\r\n\r\n       // your shader code implementation -->\r\n\r\n     \r\n      let MAX_ITER: i32 = 20;\r\n      let TAU: f32 = 7.28318530718;\r\n            \r\n      fn main(fragCoord: vec2<f32>) -> vec4<f32> {\r\n\r\n        var uv: vec2<f32>= (fragCoord + vec2<f32>(1.0, 1.0)) / vec2<f32>(2.0, 2.0);\r\n        var time: f32 = uniforms.time;\r\n    \r\n        var p: vec2<f32> = (uv * vec2<f32>(TAU, TAU) % vec2<f32>(TAU, TAU)) - vec2<f32>(250.0, 250.0);\r\n        var i: vec2<f32> = vec2<f32>(p);\r\n        var c: f32 = 0.5;\r\n        var inten: f32 = 0.005;\r\n    \r\n        for (var n: i32 = 0; n < MAX_ITER; n = n + 1) {\r\n            var t: f32 = 0.16 * (time + 23.0) * (1.0 - (3.5 / (f32(n) + 1.0)));\r\n            i = p + vec2<f32>(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));\r\n            c = c + 1.0 / length(vec2<f32>(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));\r\n        }\r\n    \r\n        c = c / f32(MAX_ITER);\r\n        c = 1.0 - pow(c, 2.0);\r\n        var cc: f32 = pow(abs(c), 12.0);\r\n        var color: vec3<f32> = vec3<f32>(cc, cc, cc);\r\n        color = clamp(color, vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0));\r\n    \r\n        //var tint: vec3<f32>= vec3<f32>(uv.x, uv.y, (1.0 - uv.x) * (1.0 - uv.y));\r\n        return vec4<f32>(color,1.0);\r\n\r\n      }\r\n      \r\n      [[stage(fragment)]]\r\n      fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {      \r\n        return main(in.uv);\r\n}`;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./example/shaders/plasma.js?");

/***/ }),

/***/ "./src/Geometry.js":
/*!*************************!*\
  !*** ./src/Geometry.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Geometry = void 0;\r\nclass Geometry {\r\n    constructor(device, vertices) {\r\n        this.device = device;\r\n        this.vertexBuffer = this.device.createBuffer({\r\n            size: vertices.byteLength,\r\n            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,\r\n            mappedAtCreation: true\r\n        });\r\n        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);\r\n        this.vertexBuffer.unmap();\r\n    }\r\n    vertexBufferLayout(shaderLocation) {\r\n        const vertexBufferLayout = {\r\n            attributes: [{\r\n                    shaderLocation: shaderLocation,\r\n                    offset: 0,\r\n                    format: 'float32x2'\r\n                }],\r\n            arrayStride: 32,\r\n            stepMode: 'vertex'\r\n        };\r\n        return vertexBufferLayout;\r\n    }\r\n}\r\nexports.Geometry = Geometry;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Geometry.js?");

/***/ }),

/***/ "./src/Material.js":
/*!*************************!*\
  !*** ./src/Material.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Material = void 0;\r\nclass Material {\r\n    constructor(device, wglsl) {\r\n        this.device = device;\r\n        this.shaderModule = this.device.createShaderModule({\r\n            code: wglsl\r\n        });\r\n    }\r\n}\r\nexports.Material = Material;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Material.js?");

/***/ }),

/***/ "./src/Mesh.js":
/*!*********************!*\
  !*** ./src/Mesh.js ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Mesh = void 0;\r\nclass Mesh {\r\n    constructor(device, geometry, material, uniformBufferArray, numOfTextures = 0) {\r\n        this.device = device;\r\n        this.geometry = geometry;\r\n        this.material = material;\r\n        this.uniformBufferArray = uniformBufferArray;\r\n        this.uniformBuffer = this.device.createBuffer({\r\n            size: 20,\r\n            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,\r\n        });\r\n        const layoutEntrys = [\r\n            {\r\n                binding: 0,\r\n                visibility: window.GPUShaderStage.FRAGMENT,\r\n                buffer: {\r\n                    type: \"uniform\"\r\n                }\r\n            }\r\n        ];\r\n        if (numOfTextures > 0) {\r\n            layoutEntrys.push({\r\n                binding: 1,\r\n                visibility: window.GPUShaderStage.FRAGMENT,\r\n                sampler: {\r\n                    type: \"filtering\"\r\n                }\r\n            });\r\n            for (let i = 0; i < numOfTextures; i++) {\r\n                layoutEntrys.push({\r\n                    binding: 2 + i,\r\n                    visibility: window.GPUShaderStage.FRAGMENT,\r\n                    texture: {\r\n                        sampleType: \"float\"\r\n                    }\r\n                });\r\n            }\r\n        }\r\n        this.bindGroupLayout = this.device.createBindGroupLayout({\r\n            entries: layoutEntrys\r\n        });\r\n        this.pipelineLayout = this.device.createPipelineLayout({\r\n            bindGroupLayouts: [this.bindGroupLayout],\r\n        });\r\n    }\r\n    updateUniforms() {\r\n        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformBufferArray.buffer, this.uniformBufferArray.byteOffset, this.uniformBufferArray.byteLength);\r\n    }\r\n    pipelineDescriptor() {\r\n        const pipelineDescriptor = {\r\n            vertex: {\r\n                module: this.material.shaderModule,\r\n                entryPoint: 'main_vertex',\r\n                buffers: [this.geometry.vertexBufferLayout(0)]\r\n            },\r\n            fragment: {\r\n                module: this.material.shaderModule,\r\n                entryPoint: 'main_fragment',\r\n                targets: [{\r\n                        format: 'bgra8unorm'\r\n                    }]\r\n            },\r\n            // depthStencil: {\r\n            //     format: 'depth32float',\r\n            //     depthWriteEnabled: true,\r\n            //     depthCompare: 'less'\r\n            // },\r\n            primitive: {\r\n                topology: 'triangle-list',\r\n            },\r\n            layout: this.pipelineLayout\r\n        };\r\n        return pipelineDescriptor;\r\n    }\r\n}\r\nexports.Mesh = Mesh;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Mesh.js?");

/***/ }),

/***/ "./src/Renderer.js":
/*!*************************!*\
  !*** ./src/Renderer.js ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Renderer = void 0;\r\nconst Mesh_1 = __webpack_require__(/*! ./Mesh */ \"./src/Mesh.js\");\r\nconst TextureLoader_1 = __webpack_require__(/*! ./TextureLoader */ \"./src/TextureLoader.js\");\r\nclass Renderer {\r\n    constructor(canvas) {\r\n        this.canvas = canvas;\r\n        this.render = () => {\r\n            this.draw(performance.now() / 1000);\r\n            requestAnimationFrame(this.render);\r\n        };\r\n        this.textures = new Array();\r\n    }\r\n    getDevice() {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            const device = yield this.initializeAPI();\r\n            if (device) {\r\n                this.context = this.canvas.getContext('webgpu');\r\n                const canvasConfig = {\r\n                    device: this.device,\r\n                    format: 'bgra8unorm',\r\n                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC\r\n                };\r\n                this.context.configure(canvasConfig);\r\n                return device;\r\n            }\r\n        });\r\n    }\r\n    initializeAPI() {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            try {\r\n                const entry = navigator.gpu;\r\n                if (!entry) {\r\n                    throw \"Cannot initalize WebGPU \";\r\n                }\r\n                this.adapter = yield entry.requestAdapter();\r\n                this.device = yield this.adapter.requestDevice();\r\n                this.queue = this.device.queue;\r\n            }\r\n            catch (e) {\r\n                throw \"Cannot initalize WebGPU \";\r\n            }\r\n            return this.device;\r\n        });\r\n    }\r\n    initialize(geometry, material, uniforms, texture) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            for (let i = 0; i < texture.length; i++) {\r\n                this.textures.push(yield TextureLoader_1.TextureLoader.createTexture(this.device, texture[i]));\r\n            }\r\n            this.mesh = new Mesh_1.Mesh(this.device, geometry, material, uniforms, texture.length);\r\n            this.renderPipeline = this.device.createRenderPipeline(this.mesh.pipelineDescriptor());\r\n            const bindingGroupEntrys = [{\r\n                    binding: 0,\r\n                    resource: {\r\n                        buffer: this.mesh.uniformBuffer\r\n                    }\r\n                }];\r\n            // add a sampler if there is textures passed \r\n            if (this.textures.length > 0) {\r\n                const sampler = this.device.createSampler({\r\n                    addressModeU: 'repeat',\r\n                    addressModeV: 'repeat',\r\n                    magFilter: 'linear',\r\n                    minFilter: 'nearest'\r\n                });\r\n                bindingGroupEntrys.push({\r\n                    binding: 1,\r\n                    resource: sampler\r\n                });\r\n            }\r\n            this.textures.forEach((t, i) => {\r\n                const entry = {\r\n                    binding: i + 2,\r\n                    resource: t.createView()\r\n                };\r\n                bindingGroupEntrys.push(entry);\r\n            });\r\n            this.bindingGroup = this.device.createBindGroup({\r\n                layout: this.renderPipeline.getBindGroupLayout(0),\r\n                entries: bindingGroupEntrys,\r\n            });\r\n        });\r\n    }\r\n    draw(time) {\r\n        this.commandEncoder = this.device.createCommandEncoder();\r\n        const clearColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 };\r\n        const renderPassDescriptor = {\r\n            colorAttachments: [{\r\n                    loadValue: clearColor,\r\n                    storeOp: 'store',\r\n                    view: this.context.getCurrentTexture().createView()\r\n                }]\r\n        };\r\n        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);\r\n        this.mesh.uniformBufferArray.set([time], 3); // time    \r\n        this.mesh.updateUniforms();\r\n        passEncoder.setPipeline(this.renderPipeline);\r\n        passEncoder.setVertexBuffer(0, this.mesh.geometry.vertexBuffer);\r\n        passEncoder.setBindGroup(0, this.bindingGroup);\r\n        passEncoder.draw(6, 1, 0, 0);\r\n        passEncoder.endPass();\r\n        this.device.queue.submit([this.commandEncoder.finish()]);\r\n    }\r\n}\r\nexports.Renderer = Renderer;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Renderer.js?");

/***/ }),

/***/ "./src/TextureLoader.js":
/*!******************************!*\
  !*** ./src/TextureLoader.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.TextureLoader = void 0;\r\nclass TextureLoader {\r\n    constructor() {\r\n    }\r\n    /**\r\n     * Load and create an GPUTexture from an Image\r\n     *\r\n     * @static\r\n     * @param {GPUDevice} device\r\n     * @param {string} src\r\n     * @return {*}  {Promise<GPUTexture>}\r\n     * @memberof TextureLoader\r\n     */\r\n    static createTexture(device, src) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            const image = new Image();\r\n            image.src = src.path;\r\n            yield image.decode();\r\n            const imageBitmap = yield createImageBitmap(image);\r\n            const textureSize = { width: image.width, height: image.height };\r\n            const texture = device.createTexture({\r\n                label: src.key,\r\n                size: textureSize,\r\n                dimension: '2d',\r\n                format: 'rgba8unorm',\r\n                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING\r\n            });\r\n            device.queue.copyExternalImageToTexture({\r\n                source: imageBitmap\r\n            }, {\r\n                texture: texture,\r\n                mipLevel: 0\r\n            }, textureSize);\r\n            return texture;\r\n        });\r\n    }\r\n}\r\nexports.TextureLoader = TextureLoader;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/TextureLoader.js?");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./example/Example.js");
/******/ 	
/******/ })()
;