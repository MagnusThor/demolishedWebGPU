import { IGeometry, VERTEXType } from "../../src/Geometry";
export const rectGeometry:IGeometry = {
     verticesType:VERTEXType.xyz,
        vertices: new Float32Array([
            -1, 1, 0, 
            -1, -1, 0,
            1, -1, 0, 
            1, 1, 0, 
            -1, 1, 0,
            1, -1, 0,
        ]),
        indicies:new Uint16Array([ 0, 1, 2,3,4,5, ]),
}
