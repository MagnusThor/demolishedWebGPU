import { IGeometry, VERTEXType } from "../../src/Geometry";
export const rectGeometry:IGeometry = {
     verticesType:VERTEXType.xyzwrgba,
        vertices: new Float32Array([
            -1, 1, 0, 1, 0, 1, 1, 1,
            -1, -1, 0, 1, 0, 1, 1, 1,
            1, -1, 0, 1, 0, 1, 1, 1,
            -1, 1, 0, 1, 0, 1, 1, 1,
            1, -1, 0, 1, 0, 1, 1, 1,
            1, 1, 0, 1, 0, 1, 1, 1,
        ]),
        indicies:new Uint16Array([ 0, 1, 2,3,4,5, ]),
}