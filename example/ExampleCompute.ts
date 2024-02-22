
import { computeRaymarchShader } from "./shaders/compute/computeRaymarchShader";
import { FPS } from 'yy-fps'
import { rectGeometry } from "./meshes/Rectangle";
import { Material } from "../src/Material";
import { Geometry } from "../src/Geometry";
import { mainShader } from "./shaders/compute/mainShader";
import { MyRenderer } from "../src/compute/Engine";

document.addEventListener("DOMContentLoaded", async () => {

    const fps = new FPS()

    const renderer = new MyRenderer(document.querySelector("canvas"));
    await renderer.init();

    renderer.addComputeRenderPass("iChannel0", computeRaymarchShader);

    const material = new Material(renderer.device, mainShader);
    const geometry = new Geometry(renderer.device, rectGeometry);

    renderer.addRenderPass(material, geometry);

    renderer.start(0, 200, (frame) => {
        fps.frame();
    });

});