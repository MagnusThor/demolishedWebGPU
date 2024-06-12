
export class Uniforms {

    uniformBufferArray: Float32Array;
    uniformBuffer: GPUBuffer;

    static initialize(w:number,h:number){
        return new Float32Array([w, h, 0, 1,0,0,0,0,0,0]);

    }

    constructor(public device: GPUDevice, canvas: HTMLCanvasElement) {
        this.uniformBuffer = this.device.createBuffer({
            size: 60,
            usage: window.GPUBufferUsage.UNIFORM | window.GPUBufferUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.uniformBufferArray = new Float32Array([canvas.width, canvas.height, 0, 1,0,0,0,0,0,0])
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
