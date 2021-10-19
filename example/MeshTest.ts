import { Seadragon } from "./meshes/seadragon";
import dragonRawData from 'stanford-dragon/4'

export class TestMesh{
    mesh: any;




    constructor(){


            this.mesh = new Seadragon(dragonRawData);


    }

}


document.addEventListener("DOMContentLoaded",() => {
    let m = new TestMesh();

    console.log(m);

})