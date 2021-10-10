export class Geometry {
    vertexBuffer: GPUBuffer;
    numOfVerticles: number;
    constructor(public device: GPUDevice, public vertices: Float32Array) {
        this.vertexBuffer = this.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        this.numOfVerticles = vertices.length / 4;
        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
        this.vertexBuffer.unmap();

    }
    vertexBufferLayout(shaderLocation: number): GPUVertexBufferLayout {
        const vertexBufferLayout: GPUVertexBufferLayout = {
            attributes: [{
                shaderLocation: shaderLocation,
                offset: 0,
                format: 'float32x2'
            }],
            arrayStride: 32,
            stepMode: 'vertex'
        };
        return vertexBufferLayout;
    }
}
