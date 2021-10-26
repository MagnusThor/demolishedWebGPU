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
const Geometry_1 = require("../src/Geometry");
const Material_1 = require("../src/Material");
const Renderer_1 = require("../src/Renderer");
const texture_1 = require("./shaders/wglsl/texture");
const ITexture_1 = require("../src/ITexture");
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
    //const glsl = await glslang();
    //let compiledShader = glsl.compileGLSL(fractalShader.fragment as string, "fragment", false);
    //const myMaterial = Material.createMaterialShader(fractalShader.vertex, compiledShader, "main", "main");
    const material = new Material_1.Material(device, texture_1.showTextureShader);
    //const material = new Material(device, myMaterial);
    const geometry = new Geometry_1.Geometry(device, samples_1.rectGeometry);
    const samplers = [{
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'nearest' // linear sampler, binding 2, as uniforms is bound to 1    
        }];
    const textures = [
        //   {
        //   key: "textureA",
        //   source: "assets/channel0.jpg",
        //   type:0
        // },
        {
            key: "textureA",
            source: "assets/video.webm",
            type: ITexture_1.TextureType.video,
        },
        {
            key: "textureB",
            source: "assets/channel0.jpg",
            type: ITexture_1.TextureType.image
        },
    ];
    const scene = new Scene_1.Scene("myScene", device, canvas);
    yield scene.addAssets(textures, samplers);
    const mesh = new Mesh_1.Mesh(device, geometry, material, textures);
    scene.addMesh("myMesh", mesh);
    yield renderer.addScene(scene);
    renderer.start(0);
}));
