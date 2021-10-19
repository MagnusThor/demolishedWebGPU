

export class Seadragon {

    mesh: {
        positions: [number, number, number][];
        triangles: [number, number, number][];
        normals: [number, number, number][];
        uvs: [number, number][];
    };

    constructor(data: any) {
        const mesh = {
            positions: data.positions as [number, number, number][],
            triangles: data.cells as [number, number, number][],
            normals: [] as [number, number, number][],
            uvs: [] as [number, number][],
        };
        this.mesh = mesh;
    }

    generate(): Float32Array {
        // x,y,z,w,r,g,b,a,u,v,
        return new Float32Array([]);
    }

}