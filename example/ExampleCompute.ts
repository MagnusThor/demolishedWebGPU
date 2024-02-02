import { MyRenderer } from "../src/Engine";



document.addEventListener("DOMContentLoaded", async () => {


const renderer = new MyRenderer(document.querySelector("canvas"));


 await renderer.init();

  
renderer.update(0);

});