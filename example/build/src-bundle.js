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

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst Geometry_1 = __webpack_require__(/*! ../src/Geometry */ \"./src/Geometry.js\");\r\nconst Material_1 = __webpack_require__(/*! ../src/Material */ \"./src/Material.js\");\r\nconst Renderer_1 = __webpack_require__(/*! ../src/Renderer */ \"./src/Renderer.js\");\r\nconst texture_1 = __webpack_require__(/*! ./shaders/wglsl/texture */ \"./example/shaders/wglsl/texture.js\");\r\nconst samples_1 = __webpack_require__(/*! ./meshes/samples */ \"./example/meshes/samples.js\");\r\nconst Scene_1 = __webpack_require__(/*! ../src/Scene */ \"./src/Scene.js\");\r\nconst Mesh_1 = __webpack_require__(/*! ../src/Mesh */ \"./src/Mesh.js\");\r\ndocument.addEventListener(\"DOMContentLoaded\", () => __awaiter(void 0, void 0, void 0, function* () {\r\n    const canvas = document.querySelector('canvas');\r\n    const renderer = new Renderer_1.Renderer(canvas);\r\n    const device = yield renderer.getDevice();\r\n    /*\r\n    glslang compile GLSL - > SPIR-V , in this case an fragmentshader in glsl version 4.5\r\n    */\r\n    //const glsl = await glslang();\r\n    //let compiledShader = glsl.compileGLSL(fractalShader.fragment as string, \"fragment\", false);\r\n    //const myMaterial = Material.createMaterialShader(fractalShader.vertex, compiledShader, \"main\", \"main\");\r\n    const material = new Material_1.Material(device, texture_1.showTextureShader);\r\n    //const material = new Material(device, myMaterial);\r\n    const geometry = new Geometry_1.Geometry(device, samples_1.rectGeometry);\r\n    const samplers = [{\r\n            addressModeU: 'repeat',\r\n            addressModeV: 'repeat',\r\n            magFilter: 'linear',\r\n            minFilter: 'nearest' // linear sampler, binding 2, as uniforms is bound to 1    \r\n        }];\r\n    const textures = [\r\n        //   {\r\n        //   key: \"textureA\",\r\n        //   source: \"assets/channel0.jpg\",\r\n        //   type:0\r\n        // },\r\n        {\r\n            key: \"textureA\",\r\n            source: \"assets/video.webm\",\r\n            type: 1,\r\n        },\r\n        {\r\n            key: \"textureB\",\r\n            source: \"assets/channel0.jpg\",\r\n            type: 0\r\n        },\r\n    ];\r\n    const scene = new Scene_1.Scene(\"myScene\", device, canvas);\r\n    yield scene.addAssets(textures, samplers);\r\n    const mesh = new Mesh_1.Mesh(device, geometry, material, textures);\r\n    scene.addMesh(\"myMesh\", mesh);\r\n    yield renderer.addScene(scene);\r\n    renderer.start(0);\r\n}));\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./example/Example.js?");

/***/ }),

/***/ "./example/meshes/samples.js":
/*!***********************************!*\
  !*** ./example/meshes/samples.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.rectGeometry = void 0;\r\nconst Geometry_1 = __webpack_require__(/*! ../../src/Geometry */ \"./src/Geometry.js\");\r\nexports.rectGeometry = {\r\n    verticesType: Geometry_1.VERTEXType.xyzwrgba,\r\n    vertices: new Float32Array([\r\n        -1, 1, 0, 1, 0, 1, 1, 1,\r\n        -1, -1, 0, 1, 0, 1, 1, 1,\r\n        1, -1, 0, 1, 0, 1, 1, 1,\r\n        -1, 1, 0, 1, 0, 1, 1, 1,\r\n        1, -1, 0, 1, 0, 1, 1, 1,\r\n        1, 1, 0, 1, 0, 1, 1, 1,\r\n    ]),\r\n    indicies: new Uint16Array([0, 1, 2, 3, 4, 5,]),\r\n};\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./example/meshes/samples.js?");

/***/ }),

