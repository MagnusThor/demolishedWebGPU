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

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst Geometry_1 = __webpack_require__(/*! ../src/Geometry */ \"./src/Geometry.js\");\r\nconst Material_1 = __webpack_require__(/*! ../src/Material */ \"./src/Material.js\");\r\nconst Renderer_1 = __webpack_require__(/*! ../src/Renderer */ \"./src/Renderer.js\");\r\nconst texture_1 = __webpack_require__(/*! ./shaders/wglsl/texture */ \"./example/shaders/wglsl/texture.js\");\r\nconst rect_1 = __webpack_require__(/*! ./meshes/rect */ \"./example/meshes/rect.js\");\r\ndocument.addEventListener(\"DOMContentLoaded\", () => __awaiter(void 0, void 0, void 0, function* () {\r\n    const renderer = new Renderer_1.Renderer(document.querySelector('canvas'));\r\n    const device = yield renderer.getDevice();\r\n    /*\r\n          glslang compile GLSL - > SPIR-V , in this case an fragmentshader in glsl version 4.5\r\n    */\r\n    //const glsl = await glslang();\r\n    //let compiledShader = glsl.compileGLSL(magadoshShader.fragment as string, \"fragment\", false);\r\n    //const myMaterial = Material.createMaterialShader(fractalShader.vertex, compiledShader, \"main\", \"main\");\r\n    const material = new Material_1.Material(device, texture_1.showTextureShader);\r\n    //const material = new Material(device, myMaterial)\r\n    const geometry = new Geometry_1.Geometry(device, rect_1.rectVertexArray);\r\n    const textures = [{\r\n            key: \"textureA\",\r\n            path: \"assets/channel0.jpg\"\r\n        },\r\n        {\r\n            key: \"textureB\",\r\n            path: \"assets/channel1.jpg\"\r\n        }\r\n    ];\r\n    const samplers = [{\r\n            addressModeU: 'repeat',\r\n            addressModeV: 'repeat',\r\n            magFilter: 'linear',\r\n            minFilter: 'nearest' // linear sampler, binding 2, as uniforms is bound to 1    \r\n        }];\r\n    yield renderer.initialize(geometry, material, textures, undefined, samplers);\r\n    renderer.start(0);\r\n}));\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./example/Example.js?");

/***/ }),

/***/ "./example/meshes/rect.js":
/*!********************************!*\
  !*** ./example/meshes/rect.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.rectVertexArray = void 0;\r\n//\r\n// x,y,z,w,r,g,b,a\r\nexports.rectVertexArray = new Float32Array([\r\n    -1, 1, 0, 1, 0, 1, 1, 1,\r\n    -1, -1, 0, 1, 0, 1, 1, 1,\r\n    1, -1, 0, 1, 0, 1, 1, 1,\r\n    -1, 1, 0, 1, 0, 1, 1, 1,\r\n    1, -1, 0, 1, 0, 1, 1, 1,\r\n    1, 1, 0, 1, 0, 1, 1, 1,\r\n]);\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./example/meshes/rect.js?");

/***/ }),

/***/ "./example/shaders/wglsl/texture.js":
/*!******************************************!*\
  !*** ./example/shaders/wglsl/texture.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.showTextureShader = void 0;\r\nconst Material_1 = __webpack_require__(/*! ../../../src/Material */ \"./src/Material.js\");\r\nexports.showTextureShader = {\r\n    vertex: Material_1.defaultWglslVertex,\r\n    fragment: /* wgsl */ `\r\n  [[block]] struct Uniforms {\r\n    resolution: vec3<f32>;\r\n    time: f32;\r\n  };\r\n  [[group(0), binding(0)]] var<uniform> uniforms: Uniforms;\r\n  [[group(0), binding(1)]] var linearSampler: sampler;\r\n  [[group(0), binding(2)]] var textureA: texture_2d<f32>;\r\n  [[group(0), binding(3)]] var textureB: texture_2d<f32>;\r\n     \r\n  struct VertexOutput {\r\n    [[builtin(position)]] pos: vec4<f32>;\r\n    [[location(0)]] uv: vec2<f32>;\r\n  };  \r\n\r\n  fn main(fragCoord: vec2<f32>) -> vec4<f32> {\r\n    // display texture \r\n    return textureSample(textureB, linearSampler, fragCoord);\r\n  }\r\n  [[stage(fragment)]]\r\n  fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {      \r\n    return main(in.uv);\r\n}`\r\n};\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./example/shaders/wglsl/texture.js?");

