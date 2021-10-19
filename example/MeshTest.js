"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestMesh = void 0;
const seadragon_1 = require("./meshes/seadragon");
const _4_1 = __importDefault(require("stanford-dragon/4"));
class TestMesh {
    constructor() {
        this.mesh = new seadragon_1.Seadragon(_4_1.default);
    }
}
exports.TestMesh = TestMesh;
document.addEventListener("DOMContentLoaded", () => {
    let m = new TestMesh();
    console.log(m);
});
