import { Geometry, VERTEXType } from "../src/Geometry";
import { Material } from "../src/Material";
import { Renderer } from "../src/Renderer";
import { showTextureShader } from "./shaders/wglsl/texture";
//import { cloudWglsl } from "./shaders/wglsl/cloud";
import { plasmaShader } from "./shaders/wglsl/plasma";

import { ITexture, TextureType } from "../src/ITexture";




import glslang from './libs/glslang';
import { fractalShader } from "./shaders/glsl/fractal";
import { cloudShader } from "./shaders/wglsl/cloud";
import { magadoshShader } from "./shaders/glsl/magadosh";
import { rectGeometry } from "./meshes/samples";
import { Scene } from "../src/Scene";
import { Mesh } from "../src/Mesh";


document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;



  const ms = await navigator.mediaDevices.getUserMedia({video:true,audio:false});



  const renderer = new Renderer(canvas);
  const device = await renderer.getDevice();
  /*
  glslang compile GLSL - > SPIR-V , in this case an fragmentshader in glsl version 4.5
  */
  //const glsl = await glslang();
  //let compiledShader = glsl.compileGLSL(fractalShader.fragment as string, "fragment", false);
  //const myMaterial = Material.createMaterialShader(fractalShader.vertex, compiledShader, "main", "main");
  const material = new Material(device, showTextureShader);
  //const material = new Material(device, myMaterial);
  const geometry = new Geometry(device, rectGeometry);

  const samplers: Array<GPUSamplerDescriptor> = [{
    addressModeU: 'repeat',
    addressModeV: 'repeat',
    magFilter: 'linear',
    minFilter: 'nearest' // linear sampler, binding 2, as uniforms is bound to 1    
  }];


  const textures: Array<ITexture> = [
    //   {
    //   key: "textureA",
    //   source: "assets/channel0.jpg",
    //   type:0
    // },
    {
      key: "textureA",
      source: ms,//;"assets/video.webm",
      type: TextureType.video,
    },

    {
      key: "textureB",
      source: "assets/channel0.jpg",
      type: TextureType.image
    },

  ];

  const scene = new Scene("myScene", device, canvas);
  await scene.addAssets(textures, samplers);
  
  const mesh = new Mesh(device, geometry, material, textures);

  scene.addMesh("myMesh", mesh);

  await renderer.addScene(scene)


  renderer.start(0);

});


