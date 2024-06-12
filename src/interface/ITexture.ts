export interface ITexture {
    key: string
    source: string |MediaStream
    sampler?: any
    type: TextureType
  
}

export enum TextureType{
    IMAGE = 0,
    VIDEO = 1,
    CANVAS = 2,
    MEDIASTREAM = 3
}