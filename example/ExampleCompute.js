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
const mainShader_1 = require("./shaders/compute/mainShader");
const ComputeRenderer_1 = require("../src/compute/ComputeRenderer");
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const fps = new yy_fps_1.FPS();
    const renderer = new ComputeRenderer_1.ComputeRenderer(document.querySelector("canvas"));
    yield renderer.init();
    renderer.addComputeRenderPass("iChannel0", computeRaymarchShader_1.computeRaymarchShader);
    const material = new Material_1.Material(renderer.device, mainShader_1.mainShader);
    renderer.addRenderPass(material);
    renderer.start(0, 200, (frame) => {
        fps.frame();
    });
}));
