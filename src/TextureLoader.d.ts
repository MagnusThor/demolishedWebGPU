/// <reference types="dist" />
export interface ITexture {
    key: string;
    path: string;
}
export declare class TextureLoader {
    constructor();
    /**
     * Load and create an GPUTexture from an Image
     *
     * @static
     * @param {GPUDevice} device
     * @param {string} src
     * @return {*}  {Promise<GPUTexture>}
     * @memberof TextureLoader
     */
    static createTexture(device: GPUDevice, src: ITexture): Promise<GPUTexture>;
}
