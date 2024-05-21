"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureLoader = void 0;
class TextureLoader {
    constructor() {
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
    static createImageTexture(device, texture) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = new Image();
            image.src = texture.source;
            yield image.decode();
            const imageBitmap = yield createImageBitmap(image);
            const textureSize = { width: image.width, height: image.height };
            const gpuTexture = device.createTexture({
                label: texture.key,
                size: textureSize,
                dimension: '2d',
                format: 'rgba8unorm',
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            });
            device.queue.copyExternalImageToTexture({
                source: imageBitmap
            }, {
                texture: gpuTexture,
                mipLevel: 0
            }, textureSize);
            return gpuTexture;
        });
    }
    static createVideoTextue(device, texture) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = document.createElement("video");
            video.loop = true;
            video.autoplay = true;
            video.muted = true;
            if (texture.source instanceof MediaStream) {
                video.srcObject = texture.source;
            }
            else
                video.src = texture.source;
            yield video.play();
            return video;
        });
    }
}
exports.TextureLoader = TextureLoader;
