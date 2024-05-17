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
const computeRaymarchShader_1 = require("./shaders/compute/computeRaymarchShader");
const yy_fps_1 = require("yy-fps");
const Material_1 = require("../src/Material");
const mainShader_1 = require("./shaders/shared/mainShader");
const ComputeRenderer_1 = require("../src/compute/ComputeRenderer");
const redColorShader_1 = require("./shaders/wglsl/redColorShader");
const Rectangle_1 = require("./meshes/Rectangle");
const Geometry_1 = require("../src/Geometry");
const blueColorShader_1 = require("./shaders/wglsl/blueColorShader");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    // const textures: Array<ITexture> = [
    //     {
    //       key: "iChannel1",
    //       source: "assets/noise.png", // ms 
    //       type: TextureType.IMAGE,
    //     }
    //  ];    
    const fps = new yy_fps_1.FPS();
    const renderer = new ComputeRenderer_1.ComputeRenderer(document.querySelector("canvas"));
    yield renderer.init();
    //await renderer.addComputeRenderPass("iChannel0", computeRaymarchShader,textures);
    const iChannel0Shader = new Material_1.Material(renderer.device, redColorShader_1.redColorShader);
    const iChannel1Shader = new Material_1.Material(renderer.device, blueColorShader_1.blueColorShader);
    const geometry = new Geometry_1.Geometry(renderer.device, Rectangle_1.rectGeometry);
    yield renderer.addRenderPass("iChannel0", iChannel0Shader, geometry).catch(err => {
        console.log(err);
    });
    yield renderer.addRenderPass("iChannel1", iChannel1Shader, geometry).catch(err => {
        console.log(err);
    });
    yield renderer.addComputeRenderPass("iChannel2", computeRaymarchShader_1.computeRaymarchShader, []);
    renderer.addMainPass(new Material_1.Material(renderer.device, mainShader_1.mainShader));
    renderer.start(0, 200, (frame) => {
        fps.frame();
    });
}));
