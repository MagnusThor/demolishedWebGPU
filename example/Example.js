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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Geometry_1 = require("../src/Geometry");
const Material_1 = require("../src/Material");
const Renderer_1 = require("../src/Renderer");
const glslang_1 = __importDefault(require("./libs/glslang"));
const fractal_1 = require("./shaders/glsl/fractal");
const samples_1 = require("./meshes/samples");
const Scene_1 = require("../src/Scene");
const Mesh_1 = require("../src/Mesh");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const canvas = document.querySelector('canvas');
    const renderer = new Renderer_1.Renderer(canvas);
    const device = yield renderer.getDevice();
    /*
          glslang compile GLSL - > SPIR-V , in this case an fragmentshader in glsl version 4.5
    */
    const glsl = yield glslang_1.default();
    let compiledShader = glsl.compileGLSL(fractal_1.fractalShader.fragment, "fragment", false);
    const myMaterial = Material_1.Material.createMaterialShader(fractal_1.fractalShader.vertex, compiledShader, "main", "main");
    //const material = new Material(device, cloudShader);
    const material = new Material_1.Material(device, myMaterial);
    const geometry = new Geometry_1.Geometry(device, samples_1.rectGeometry);
    const samplers = [{
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest' // linear sampler, binding 2, as uniforms is bound to 1    
        }];
    const textures = [{
            key: "textureA",
            path: "assets/channel0.jpg"
        },
        {
            key: "textureB",
            path: "assets/channel1.jpg"
        }
    ];
    const scene = new Scene_1.Scene("example", device, canvas);
    const mesh = new Mesh_1.Mesh(device, geometry, material, textures.length);
    scene.addMesh("example", mesh);
    yield scene.build("example", undefined, textures, samplers);
    yield renderer.addScene(scene);
    renderer.start(0);
}));
