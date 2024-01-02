import { Geometry, VERTEXType } from "../src/Geometry";
import { Material } from "../src/Material";
import { Renderer } from "../src/Renderer";
import { simpleGreenScreen } from "./shaders/wglsl/simpleGreenScreen";
import { redColorShader } from "./shaders/wglsl/redColorShader";

import { ITexture, TextureType } from "../src/ITexture";
import glslang from './libs/glslang';
import { rectGeometry } from "./meshes/Rectangle";
import { Scene } from "../src/Scene";
import { Mesh } from "../src/Mesh";
import { mandelbrotFractal } from "./shaders/wglsl/mandelbrotFractal";
import { raymarchShader } from "./shaders/wglsl/raymarchShader";



document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;


//  const ms = await navigator.mediaDevices.getUserMedia({video:true,audio:false});

  const renderer = new Renderer(canvas);
  const device = await renderer.getDevice();
  /*
  glslang compile GLSL - > SPIR-V , in this case an fragmentshader in glsl version 4.5
  */
  //const glsl = await glslang();
  //let compiledShader = glsl.compileGLSL(fractalShader.fragment as string, "fragment", false);
  //const myMaterial = Material.createMaterialShader(fractalShader.vertex, compiledShader, "main", "main");

  const material = new Material(device, raymarchShader);
    
  //const material = new Material(device, myMaterial);
  const geometry = new Geometry(device, rectGeometry);

  const samplers: Array<GPUSamplerDescriptor> = [{
    addressModeU: 'repeat',
    addressModeV: 'repeat',
    magFilter: 'linear',
    minFilter: 'nearest' // linear sampler, binding 2, as uniforms is bound to 1    
  }];
  const textures: Array<ITexture> = [
    {
      key: "textureA",
      source: "assets/video.webm", // ms 
      type: TextureType.video,
    },

    {
      key: "textureB",
      source: "assets/channel0.jpg",
      type: TextureType.image
    },

  ];


  const mesh = new Mesh(device, geometry, material,[textures[0],textures[1]]); 


  const scene = new Scene("myScene", device, canvas);
  
  await scene.addAssets(textures);

  scene.addMesh("myMesh", mesh);

  await renderer.addScene(scene)

  renderer.start(0);

});


