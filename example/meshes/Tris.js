"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trisGeometry = void 0;
const Geometry_1 = require("../../src/engine/Geometry");
exports.trisGeometry = {
    verticesType: Geometry_1.VERTEXType.xyzwrgba,
    vertices: new Float32Array([
        -1, 0, 0, 1, 0, 1, 1, 1,
        -1, -1, 0, 1, 0, 1, 1, 1,
        1, -1, 0, 1, 0, 1, 1, 1,
        -1, 1, 0, 1, 0, 1, 1, 1,
        1, -1, 0, 1, 0, 1, 1, 1,
        1, 1, 0, 1, 0, 1, 1, 1,
    ]),
    indicies: new Uint16Array([5, 4, 3, 2, 1, 0]),
};
