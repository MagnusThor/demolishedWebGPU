import { computeRaymarchShader } from "./shaders/compute/computeRaymarchShader";
import { FPS } from 'yy-fps'
import { Material } from "../src/Material";
import { mainShader } from "./shaders/compute/mainShader";
import { ComputeRenderer } from "../src/compute/ComputeRenderer";
import { ITexture, TextureType } from "../src/ITexture";
import { computeElevatedShader } from "./shaders/compute/computeElevated";
import { computeedStubShader } from "./shaders/compute/computeStubShader";

document.addEventListener("DOMContentLoaded", async () => {
   
    const textures: Array<ITexture> = [
        {
          key: "iChannel0",
          source: "assets/noise.png", // ms 
          type: TextureType.IMAGE,
        }
    
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