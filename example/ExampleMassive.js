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
const ITexture_1 = require("../src/ITexture");
const Rectangle_1 = require("./meshes/Rectangle");
const Scene_1 = require("../src/Scene");
const Mesh_1 = require("../src/Mesh");
const yy_fps_1 = require("yy-fps");
const flamesShader_1 = require("./shaders/wglsl/flamesShader");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const canvas = document.querySelector('canvas');
    const fps = new yy_fps_1.FPS();
    const renderer = new Renderer_1.Renderer(canvas);
    const device = yield renderer.getDevice();
    const scene = new Scene_1.Scene("myScene", device, canvas);
    const material = new Material_1.Material(device, flamesShader_1.flamesShader);
    const geometry = new Geometry_1.Geometry(device, Rectangle_1.rectGeometry);
    const textures = [
        {
            key: "iChannel0",
            source: "assets/noise2  .png", // ms 
            type: ITexture_1.TextureType.IMAGE,
        },
        {
            key: "iChannel1",
            source: "assets/channel1.jpg",
            type: ITexture_1.TextureType.IMAGE
        },
    ];
    const mesh = new Mesh_1.Mesh(device, geometry, material, [textures[0], textures[1]]);
    yield scene.addAssets(textures);
    scene.addMesh("myMesh", mesh);
    yield renderer.addScene(scene);
    renderer.start(0, 200, (frameNo) => {
        fps.frame();
    });
}));
