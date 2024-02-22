
export class MyComputeShader {
    public shaderModule: GPUShaderModule;
    constructor(public device: GPUDevice, computeShaderCode: string) {
        this.shaderModule = this.device.createShaderModule(
            { code: computeShaderCode });
    }
}
