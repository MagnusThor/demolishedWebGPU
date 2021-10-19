"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seadragon = void 0;
class Seadragon {
    constructor(data) {
        const mesh = {
            positions: data.positions,
            triangles: data.cells,
            normals: [],
            uvs: [],
        };
        this.mesh = mesh;
    }
    generate() {
        // x,y,z,w,r,g,b,a,u,v,
        return new Float32Array([]);
    }
}
exports.Seadragon = Seadragon;
