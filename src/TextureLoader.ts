import { ITexture } from "./ITexture";
export class TextureLoader {
    constructor(){
    }
    /**
     * Load and create an GPUTexture from an Image 
     *
     * @static
     * @param {GPUDevice} device
     * @param {string} texture
     * @return {*}  {Promise<GPUTexture>}
     * @memberof TextureLoader
     */
    static async createImageTexture(device: GPUDevice, texture: ITexture):Promise<GPUTexture> {

        const image = new Image();
        image.src = texture.source;
        await image.decode();
        
        const imageBitmap = await createImageBitmap(image);
        const textureSize = { width: image.width, height: image.height };


        const gpuTexture = device.createTexture({
            label:texture.key,
            size: textureSize,
            dimension: '2d',
            format: 'rgba8unorm',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT |  GPUTextureUsage.TEXTURE_BINDING
        });
        device.queue.copyExternalImageToTexture({
            source: imageBitmap
        }, {
            texture: gpuTexture,
            mipLevel: 0
        },
        textureSize);

        return gpuTexture;
    }
    static async createVideoTextue(device: GPUDevice , texture:ITexture):Promise<HTMLVideoElement>{
      
        const video = document.createElement("video") as HTMLVideoElement;

        video.loop = true;
        video.autoplay = true;
        video.muted = true;

        video.src = texture.source;

        await video.play();

        return video;
    
        // const descriptor:GPUExternalTextureDescriptor = {
        //     source: video
        // };
        // const externalTexture =  device.importExternalTexture(descriptor);
        // return externalTexture;

    }
}