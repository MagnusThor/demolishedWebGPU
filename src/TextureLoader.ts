import { ITexture } from "./ITexture";
export class TextureLoader {
    constructor(){
    }
    /**
     * Load and create an GPUTexture from an Image 
     *
     * @static
     * @param {GPUDevice} device
     * @param {string} src
     * @return {*}  {Promise<GPUTexture>}
     * @memberof TextureLoader
     */
    static async createTexture(device: GPUDevice, src: ITexture):Promise<GPUTexture> {
        const image = new Image();
        image.src = src.path;
        await image.decode();
        const imageBitmap = await createImageBitmap(image);
        const textureSize = { width: image.width, height: image.height };
        const texture = device.createTexture({
            label:src.key,
            size: textureSize,
            dimension: '2d',
            format: 'rgba8unorm',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT |  GPUTextureUsage.TEXTURE_BINDING
        });
        device.queue.copyExternalImageToTexture({
            source: imageBitmap
        }, {
            texture: texture,
            mipLevel: 0
        },
        textureSize);
        return texture;
    }
}