/***/ "./example/shaders/wglsl/texture.js":
/*!******************************************!*\
  !*** ./example/shaders/wglsl/texture.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.showTextureShader = void 0;\r\nconst Material_1 = __webpack_require__(/*! ../../../src/Material */ \"./src/Material.js\");\r\nexports.showTextureShader = {\r\n    vertex: Material_1.defaultWglslVertex,\r\n    fragment: /* wgsl */ `\r\n  [[block]] struct Uniforms {\r\n    resolution: vec3<f32>;\r\n    time: f32;\r\n  };\r\n  [[group(0), binding(0)]] var<uniform> uniforms: Uniforms;\r\n  [[group(0), binding(1)]] var linearSampler: sampler;\r\n  [[group(0), binding(2)]] var textureA: texture_external;\r\n  [[group(0), binding(3)]] var textureB: texture_2d<f32>;\r\n  \r\n     \r\n  struct VertexOutput {\r\n    [[builtin(position)]] pos: vec4<f32>;\r\n    [[location(0)]] uv: vec2<f32>;\r\n  };  \r\n\r\n  fn main(fragCoord: vec2<f32>) -> vec4<f32> {\r\n    // display texture \r\n    return  textureSampleLevel(textureA, linearSampler, fragCoord);\r\n    //return vec4<f32>(1.0,0.0,0.0,1.0);//textureSample(textureB, linearSampler, fragCoord);\r\n  }\r\n  [[stage(fragment)]]\r\n  fn main_fragment(in: VertexOutput) -> [[location(0)]] vec4<f32> {      \r\n    return main(in.uv);\r\n}`\r\n};\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./example/shaders/wglsl/texture.js?");

/***/ }),

/***/ "./src/Geometry.js":
/*!*************************!*\
  !*** ./src/Geometry.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Geometry = exports.DefaultIndicies = exports.VERTEXType = void 0;\r\nvar VERTEXType;\r\n(function (VERTEXType) {\r\n    VERTEXType[VERTEXType[\"xyz\"] = 3] = \"xyz\";\r\n    VERTEXType[VERTEXType[\"xyzw\"] = 4] = \"xyzw\";\r\n    VERTEXType[VERTEXType[\"xyzrgba\"] = 7] = \"xyzrgba\";\r\n    VERTEXType[VERTEXType[\"xyzwrgba\"] = 8] = \"xyzwrgba\";\r\n})(VERTEXType = exports.VERTEXType || (exports.VERTEXType = {}));\r\nexports.DefaultIndicies = new Uint16Array([0, 1, 2, 3, 4, 5]);\r\n// let createBuffer = (arr: Float32Array | Uint16Array, usage: number) => {\r\n//     let desc = {\r\n//         size: (arr.byteLength + 3) & ~3,\r\n//         usage,\r\n//         mappedAtCreation: true\r\n//     };\r\n//     let buffer = this.device.createBuffer(desc);\r\n//     const writeArray =\r\n//         arr instanceof Uint16Array\r\n//             ? new Uint16Array(buffer.getMappedRange())\r\n//             : new Float32Array(buffer.getMappedRange());\r\n//     writeArray.set(arr);\r\n//     buffer.unmap();\r\n//     return buffer;\r\n//};\r\nclass Geometry {\r\n    constructor(device, model) {\r\n        this.device = device;\r\n        this.model = model;\r\n        this.vertexBuffer = this.createBuffer(model.vertices, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, model.verticesType);\r\n        this.indexBuffer = this.createBuffer(model.indicies, GPUBufferUsage.INDEX, 3);\r\n        this.numOfVerticles = model.vertices.length / model.verticesType;\r\n    }\r\n    createBuffer(arr, usage, vertexSize) {\r\n        let desc = {\r\n            size: (arr.byteLength + vertexSize) & ~vertexSize,\r\n            usage,\r\n            mappedAtCreation: true\r\n        };\r\n        let buffer = this.device.createBuffer(desc);\r\n        const writeArray = arr instanceof Uint16Array\r\n            ? new Uint16Array(buffer.getMappedRange())\r\n            : new Float32Array(buffer.getMappedRange());\r\n        writeArray.set(arr);\r\n        buffer.unmap();\r\n        return buffer;\r\n    }\r\n    vertexBufferLayout(shaderLocation) {\r\n        const vertexBufferLayout = {\r\n            attributes: [{\r\n                    shaderLocation: shaderLocation,\r\n                    offset: 0,\r\n                    format: 'float32x2'\r\n                }],\r\n            arrayStride: 4 * this.model.verticesType,\r\n            stepMode: 'vertex'\r\n        };\r\n        return vertexBufferLayout;\r\n    }\r\n}\r\nexports.Geometry = Geometry;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Geometry.js?");

/***/ }),

