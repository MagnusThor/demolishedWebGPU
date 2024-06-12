import { FPS } from 'yy-fps'
import { Renderer } from "../src/engine/Renderer";
import { ITexture, TextureType } from "../src/interface/ITexture";
import { raytracedRollingBallShader } from "./shaders/wglsl/raytracedRollingBallShader";
import { rectGeometry } from "./meshes/Rectangle";

import { customMainShader } from "./shaders/shared/customMainShader";
import { Material } from "../src/engine/Material";
import { Geometry } from '../src/engine/Geometry';
import { computeRaymarchShader } from './shaders/compute/computeRaymarchShader';
import { letsSelfRefectComputeShader } from './shaders/compute/letsSelfReflectShader';
import { mainShader } from './shaders/shared/mainShader';
import { mrangeShader } from './shaders/wglsl/mrange';
import { microRayMarcherCompute } from './shaders/compute/microRayMarcher';
import { blueColorShader } from './shaders/wglsl/blueColorShader';
import { flamesShader } from './shaders/wglsl/flamesShader';


document.addEventListener("DOMContentLoaded", async () => {
   

    const textures: Array<ITexture> = [
        {
          key: "iChannel0",
          source: "assets/noise2.png", // ms 
          type: TextureType.IMAGE,
        }
    ];
    

    const fps = new FPS();

    const renderer = new Renderer(document.querySelector("canvas"));

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

    // add a frag shader ()
    // const mrange = new Material(renderer.device,mrangeShader);
    // await renderer.addRenderPass("iChannel",mrange,geometry).catch (err => {
    //     console.log(err);
    // });

    
    const material = new Material(renderer.device,flamesShader);
    
    await renderer.addRenderPass("iChannel0",material,geometry,textures).catch (err => {
        console.log(err);
    });

    //await renderer.addComputeRenderPass("iChannel0", microRayMarcherCompute,[]);

    
    renderer.addMainPass(new Material(renderer.device, mainShader));

    renderer.start(0, 200, (frame) => {
        fps.frame();
    });
        
});