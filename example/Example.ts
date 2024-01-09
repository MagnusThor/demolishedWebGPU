import { Geometry } from "../src/Geometry";
import { Material } from "../src/Material";
import { Renderer } from "../src/Renderer";
import { ITexture, TextureType } from "../src/ITexture";
import { rectGeometry } from "./meshes/Rectangle";
import { Scene } from "../src/Scene";
import { Mesh } from "../src/Mesh";
import { raymarchShader } from "./shaders/wglsl/raymarchShader";

import { FPS } from 'yy-fps'

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;

  const fps = new FPS()

  const renderer = new Renderer(canvas);
  const device = await renderer.getDevice();

  const scene = new Scene("myScene", device, canvas);
  const material = new Material(device, raymarchShader);    
  const geometry = new Geometry(device, rectGeometry);
 
  const textures: Array<ITexture> = [
    {
      key: "iChannel0",
      source: "assets/video.webm", // ms 
      type: TextureType.video,
    },

    {
      key: "iChannel1",
      source: "assets/channel0.jpg",
      type: TextureType.image
    },
  ];

  //  const samplers: Array<GPUSamplerDescriptor> = [{
  //   addressModeU: 'repeat',
  //   addressModeV: 'repeat',
  //   magFilter: 'linear',
  //   minFilter: 'nearest' // linear sampler, binding 2, as uniforms is bound to 1    
  // }];


  const mesh = new Mesh(device, geometry, material,[textures[0],textures[1]]); 
  
  await scene.addAssets(textures);

  scene.addMesh("myMesh", mesh);

  await renderer.addScene(scene)

  renderer.start(0,200,(frameNo) => {
    fps.frame();
  });

});