/***/ "./src/Material.js":
/*!*************************!*\
  !*** ./src/Material.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Material = exports.defaultWglslVertex = void 0;\r\nexports.defaultWglslVertex = `  \r\nstruct VertexInput {\r\n  [[location(0)]] pos: vec2<f32>;\r\n};  \r\nstruct VertexOutput {\r\n  [[builtin(position)]] pos: vec4<f32>;\r\n  [[location(0)]] uv: vec2<f32>;\r\n};  \r\n[[stage(vertex)]]\r\nfn main_vertex(input: VertexInput) -> VertexOutput {\r\n  var output: VertexOutput;\r\n  var pos: vec2<f32> = input.pos * 2.0 - 1.0;\r\n  output.pos = vec4<f32>(pos, 0.0, 1.0);\r\n  output.uv = input.pos;\r\n  return output;\r\n}`;\r\nclass Material {\r\n    constructor(device, shader) {\r\n        this.device = device;\r\n        this.shader = shader;\r\n        this.vertexShaderModule = this.device.createShaderModule({\r\n            code: shader.vertex,\r\n        });\r\n        this.fragmentShaderModule = this.device.createShaderModule({\r\n            code: shader.fragment\r\n        });\r\n    }\r\n    static createMaterialShader(spirvVert, spirvFrag, vertexEntryPoint, fragmentEntryPoint) {\r\n        const material = {\r\n            fragment: spirvFrag,\r\n            fragmentEntryPoint: fragmentEntryPoint,\r\n            vertex: spirvVert,\r\n            vertexEntryPoint: vertexEntryPoint\r\n        };\r\n        return material;\r\n    }\r\n}\r\nexports.Material = Material;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Material.js?");

/***/ }),

/***/ "./src/Mesh.js":
/*!*********************!*\
  !*** ./src/Mesh.js ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Mesh = void 0;\r\nclass Mesh {\r\n    constructor(device, geometry, material, textures) {\r\n        this.device = device;\r\n        this.geometry = geometry;\r\n        this.material = material;\r\n        const layoutEntrys = [\r\n            {\r\n                binding: 0,\r\n                visibility: window.GPUShaderStage.FRAGMENT,\r\n                buffer: {\r\n                    type: \"uniform\"\r\n                }\r\n            }\r\n        ];\r\n        if (textures.length > 0) {\r\n            layoutEntrys.push({\r\n                binding: 1,\r\n                visibility: window.GPUShaderStage.FRAGMENT,\r\n                sampler: {\r\n                    type: \"filtering\"\r\n                }\r\n            });\r\n            for (let i = 0; i < textures.length; i++) {\r\n                if (textures[i].type === 0) {\r\n                    layoutEntrys.push({\r\n                        binding: 2 + i,\r\n                        visibility: window.GPUShaderStage.FRAGMENT,\r\n                        texture: {\r\n                            sampleType: \"float\"\r\n                        }\r\n                    });\r\n                }\r\n                else {\r\n                    layoutEntrys.push({\r\n                        binding: 2 + i,\r\n                        visibility: window.GPUShaderStage.FRAGMENT,\r\n                        externalTexture: {}\r\n                    });\r\n                }\r\n            }\r\n        }\r\n        this.bindGroupLayout = this.device.createBindGroupLayout({\r\n            entries: layoutEntrys\r\n        });\r\n        this.pipelineLayout = this.device.createPipelineLayout({\r\n            bindGroupLayouts: [this.bindGroupLayout],\r\n        });\r\n    }\r\n    pipelineDescriptor() {\r\n        const pipelineDescriptor = {\r\n            vertex: {\r\n                module: this.material.vertexShaderModule,\r\n                entryPoint: this.material.shader.vertexEntryPoint || 'main_vertex',\r\n                buffers: [this.geometry.vertexBufferLayout(0)]\r\n            },\r\n            fragment: {\r\n                module: this.material.fragmentShaderModule,\r\n                entryPoint: this.material.shader.fragmentEntryPoint || 'main_fragment',\r\n                targets: [{\r\n                        format: 'bgra8unorm'\r\n                    }]\r\n            },\r\n            // depthStencil: {\r\n            //     format: 'depth32float',\r\n            //     depthWriteEnabled: true,\r\n            //     depthCompare: 'less'\r\n            // },\r\n            primitive: {\r\n                topology: 'triangle-list',\r\n            },\r\n            layout: this.pipelineLayout\r\n        };\r\n        return pipelineDescriptor;\r\n    }\r\n}\r\nexports.Mesh = Mesh;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Mesh.js?");

/***/ }),

