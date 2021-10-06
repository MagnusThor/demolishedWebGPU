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
//import { cloudWglsl } from "./shaders/cloud";
const plasma_1 = require("./shaders/plasma");
document.addEventListener("DOMContentLoaded", () => {
    const renderer = new Renderer_1.Renderer(document.querySelector('canvas'));
    renderer.getDevice().then((device) => __awaiter(void 0, void 0, void 0, function* () {
        const vertices = new Float32Array([
            -1, 1, 0, 1, 0, 1, 1, 1,
            -1, -1, 0, 1, 0, 1, 1, 1,
            1, -1, 0, 1, 0, 1, 1, 1,
            -1, 1, 0, 1, 0, 1, 1, 1,
            1, -1, 0, 1, 0, 1, 1, 1,
            1, 1, 0, 1, 0, 1, 1, 1,
        ]);
        // width,height,devicePixelRatio,time 
        const uniforms = new Float32Array([renderer.canvas.width, renderer.canvas.height, devicePixelRatio, 0]);
        const geometry = new Geometry_1.Geometry(device, vertices); // quad ( two triangles)
        const material = new Material_1.Material(device, plasma_1.plasmaWglsl);
        renderer.initialize(geometry, material, uniforms).then(() => {
            renderer.render();
        });
    }));
});