/***/ }),

/***/ "./src/Geometry.js":
/*!*************************!*\
  !*** ./src/Geometry.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Geometry = void 0;\r\nclass Geometry {\r\n    constructor(device, vertices) {\r\n        this.device = device;\r\n        this.vertices = vertices;\r\n        this.vertexBuffer = this.device.createBuffer({\r\n            size: vertices.byteLength,\r\n            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,\r\n            mappedAtCreation: true\r\n        });\r\n        this.numOfVerticles = vertices.length / 4;\r\n        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);\r\n        this.vertexBuffer.unmap();\r\n    }\r\n    vertexBufferLayout(shaderLocation) {\r\n        const vertexBufferLayout = {\r\n            attributes: [{\r\n                    shaderLocation: shaderLocation,\r\n                    offset: 0,\r\n                    format: 'float32x2'\r\n                }],\r\n            arrayStride: 32,\r\n            stepMode: 'vertex'\r\n        };\r\n        return vertexBufferLayout;\r\n    }\r\n}\r\nexports.Geometry = Geometry;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Geometry.js?");

/***/ }),

/***/ "./src/Material.js":
/*!*************************!*\
  !*** ./src/Material.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Material = exports.defaultWglslVertex = void 0;\r\nexports.defaultWglslVertex = `  \r\nstruct VertexInput {\r\n  [[location(0)]] pos: vec2<f32>;\r\n};  \r\nstruct VertexOutput {\r\n  [[builtin(position)]] pos: vec4<f32>;\r\n  [[location(0)]] uv: vec2<f32>;\r\n};  \r\n[[stage(vertex)]]\r\nfn main_vertex(input: VertexInput) -> VertexOutput {\r\n  var output: VertexOutput;\r\n  var pos: vec2<f32> = input.pos * 2.0 - 1.0;\r\n  output.pos = vec4<f32>(pos, 0.0, 1.0);\r\n  output.uv = input.pos;\r\n  return output;\r\n} \r\n`;\r\nclass Material {\r\n    constructor(device, shader) {\r\n        this.device = device;\r\n        this.shader = shader;\r\n        this.vertexShaderModule = this.device.createShaderModule({\r\n            code: shader.vertex,\r\n        });\r\n        this.fragmentShaderModule = this.device.createShaderModule({\r\n            code: shader.fragment\r\n        });\r\n    }\r\n    static createMaterialShader(spirvVert, spirvFrag, vertexEntryPoint, fragmentEntryPoint) {\r\n        const material = {\r\n            fragment: spirvFrag,\r\n            fragmentEntryPoint: fragmentEntryPoint,\r\n            vertex: spirvVert,\r\n            vertexEntryPoint: vertexEntryPoint\r\n        };\r\n        return material;\r\n    }\r\n}\r\nexports.Material = Material;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Material.js?");

/***/ }),