/***/ "./src/Renderer.js":
/*!*************************!*\
  !*** ./src/Renderer.js ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Renderer = void 0;\r\nclass Renderer {\r\n    //uniforms: Float32Array;\r\n    constructor(canvas) {\r\n        //  this.textures = new Array<GPUTexture>();\r\n        this.canvas = canvas;\r\n    }\r\n    getDevice(config) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            const device = yield this.initializeAPI();\r\n            if (device) {\r\n                this.context = this.canvas.getContext('webgpu');\r\n                const presentationFormat = this.context.getPreferredFormat(this.adapter);\r\n                const canvasConfig = config || {\r\n                    device: this.device,\r\n                    format: presentationFormat,\r\n                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC\r\n                };\r\n                this.context.configure(canvasConfig);\r\n                return device;\r\n            }\r\n        });\r\n    }\r\n    initializeAPI() {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            try {\r\n                const entry = navigator.gpu;\r\n                if (!entry) {\r\n                    throw \"Cannot initalize WebGPU \";\r\n                }\r\n                this.adapter = yield entry.requestAdapter();\r\n                this.device = yield this.adapter.requestDevice();\r\n                this.queue = this.device.queue;\r\n            }\r\n            catch (e) {\r\n                throw \"Cannot initalize WebGPU \";\r\n            }\r\n            return this.device;\r\n        });\r\n    }\r\n    // updateCustomUniform(index:number,value:Float32Array){\r\n    //     this.scene.mesh.uniformBufferArray.set(value,index)\r\n    // }\r\n    //async initialize(geometry:Geometry,material:Material,texture?:Array<ITexture>,customUniforms?:Float32Array,samplers?:Array<GPUSamplerDescriptor>): Promise<void> {\r\n    addScene(scene) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            this.scene = scene;\r\n            // if(scene.customUniforms){ // extend uniforms if custom is passeds\r\n            //         uniforms.set(uniforms,4)\r\n            // }        \r\n            //  const mesh = scene.getMesh();\r\n            this.renderPipeline = this.device.createRenderPipeline(this.scene.getMesh().pipelineDescriptor());\r\n        });\r\n    }\r\n    draw(time) {\r\n        this.bindingGroup = this.device.createBindGroup({\r\n            layout: this.renderPipeline.getBindGroupLayout(0),\r\n            entries: this.scene.getBindingGroupEntrys(),\r\n        });\r\n        this.commandEncoder = this.device.createCommandEncoder();\r\n        const textureView = this.context.getCurrentTexture().createView();\r\n        const clearColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };\r\n        const renderPassDescriptor = {\r\n            colorAttachments: [{\r\n                    loadValue: clearColor,\r\n                    storeOp: 'store',\r\n                    view: textureView\r\n                }]\r\n        };\r\n        const passEncoder = this.commandEncoder.beginRenderPass(renderPassDescriptor);\r\n        this.scene.setUniforms([time], 3); // time\r\n        this.scene.updateUniformBuffer();\r\n        passEncoder.setPipeline(this.renderPipeline);\r\n        passEncoder.setVertexBuffer(0, this.scene.getMesh().geometry.vertexBuffer);\r\n        passEncoder.setBindGroup(0, this.bindingGroup);\r\n        passEncoder.setIndexBuffer(this.scene.getMesh().geometry.indexBuffer, 'uint16');\r\n        passEncoder.drawIndexed(this.scene.getMesh().geometry.numOfVerticles, 1);\r\n        //passEncoder.draw(6, 1, 0, 0);\r\n        passEncoder.endPass();\r\n        this.device.queue.submit([this.commandEncoder.finish()]);\r\n    }\r\n    start(t, maxFps = 200) {\r\n        let startTime = null;\r\n        let frame = -1;\r\n        const renderLoop = (timestamp) => {\r\n            if (!startTime)\r\n                startTime = timestamp;\r\n            let segment = Math.floor((timestamp - startTime) / (1000 / maxFps));\r\n            if (segment > frame) {\r\n                frame = segment;\r\n                this.frame = frame;\r\n                this.draw(timestamp / 1000);\r\n            }\r\n            if (!this.isPaused)\r\n                requestAnimationFrame(renderLoop);\r\n        };\r\n        renderLoop(t);\r\n    }\r\n    pause() {\r\n        this.isPaused = !this.isPaused;\r\n    }\r\n}\r\nexports.Renderer = Renderer;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Renderer.js?");

/***/ }),

