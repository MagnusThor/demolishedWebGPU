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
const rect_1 = require("./meshes/rect");
const cloud_1 = require("./shaders/wglsl/cloud");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const renderer = new Renderer_1.Renderer(document.querySelector('canvas'));
    const device = yield renderer.getDevice();
    /*
          glslang compile GLSL - > SPIR-V , in this case an fragmentshader in glsl version 4.5
    */
    //const glsl = await glslang();
    //let compiledShader = glsl.compileGLSL(fractalShader.fragment as string, "fragment", false);
    //const myMaterial = Material.createMaterialShader(fractalShader.vertex, compiledShader, "main", "main");
    const material = new Material_1.Material(device, cloud_1.cloudShader);
    const geometry = new Geometry_1.Geometry(device, rect_1.rectVertexArray);
    const textures = [{
            key: "textureA",
            path: "/example/assets/channel0.jpg"
        },
        {
            key: "textureB",
            path: "/example/assets/channel1.jpg"
        }
    ];
    yield renderer.initialize(geometry, material, textures);
    renderer.render();
}));
