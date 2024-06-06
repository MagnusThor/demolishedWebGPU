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
const Renderer_1 = require("../src/engine/Renderer");
const ITexture_1 = require("../src/interface/ITexture");
const Rectangle_1 = require("./meshes/Rectangle");
const Material_1 = require("../src/engine/Material");
const Geometry_1 = require("../src/engine/Geometry");
const mainShader_1 = require("./shaders/shared/mainShader");
const blueColorShader_1 = require("./shaders/wglsl/blueColorShader");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const textures = [
        {
            key: "iChannel0",
            source: "assets/noise2.png", // ms 
            type: ITexture_1.TextureType.IMAGE,
        }
    ];
    const fps = new yy_fps_1.FPS();
    const renderer = new Renderer_1.Renderer(document.querySelector("canvas"));
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
    // add a frag shader ()
    // const mrange = new Material(renderer.device,mrangeShader);
    // await renderer.addRenderPass("iChannel",mrange,geometry).catch (err => {
    //     console.log(err);
    // });
    const material = new Material_1.Material(renderer.device, blueColorShader_1.blueColorShader);
    yield renderer.addRenderPass("iChannel0", material, geometry, textures).catch(err => {
        console.log(err);
    });
    //await renderer.addComputeRenderPass("iChannel0", microRayMarcherCompute,[]);
    renderer.addMainPass(new Material_1.Material(renderer.device, mainShader_1.mainShader));
    renderer.start(0, 200, (frame) => {
        fps.frame();
    });
}));
