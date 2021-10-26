export interface ITexture {
    key: string
    source: string
    sampler?: any
    type: TextureType
  
}

export enum TextureType{
    image = 0,
    video = 1,
    canvas = 2,
    mediaStream = 3
}