import { computeRaymarchShader } from "./shaders/compute/computeRaymarchShader";
import { FPS } from 'yy-fps'
import { Material } from "../src/Material";
import { mainShader } from "./shaders/compute/mainShader";
import { ComputeRenderer } from "../src/compute/ComputeRenderer";

document.addEventListener("DOMContentLoaded", async () => {
   
    const fps = new FPS();
    const renderer = new ComputeRenderer(document.querySelector("canvas"));
    
    await renderer.init();
    renderer.addComputeRenderPass("iChannel0", computeRaymarchShader);

    const material = new Material(renderer.device, mainShader);

    renderer.addRenderPass(material);
        renderer.start(0, 200, (frame) => {
            fps.frame();
        });
});