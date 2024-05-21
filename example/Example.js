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
const yy_fps_1 = require("yy-fps");
const ComputeRenderer_1 = require("../src/engine/ComputeRenderer");
const ITexture_1 = require("../src/interface/ITexture");
const raytracedRollingBallShader_1 = require("./shaders/wglsl/raytracedRollingBallShader");
const Rectangle_1 = require("./meshes/Rectangle");
const customMainShader_1 = require("./shaders/shared/customMainShader");
const Material_1 = require("../src/engine/Material");
const Geometry_1 = require("../src/engine/Geometry");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const textures = [
        {
            key: "iChannel0",
            source: "assets/noise2.png", // ms 
            type: ITexture_1.TextureType.IMAGE,
        }
    ];
    const fps = new yy_fps_1.FPS();
    const renderer = new ComputeRenderer_1.ComputeRenderer(document.querySelector("canvas"));
    yield renderer.init();
    const geometry = new Geometry_1.Geometry(renderer.device, Rectangle_1.rectGeometry);
    // add a frag shader ()
    // const iChannel0Shader = new Material(renderer.device,redColorShader);
    // await renderer.addRenderPass("iChannel0",iChannel0Shader,geometry,textures).catch (err => {
    //     console.log(err);
    // });
    // add a frag shader ()
    //const iChannel1Shader = new Material(renderer.device,blueColorShader);
    // await renderer.addRenderPass("iChannel1",iChannel1Shader,geometry).catch (err => {
    //     console.log(err);
    // });
    const material = new Material_1.Material(renderer.device, raytracedRollingBallShader_1.raytracedRollingBallShader);
    yield renderer.addRenderPass("iChannel0", material, geometry, textures).catch(err => {
        console.log(err);
    });
    // add a compte shader ( )
    //await renderer.addComputeRenderPass("iChannel2", computeRaymarchShader,[]);
    renderer.addMainPass(new Material_1.Material(renderer.device, customMainShader_1.customMainShader));
    renderer.start(0, 200, (frame) => {
        fps.frame();
    });
}));
