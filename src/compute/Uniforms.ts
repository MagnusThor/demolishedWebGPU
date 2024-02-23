
export class Uniforms {

    uniformBufferArray: Float32Array;
    uniformBuffer: GPUBuffer;

    constructor(public device: GPUDevice, canvas: HTMLCanvasElement) {
        this.uniformBuffer = this.device.createBuffer({
            size: 40,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.uniformBufferArray = new Float32Array([canvas.width, canvas.height, 0, 1]);
    }

    setUniforms(values: ArrayLike<number>, offset: number) {
        this.uniformBufferArray.set(values, offset); // time 
    }

    updateUniformBuffer() {
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            this.uniformBufferArray.buffer,
            this.uniformBufferArray.byteOffset,
            this.uniformBufferArray.byteLength
        );
    }
}
