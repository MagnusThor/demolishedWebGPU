export class Material {
    shaderModule: GPUShaderModule;
    constructor(public device: GPUDevice, wglsl: string) {
        this.shaderModule = this.device.createShaderModule({
            code: wglsl
        });
    }
}
