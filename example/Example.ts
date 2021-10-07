import { Geometry } from "../src/Geometry";
import { Material } from "../src/Material";
import { Renderer } from "../src/Renderer";
import { simpleWglsl } from "./shaders/simple";
//import { cloudWglsl } from "./shaders/cloud";
import { plasmaWglsl } from "./shaders/plasma";
import { ITexture } from "../src/TextureLoader";

document.addEventListener("DOMContentLoaded", () => {

  const renderer = new Renderer(document.querySelector('canvas'));

  renderer.getDevice().then(async device => {

    // quad (2x tri's)
    // x,y,z,w,r,g,b,a
    const vertices = new Float32Array([
      -1, 1, 0, 1, 0, 1, 1, 1,
      -1, -1, 0, 1, 0, 1, 1, 1,
      1, -1, 0, 1, 0, 1, 1, 1,

      -1, 1, 0, 1, 0, 1, 1, 1,
      1, -1, 0, 1, 0, 1, 1, 1,
      1, 1, 0, 1, 0, 1, 1, 1,
    ]);

    // create a uniform buffer -> width,height,devicePixelRatio,time 

    const uniforms = new Float32Array([renderer.canvas.width, renderer.canvas.height, devicePixelRatio, 0]);

    const geometry = new Geometry(device, vertices);
    const material = new Material(device, plasmaWglsl)

    const textures: Array<ITexture> = [{
      key: "textureA",
      path: "/example/assets/channel0.jpg"
    },
    {
      key: "textureB",
      path: "/example/assets/channel1.jpg"
    }
    ];

    renderer.initialize(geometry, material, uniforms, textures).then(() => {
      renderer.render();
    })

  });
});