/***/ "./src/Mesh.js":
/*!*********************!*\
  !*** ./src/Mesh.js ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Mesh = void 0;\r\nclass Mesh {\r\n    constructor(device, geometry, material, uniformBufferArray, numOfTextures = 0) {\r\n        this.device = device;\r\n        this.geometry = geometry;\r\n        this.material = material;\r\n        this.uniformBufferArray = uniformBufferArray;\r\n        this.uniformBuffer = this.device.createBuffer({\r\n            size: 40,\r\n            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,\r\n        });\r\n        const layoutEntrys = [\r\n            {\r\n                binding: 0,\r\n                visibility: window.GPUShaderStage.FRAGMENT,\r\n                buffer: {\r\n                    type: \"uniform\"\r\n                }\r\n            }\r\n        ];\r\n        if (numOfTextures > 0) {\r\n            layoutEntrys.push({\r\n                binding: 1,\r\n                visibility: window.GPUShaderStage.FRAGMENT,\r\n                sampler: {\r\n                    type: \"filtering\"\r\n                }\r\n            });\r\n            for (let i = 0; i < numOfTextures; i++) {\r\n                layoutEntrys.push({\r\n                    binding: 2 + i,\r\n                    visibility: window.GPUShaderStage.FRAGMENT,\r\n                    texture: {\r\n                        sampleType: \"float\"\r\n                    }\r\n                });\r\n            }\r\n        }\r\n        this.bindGroupLayout = this.device.createBindGroupLayout({\r\n            entries: layoutEntrys\r\n        });\r\n        this.pipelineLayout = this.device.createPipelineLayout({\r\n            bindGroupLayouts: [this.bindGroupLayout],\r\n        });\r\n    }\r\n    setDimensions(width, height, dpr = 0) {\r\n        this.setUniforms([width, height, dpr], 0);\r\n    }\r\n    setUniforms(values, offset) {\r\n        this.uniformBufferArray.set(values, offset); // time \r\n    }\r\n    updateUniformBuffer() {\r\n        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformBufferArray.buffer, this.uniformBufferArray.byteOffset, this.uniformBufferArray.byteLength);\r\n    }\r\n    pipelineDescriptor() {\r\n        const pipelineDescriptor = {\r\n            vertex: {\r\n                module: this.material.vertexShaderModule,\r\n                entryPoint: this.material.shader.vertexEntryPoint || 'main_vertex',\r\n                buffers: [this.geometry.vertexBufferLayout(0)]\r\n            },\r\n            fragment: {\r\n                module: this.material.fragmentShaderModule,\r\n                entryPoint: this.material.shader.fragmentEntryPoint || 'main_fragment',\r\n                targets: [{\r\n                        format: 'bgra8unorm'\r\n                    }]\r\n            },\r\n            // depthStencil: {\r\n            //     format: 'depth32float',\r\n            //     depthWriteEnabled: true,\r\n            //     depthCompare: 'less'\r\n            // },\r\n            primitive: {\r\n                topology: 'triangle-list',\r\n            },\r\n            layout: this.pipelineLayout\r\n        };\r\n        return pipelineDescriptor;\r\n    }\r\n}\r\nexports.Mesh = Mesh;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Mesh.js?");

/***/ }),

