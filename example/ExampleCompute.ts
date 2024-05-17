import { computeRaymarchShader } from "./shaders/compute/computeRaymarchShader";
import { FPS } from 'yy-fps'
import { Material } from "../src/Material";
import { mainShader } from "./shaders/shared/mainShader";
import { ComputeRenderer } from "../src/compute/ComputeRenderer";
import { ITexture, TextureType } from "../src/ITexture";
import { raytracedRollingBallShader } from "./shaders/wglsl/raytracedRollingBallShader";
import { redColorShader } from "./shaders/wglsl/redColorShader";
import { rectGeometry } from "./meshes/Rectangle";
import { Geometry } from "../src/Geometry";
import { blueColorShader } from "./shaders/wglsl/blueColorShader";

document.addEventListener("DOMContentLoaded", async () => {
   
    // const textures: Array<ITexture> = [
    //     {
    //       key: "iChannel1",
    //       source: "assets/noise.png", // ms 
    //       type: TextureType.IMAGE,
    //     }
    
    //  ];    

    const fps = new FPS();

    const renderer = new ComputeRenderer(document.querySelector("canvas"));

    await renderer.init();

    //await renderer.addComputeRenderPass("iChannel0", computeRaymarchShader,textures);
   
    const iChannel0Shader = new Material(renderer.device,redColorShader);
    const iChannel1Shader = new Material(renderer.device,blueColorShader);
    
    const geometry = new Geometry(renderer.device, rectGeometry);

    await renderer.addRenderPass("iChannel0",iChannel0Shader,geometry).catch (err => {
        console.log(err);
    });

    await renderer.addRenderPass("iChannel1",iChannel1Shader,geometry).catch (err => {
        console.log(err);
    });

     await renderer.addComputeRenderPass("iChannel2", computeRaymarchShader,[]);



    renderer.addMainPass(new Material(renderer.device, mainShader));

    renderer.start(0, 200, (frame) => {
        fps.frame();
    });
        
});