"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rectGeometry = void 0;
const Geometry_1 = require("../../src/Geometry");
exports.rectGeometry = {
    verticesType: Geometry_1.VERTEXType.xyz,
    vertices: new Float32Array([
        -1, 1, 0,
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
        -1, 1, 0,
        1, -1, 0,
    ]),
    indicies: new Uint16Array([0, 1, 2, 3, 4, 5,]),
};