/***/ "./src/Renderer.js":
/*!*************************!*\
  !*** ./src/Renderer.js ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Renderer = void 0;\r\nconst Mesh_1 = __webpack_require__(/*! ./Mesh */ \"./src/Mesh.js\");\r\nconst TextureLoader_1 = __webpack_require__(/*! ./TextureLoader */ \"./src/TextureLoader.js\");\r\nclass Renderer {\r\n    constructor(canvas) {\r\n        this.canvas = canvas;\r\n        this.textures = new Array();\r\n    }\r\n    getDevice(config) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            const device = yield this.initializeAPI();\r\n            if (device) {\r\n                this.context = this.canvas.getContext('webgpu');\r\n                const presentationFormat = this.context.getPreferredFormat(this.adapter);\r\n                const canvasConfig = config || {\r\n                    device: this.device,\r\n                    format: presentationFormat,\r\n                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC\r\n                };\r\n                this.context.configure(canvasConfig);\r\n                return device;\r\n            }\r\n        });\r\n    }\r\n    initializeAPI() {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            try {\r\n                const entry = navigator.gpu;\r\n                if (!entry) {\r\n                    throw \"Cannot initalize WebGPU \";\r\n                }\r\n                this.adapter = yield entry.requestAdapter();\r\n                this.device = yield this.adapter.requestDevice();\r\n                this.queue = this.device.queue;\r\n            }\r\n            catch (e) {\r\n                throw \"Cannot initalize WebGPU \";\r\n            }\r\n            return this.device;\r\n        });\r\n    }\r\n    updateCustomUniform(index, value) {\r\n        this.mesh.uniformBufferArray.set(value, index);\r\n    }\r\n    initialize(geometry, material, texture, customUniforms, samplers) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            const dpr = window.devicePixelRatio || 1;\r\n            const uniforms = new Float32Array([this.canvas.width * dpr, this.canvas.height * dpr, dpr, 0]);\r\n            if (customUniforms) { // extend uniforms if custom is passed\r\n                uniforms.set(uniforms, 4);\r\n            }\r\n            for (let i = 0; i < texture.length; i++) {\r\n                this.textures.push(yield TextureLoader_1.TextureLoader.createTexture(this.device, texture[i]));\r\n            }\r\n            this.mesh = new Mesh_1.Mesh(this.device, geometry, material, uniforms, texture.length);\r\n            this.renderPipeline = this.device.createRenderPipeline(this.mesh.pipelineDescriptor());\r\n            const bindingGroupEntrys = [{\r\n                    binding: 0,\r\n                    resource: {\r\n                        buffer: this.mesh.uniformBuffer\r\n                    }\r\n                }];\r\n            let textureBindingOffset = (samplers ? samplers.length : 0);\r\n            // add a default sampler if there is textures passed \r\n            if (this.textures.length > 0 && !samplers) {\r\n                const sampler = this.device.createSampler({\r\n                    addressModeU: 'repeat',\r\n                    addressModeV: 'repeat',\r\n                    magFilter: 'linear',\r\n                    minFilter: 'nearest'\r\n                });\r\n                bindingGroupEntrys.push({\r\n                    binding: 1,\r\n                    resource: sampler\r\n                });\r\n                textureBindingOffset = 2;\r\n            }\r\n            else {\r\n                samplers.forEach((value, index) => {\r\n                    console.log(index);\r\n                    const sampler = this.device.createSampler(value);\r\n                    bindingGroupEntrys.push({\r\n                        binding: index + 1,\r\n                        resource: sampler\r\n                    });\r\n                    textureBindingOffset++;\r\n                });\r\n            }\r\n            console.log(textureBindingOffset, samplers);\r\n            this.textures.forEach((t, i) => {\r\n                const entry = {\r\n                    binding: i + textureBindingOffset,\r\n                    resource: t.createView()\r\n                };\r\n                bindingGroupEntrys.push(entry);\r\n            });\r\n            this.bindingGroup = this.device.createBindGroup({\r\n                layout: this.renderPipeline.getBindGroupLayout(0),\r\n                entries: bindingGroupEntrys,\r\n            });\r\n        });\r\n    }\r\n    draw(time) {\r\n        this.commandEncoder = this.device.createCommandEncoder();\r\n        const clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };\r\n        const renderPassDescriptor = {\r\n            colorAttachments: [{\r\n                    loadValue: clearColor,\r\n                    storeOp: 'store',\r\n                    view: this.context.getCurrentTexture().createView()\r\n                }]\r\n        };\r\n        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);\r\n        this.mesh.setUniforms([time], 3); // time\r\n        this.mesh.updateUniformBuffer();\r\n        passEncoder.setPipeline(this.renderPipeline);\r\n        passEncoder.setVertexBuffer(0, this.mesh.geometry.vertexBuffer);\r\n        passEncoder.setBindGroup(0, this.bindingGroup);\r\n        passEncoder.draw(6, 1, 0, 0);\r\n        passEncoder.endPass();\r\n        this.device.queue.submit([this.commandEncoder.finish()]);\r\n    }\r\n    start(t, maxFps = 200) {\r\n        let startTime = null;\r\n        let frame = -1;\r\n        const renderLoop = (timestamp) => {\r\n            if (!startTime)\r\n                startTime = timestamp;\r\n            let segment = Math.floor((timestamp - startTime) / (1000 / maxFps));\r\n            if (segment > frame) {\r\n                frame = segment;\r\n                this.frame = frame;\r\n                this.draw(timestamp / 1000);\r\n            }\r\n            if (!this.isPaused)\r\n                requestAnimationFrame(renderLoop);\r\n        };\r\n        renderLoop(t);\r\n    }\r\n    pause() {\r\n        this.isPaused = !this.isPaused;\r\n    }\r\n}\r\nexports.Renderer = Renderer;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Renderer.js?");

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