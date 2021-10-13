import { Geometry } from "../src/Geometry";
import { Material } from "../src/Material";
import { Renderer } from "../src/Renderer";
import { showTextureShader } from "./shaders/wglsl/texture";
//import { cloudWglsl } from "./shaders/wglsl/cloud";
import { plasmaShader } from "./shaders/wglsl/plasma";

import { ITexture } from "../src/TextureLoader";
import { rectVertexArray } from "./meshes/rect";



import glslang from './libs/glslang';
import { fractalShader } from "./shaders/glsl/fractal";
import { cloudShader } from "./shaders/wglsl/cloud";


document.addEventListener("DOMContentLoaded", async () => {

  const renderer = new Renderer(document.querySelector('canvas'));
  const device = await renderer.getDevice();
  /*
        glslang compile GLSL - > SPIR-V , in this case an fragmentshader in glsl version 4.5
  */
  //const glsl = await glslang();
  //let compiledShader = glsl.compileGLSL(fractalShader.fragment as string, "fragment", false);
  //const myMaterial = Material.createMaterialShader(fractalShader.vertex, compiledShader, "main", "main");

  const material = new Material(device, cloudShader)

  const geometry = new Geometry(device, rectVertexArray);


  const textures: Array<ITexture> = [{
    key: "textureA",
    path: "/example/assets/channel0.jpg"
  },
  {
    key: "textureB",
    path: "/example/assets/channel1.jpg"
  }
  ];

  await renderer.initialize(geometry, material, textures)
  renderer.render();

});


