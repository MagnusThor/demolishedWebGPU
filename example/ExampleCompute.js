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
const Rectangle_1 = require("./meshes/Rectangle");
const Material_1 = require("../src/Material");
const Geometry_1 = require("../src/Geometry");
const mainShader_1 = require("./shaders/compute/mainShader");
const Engine_1 = require("../src/compute/Engine");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const fps = new yy_fps_1.FPS();
    const renderer = new Engine_1.MyRenderer(document.querySelector("canvas"));
    yield renderer.init();
    renderer.addComputeRenderPass("iChannel0", computeRaymarchShader_1.computeRaymarchShader);
    const material = new Material_1.Material(renderer.device, mainShader_1.mainShader);
    const geometry = new Geometry_1.Geometry(renderer.device, Rectangle_1.rectGeometry);
    renderer.addRenderPass(material, geometry);
    renderer.start(0, 200, (frame) => {
        fps.frame();
    });
}));
