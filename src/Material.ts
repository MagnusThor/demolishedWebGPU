export class Material {
    shaderModule: GPUShaderModule;
    constructor(public device: GPUDevice, wglsl: string,glslang?:any) {
        
        this.shaderModule = this.device.createShaderModule({
            code: wglsl
        });

    }
}