/***/ "./src/Scene.js":
/*!**********************!*\
  !*** ./src/Scene.js ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Scene = exports.TextureCache = void 0;\r\nconst TextureLoader_1 = __webpack_require__(/*! ./TextureLoader */ \"./src/TextureLoader.js\");\r\nclass TextureCache {\r\n    constructor() {\r\n        this.entities = new Map();\r\n    }\r\n}\r\nexports.TextureCache = TextureCache;\r\nclass Scene {\r\n    constructor(key, device, canvas) {\r\n        this.key = key;\r\n        this.device = device;\r\n        this.canvas = canvas;\r\n        this.meshes = new Map();\r\n        this.textures = new Array();\r\n        this.bindingGroupEntrys = new Array();\r\n        const dpr = window.devicePixelRatio || 1;\r\n        this.uniformBuffer = this.device.createBuffer({\r\n            size: 40,\r\n            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST,\r\n        });\r\n        this.uniformBufferArray = new Float32Array([this.canvas.width * dpr, this.canvas.height * dpr, dpr, 0]);\r\n        ;\r\n        this.updateUniformBuffer();\r\n    }\r\n    getMesh(index = 0) {\r\n        return Array.from(this.meshes.values())[index];\r\n    }\r\n    setDimensions(width, height, dpr = 0) {\r\n        this.setUniforms([width, height, dpr], 0);\r\n    }\r\n    setUniforms(values, offset) {\r\n        this.uniformBufferArray.set(values, offset); // time \r\n    }\r\n    updateUniformBuffer() {\r\n        this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformBufferArray.buffer, this.uniformBufferArray.byteOffset, this.uniformBufferArray.byteLength);\r\n    }\r\n    getBindingGroupEntrys() {\r\n        const bindingGroupEntrys = [];\r\n        bindingGroupEntrys.push({\r\n            binding: 0,\r\n            resource: {\r\n                buffer: this.uniformBuffer\r\n            }\r\n        });\r\n        const sampler = this.device.createSampler({\r\n            addressModeU: 'repeat',\r\n            addressModeV: 'repeat',\r\n            magFilter: 'linear',\r\n            minFilter: 'nearest'\r\n        });\r\n        // add the a sampler\r\n        bindingGroupEntrys.push({\r\n            binding: 1,\r\n            resource: sampler\r\n        });\r\n        this.textures.forEach((t, i) => {\r\n            let entry;\r\n            if (t.type === 0) {\r\n                entry = {\r\n                    binding: i + 2,\r\n                    resource: t.data.createView()\r\n                };\r\n            }\r\n            else {\r\n                entry = {\r\n                    binding: i + 2,\r\n                    resource: this.device.importExternalTexture({ source: t.data }),\r\n                };\r\n            }\r\n            bindingGroupEntrys.push(entry);\r\n        });\r\n        return bindingGroupEntrys;\r\n    }\r\n    addAssets(textures, samplers) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            for (let i = 0; i < textures.length; i++) {\r\n                const texture = textures[i];\r\n                if (texture.type == 0) {\r\n                    this.textures.push({ type: 0, data: yield TextureLoader_1.TextureLoader.createImageTexture(this.device, texture) });\r\n                }\r\n                else\r\n                    this.textures.push({ type: 1, data: yield TextureLoader_1.TextureLoader.createVideoTextue(this.device, texture) });\r\n            }\r\n            this.bindingGroupEntrys = [{\r\n                    binding: 0,\r\n                    resource: {\r\n                        buffer: this.uniformBuffer\r\n                    }\r\n                }];\r\n            let textureBindingOffset = (samplers ? samplers.length : 0);\r\n            if (this.textures.length > 0 && !samplers) {\r\n                const sampler = this.device.createSampler({\r\n                    addressModeU: 'repeat',\r\n                    addressModeV: 'repeat',\r\n                    magFilter: 'linear',\r\n                    minFilter: 'nearest'\r\n                });\r\n                this.bindingGroupEntrys.push({\r\n                    binding: 1,\r\n                    resource: sampler\r\n                });\r\n                textureBindingOffset = 2;\r\n            }\r\n            else {\r\n                samplers.forEach((value, index) => {\r\n                    const sampler = this.device.createSampler(value);\r\n                    this.bindingGroupEntrys.push({\r\n                        binding: index + 1,\r\n                        resource: sampler\r\n                    });\r\n                    textureBindingOffset++;\r\n                });\r\n            }\r\n            this.textures.forEach((t, i) => {\r\n                let entry;\r\n                if (t.type === 0) {\r\n                    entry = {\r\n                        binding: i + textureBindingOffset,\r\n                        resource: t.data.createView()\r\n                    };\r\n                }\r\n                else {\r\n                    entry = {\r\n                        binding: i + textureBindingOffset,\r\n                        resource: this.device.importExternalTexture({ source: t.data })\r\n                    };\r\n                }\r\n                this.bindingGroupEntrys.push(entry);\r\n            });\r\n        });\r\n    }\r\n    addMesh(key, mesh) {\r\n        this.meshes.set(key, mesh);\r\n    }\r\n    removeMesh(key) {\r\n        return this.meshes.delete(key);\r\n    }\r\n}\r\nexports.Scene = Scene;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/Scene.js?");

