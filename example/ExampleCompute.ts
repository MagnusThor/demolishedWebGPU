import { computeRaymarchShader } from "./shaders/compute/computeRaymarchShader";
import { FPS } from 'yy-fps'
import { Material } from "../src/Material";
import { mainShader } from "./shaders/compute/mainShader";
import { ComputeRenderer } from "../src/compute/ComputeRenderer";
import { ITexture, TextureType } from "../src/ITexture";

document.addEventListener("DOMContentLoaded", async () => {
   
    const textures: Array<ITexture> = [
        {
          key: "iChannel0",
          source: "assets/channel0.jpg", // ms 
          type: TextureType.IMAGE,
        },
    
        {
          key: "iChannel1",
          source: "assets/channel1.jpg",
          type: TextureType.IMAGE
        },
      ];
    

    const fps = new FPS();
    const renderer = new ComputeRenderer(document.querySelector("canvas"));
    
    await renderer.init();

    await renderer.addComputeRenderPass("iChannel0", computeRaymarchShader,
    textures
    );

    const material = new Material(renderer.device, mainShader);

    renderer.addRenderPass(material);
        renderer.start(0, 200, (frame) => {
            fps.frame();
        });
        
});