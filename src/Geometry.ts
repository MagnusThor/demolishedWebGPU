
export enum VERTEXType
{
        xyz = 3,
        xyzw = 4,
        xyzrgba =7,
        xyzwrgba = 8
}

export interface IGeometry {
    verticesType: VERTEXType
    vertices:Float32Array,
    indicies: Uint16Array,
    uvs?: Uint16Array,
    normals?: Uint16Array
}

export const DefaultIndicies = new Uint16Array([0,1,2,3,4,5]);

// let createBuffer = (arr: Float32Array | Uint16Array, usage: number) => {
//     let desc = {
//         size: (arr.byteLength + 3) & ~3,
//         usage,
//         mappedAtCreation: true
//     };
//     let buffer = this.device.createBuffer(desc);
//     const writeArray =
//         arr instanceof Uint16Array
//             ? new Uint16Array(buffer.getMappedRange())
//             : new Float32Array(buffer.getMappedRange());
//     writeArray.set(arr);
//     buffer.unmap();
//     return buffer;
//};

export class Geometry {
    vertexBuffer: GPUBuffer;
    numOfVerticles: number;
    indexBuffer: GPUBuffer;
    createBuffer(arr: Float32Array | Uint16Array, usage: number,vertexSize:number)   {
        
        let desc = {
            size: (arr.byteLength + vertexSize) & ~vertexSize,
            usage,
            mappedAtCreation: true
        };

        let buffer = this.device.createBuffer(desc);
        const writeArray =
            arr instanceof Uint16Array
                ? new Uint16Array(buffer.getMappedRange())
                : new Float32Array(buffer.getMappedRange());
        writeArray.set(arr);
        buffer.unmap();
        return buffer;
    }

    constructor(public device: GPUDevice, public model: IGeometry) {
        this.vertexBuffer = this.createBuffer(model.vertices,
                    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                    model.verticesType) ;

        this.indexBuffer = this.createBuffer(model.indicies,GPUBufferUsage.INDEX ,3);
        this.numOfVerticles = model.vertices.length / model.verticesType;


    }
    vertexBufferLayout(shaderLocation: number): GPUVertexBufferLayout {
        const vertexBufferLayout: GPUVertexBufferLayout = {
            attributes: [{
                shaderLocation: shaderLocation,
                offset: 0,
                format: 'float32x2'
            }],
            arrayStride:  4 * this.model.verticesType,
            stepMode: 'vertex'
        };
        return vertexBufferLayout;
    }
}