/***/ }),

/***/ "./src/TextureLoader.js":
/*!******************************!*\
  !*** ./src/TextureLoader.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.TextureLoader = void 0;\r\nclass TextureLoader {\r\n    constructor() {\r\n    }\r\n    /**\r\n     * Load and create an GPUTexture from an Image\r\n     *\r\n     * @static\r\n     * @param {GPUDevice} device\r\n     * @param {string} texture\r\n     * @return {*}  {Promise<GPUTexture>}\r\n     * @memberof TextureLoader\r\n     */\r\n    static createImageTexture(device, texture) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            const image = new Image();\r\n            image.src = texture.source;\r\n            yield image.decode();\r\n            const imageBitmap = yield createImageBitmap(image);\r\n            const textureSize = { width: image.width, height: image.height };\r\n            const gpuTexture = device.createTexture({\r\n                label: texture.key,\r\n                size: textureSize,\r\n                dimension: '2d',\r\n                format: 'rgba8unorm',\r\n                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING\r\n            });\r\n            device.queue.copyExternalImageToTexture({\r\n                source: imageBitmap\r\n            }, {\r\n                texture: gpuTexture,\r\n                mipLevel: 0\r\n            }, textureSize);\r\n            return gpuTexture;\r\n        });\r\n    }\r\n    static createVideoTextue(device, texture) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            const video = document.createElement(\"video\");\r\n            video.loop = true;\r\n            video.autoplay = true;\r\n            video.muted = true;\r\n            video.src = texture.source;\r\n            yield video.play();\r\n            return video;\r\n            // const descriptor:GPUExternalTextureDescriptor = {\r\n            //     source: video\r\n            // };\r\n            // const externalTexture =  device.importExternalTexture(descriptor);\r\n            // return externalTexture;\r\n        });\r\n    }\r\n}\r\nexports.TextureLoader = TextureLoader;\r\n\n\n//# sourceURL=webpack://demolishedwebgpu/./src/TextureLoader.js?");

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