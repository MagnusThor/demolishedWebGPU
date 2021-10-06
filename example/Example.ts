import { Geometry } from "../src/Geometry";
import { Material } from "../src/Material";
import { Renderer } from "../src/Renderer";
//import { cloudWglsl } from "./shaders/cloud";
import { plasmaWglsl } from "./shaders/plasma";

document.addEventListener("DOMContentLoaded", () => {

  const renderer = new Renderer(document.querySelector('canvas'));

  renderer.getDevice().then(async device => {
    const vertices = new Float32Array([
      -1, 1, 0, 1, 0, 1, 1, 1,
      -1, -1, 0, 1, 0, 1, 1, 1,
      1, -1, 0, 1, 0, 1, 1, 1,

      -1, 1, 0, 1, 0, 1, 1, 1,
      1, -1, 0, 1, 0, 1, 1, 1,
      1, 1, 0, 1, 0, 1, 1, 1,
    ]);
    // width,height,devicePixelRatio,time 
    const uniforms = new Float32Array([renderer.canvas.width, renderer.canvas.height, devicePixelRatio, 0]);

    const geometry = new Geometry(device, vertices); // quad ( two triangles)
    const material = new Material(device, plasmaWglsl)

    renderer.initialize(geometry, material, uniforms).then(() => {
      renderer.render();
    })

  });











});


