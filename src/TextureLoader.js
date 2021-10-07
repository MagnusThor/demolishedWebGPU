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
     * @param {string} src
     * @return {*}  {Promise<GPUTexture>}
     * @memberof TextureLoader
     */
    static createTexture(device, src) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = new Image();
            image.src = src.path;
            yield image.decode();
            const imageBitmap = yield createImageBitmap(image);
            const textureSize = { width: image.width, height: image.height };
            const texture = device.createTexture({
                label: src.key,
                size: textureSize,
                dimension: '2d',
                format: 'rgba8unorm',
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
            });
            device.queue.copyExternalImageToTexture({
                source: imageBitmap
            }, {
                texture: texture,
                mipLevel: 0
            }, textureSize);
            return texture;
        });
    }
}
exports.TextureLoader = TextureLoader;
