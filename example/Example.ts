import { FPS } from 'yy-fps'
import { ComputeRenderer } from "../src/engine/ComputeRenderer";
import { ITexture, TextureType } from "../src/interface/ITexture";
import { raytracedRollingBallShader } from "./shaders/wglsl/raytracedRollingBallShader";
import { rectGeometry } from "./meshes/Rectangle";

import { customMainShader } from "./shaders/shared/customMainShader";
import { Material } from "../src/engine/Material";
import { Geometry } from '../src/engine/Geometry';

document.addEventListener("DOMContentLoaded", async () => {
   

    const textures: Array<ITexture> = [
        {
          key: "iChannel0",
          source: "assets/noise2.png", // ms 
          type: TextureType.IMAGE,
        }
    ];
    

    const fps = new FPS();

    const renderer = new ComputeRenderer(document.querySelector("canvas"));

    await renderer.init();
 
    const geometry = new Geometry(renderer.device, rectGeometry);

    // add a frag shader ()
    // const iChannel0Shader = new Material(renderer.device,redColorShader);
    // await renderer.addRenderPass("iChannel0",iChannel0Shader,geometry,textures).catch (err => {
    //     console.log(err);
    // });

     // add a frag shader ()
     //const iChannel1Shader = new Material(renderer.device,blueColorShader);
    // await renderer.addRenderPass("iChannel1",iChannel1Shader,geometry).catch (err => {
    //     console.log(err);
    // });

    
    const material = new Material(renderer.device,raytracedRollingBallShader);
    await renderer.addRenderPass("iChannel0",material,geometry,textures).catch (err => {
        console.log(err);
    });


    // add a compte shader ( )
    //await renderer.addComputeRenderPass("iChannel2", computeRaymarchShader,[]);



    renderer.addMainPass(new Material(renderer.device, customMainShader));

    renderer.start(0, 200, (frame) => {
        fps.frame();
    });
        
});