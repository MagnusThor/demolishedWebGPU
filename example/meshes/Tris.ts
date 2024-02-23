import { IGeometry as Tris, VERTEXType } from "../../src/Geometry";
export const trisGeometry:Tris = {
     verticesType:VERTEXType.xyzwrgba,
        vertices: new Float32Array([
            -1, 0, 0, 1, 0, 1, 1, 1,
            -1, -1, 0, 1, 0, 1, 1, 1,
            1, -1, 0, 1, 0, 1, 1, 1,
            -1, 1, 0, 1, 0, 1, 1, 1,
            1, -1, 0, 1, 0, 1, 1, 1,
            1, 1, 0, 1, 0, 1, 1, 1,
        ]),
        indicies:new Uint16Array([ 5,4,3,2,1,0 ]),
}
