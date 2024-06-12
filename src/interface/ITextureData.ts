// export class TextureCache {
//     entities: Map<string, any>
//     constructor() {
//         this.entities = new Map<string, any>();
//     }
// }

export interface ITextureData {
    type: number
     data: GPUTexture | HTMLVideoElement | HTMLImageElement 
}

