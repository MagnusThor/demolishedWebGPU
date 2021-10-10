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
const cloud_1 = require("./shaders/cloud");
const rect_1 = require("./meshes/rect");
document.addEventListener("DOMContentLoaded", () => {
    const renderer = new Renderer_1.Renderer(document.querySelector('canvas'));
    renderer.getDevice().then((device) => __awaiter(void 0, void 0, void 0, function* () {
        const dpr = window.devicePixelRatio || 1;
        const geometry = new Geometry_1.Geometry(device, rect_1.rextVertexArray);
        const material = new Material_1.Material(device, cloud_1.cloudWglsl);
        const textures = [{
                key: "textureA",
                path: "/example/assets/channel0.jpg"
            },
            {
                key: "textureB",
                path: "/example/assets/channel1.jpg"
            }
        ];
        renderer.initialize(geometry, material, textures).then(() => {
            renderer.render();
        });
    }));
});
