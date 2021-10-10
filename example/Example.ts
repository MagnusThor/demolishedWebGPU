import { Geometry } from "../src/Geometry";
import { Material } from "../src/Material";
import { Renderer } from "../src/Renderer";
import { showTextureWglsl } from "./shaders/texture";
import { cloudWglsl } from "./shaders/cloud";
import { plasmaWglsl } from "./shaders/plasma";
import { ITexture } from "../src/TextureLoader";
import { rextVertexArray } from "./meshes/rect";




document.addEventListener("DOMContentLoaded", () => {

  const renderer = new Renderer(document.querySelector('canvas'));

  renderer.getDevice().then(async device => {

    
    const geometry = new Geometry(device, rextVertexArray);
    const material = new Material(device, cloudWglsl)

    const textures: Array<ITexture> = [{
      key: "textureA",
      path: "/example/assets/channel0.jpg"
    },
    {
      key: "textureB",
      path: "/example/assets/channel1.jpg"
    }
    ];

    let customUniforms = Float32Array

    renderer.initialize(geometry, material, textures).then(() => {
      renderer.render();
    })



  });
});


