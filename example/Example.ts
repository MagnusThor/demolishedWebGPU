import { Geometry, VERTEXType } from "../src/Geometry";
import { Material } from "../src/Material";
import { Renderer } from "../src/Renderer";
import { showTextureShader } from "./shaders/wglsl/texture";
//import { cloudWglsl } from "./shaders/wglsl/cloud";
import { plasmaShader } from "./shaders/wglsl/plasma";

import { ITexture } from "../src/ITexture";




import glslang from './libs/glslang';
import { fractalShader } from "./shaders/glsl/fractal";
import { cloudShader } from "./shaders/wglsl/cloud";
import { magadoshShader } from "./shaders/glsl/magadosh";
import { rectGeometry } from "./meshes/samples";
import { Scene } from "../src/Scene";
import { Mesh } from "../src/Mesh";


document.addEventListener("DOMContentLoaded", async () => {


  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  
  const renderer = new Renderer(canvas);
  const device = await renderer.getDevice();
  /*
        glslang compile GLSL - > SPIR-V , in this case an fragmentshader in glsl version 4.5
  */
  const glsl = await glslang();
  let compiledShader = glsl.compileGLSL(fractalShader.fragment as string, "fragment", false);
  const myMaterial = Material.createMaterialShader(fractalShader.vertex, compiledShader, "main", "main");
  //const material = new Material(device, cloudShader);
  const material = new Material(device, myMaterial);
  const geometry = new Geometry(device, rectGeometry);



  
  const samplers: Array<GPUSamplerDescriptor> = [{
    addressModeU: 'repeat',
    addressModeV: 'repeat',
    magFilter: 'linear',
    minFilter: 'nearest' // linear sampler, binding 2, as uniforms is bound to 1    
  }];

  
  const textures: Array<ITexture> = [{
    key: "textureA",
    path: "assets/channel0.jpg"
  },
  {
    key: "textureB",
    path: "assets/channel1.jpg"
  }
  ];

  const scene = new Scene("example",device,canvas);

  const mesh = new Mesh(device, geometry,material, textures.length);

  scene.addMesh("example",mesh);

  await scene.build(undefined,textures,samplers);

  
  await renderer.addScene(scene)


  renderer.start(0);

});


