
import { EditorState,StateField,StateEffect  } from "@codemirror/state";

import {ViewPlugin,ViewUpdate, EditorView, keymap,gutter, GutterMarker,DecorationSet, Decoration,WidgetType  } from "@codemirror/view";
import {defaultKeymap,indentWithTab } from "@codemirror/commands"
import { DOMUtils } from "./DOMUtis"
import { Material, defaultWglslVertex } from "../engine/Material";
import { basicSetup} from "codemirror";
import {javascript} from "@codemirror/lang-javascript";
import { FPS } from 'yy-fps'


import {
    indentOnInput,
    bracketMatching,
    syntaxHighlighting,
    defaultHighlightStyle
  } from "@codemirror/language"
import { clearAllDecorations, decorationField, setTitleForLine } from "./errorDecorator";
import { Renderer } from "../engine/Renderer";
import { Geometry } from "../engine/Geometry";
import { rectGeometry } from "../../example/meshes/Rectangle";
import { microRayMarcherCompute } from "../../example/shaders/compute/microRayMarcher";
import { blueColorShader } from "../../example/shaders/wglsl/blueColorShader";
import { mainShader } from "../../example/shaders/shared/mainShader";
import { raymarchShader } from "../../example/shaders/wglsl/raymarchShader";

  
const fps = new FPS();
 
 export class Editor{
    
    renderer: Renderer;

    async tryCompile(source: string):Promise<GPUCompilationInfo>{
        const shaderModule = this.renderer.device.createShaderModule({
          code: source
        });
        return await shaderModule.getCompilationInfo()
    }

    async initwebGPU():Promise<GPUDevice>{
        if (!navigator.gpu) {
            console.error("WebGPU not supported on this browser.");
            return null;
          }
          const adapter = await navigator.gpu.requestAdapter();
          if (!adapter) {
            console.error("Failed to get GPU adapter.");
            return null;
          }
          const device = await adapter.requestDevice();
          return device;
    }


    async tryAddShader(shader:Material):Promise<void>{
        const geometry = new Geometry(this.renderer.device, rectGeometry);
        await this.renderer.addRenderPass("iChannel0",shader,geometry,[]).catch (err => {
            console.log(err);
        });
         this.renderer.addMainPass(new Material(this.renderer.device, mainShader));

        return;
   }

    async onCompile(view:EditorView):Promise<boolean>  {
        const source = view.state.doc.toString();   
        this.tryCompile(source).then ( conpileInfo => {   
            DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = false;
            clearAllDecorations(view);
            const resultEl = DOMUtils.get("#compiler-result");
            resultEl.textContent = "There is no errors." 
            conpileInfo.messages.forEach( error =>  {
                resultEl.append(DOMUtils.create("p").textContent =`${error.message} at line ${error.lineNum}.`);
                setTitleForLine(view,error.lineNum,error.message);      
            });
         }).catch ( err => {
            console.log(err);
            DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = false;
         });
         return true;
    }


    async setupEditor(){

        this.renderer = new Renderer(document.querySelector("canvas"));
        await this.renderer.init();

        const customKeymap = keymap.of([
            { key: "Mod-Shift-b", run: (view) => {
                this.onCompile(view).then(shouldSave => {                     
                });
                return true; 
            }}, 
            ...defaultKeymap,
        ]);
  
        const state = EditorState.create({
            doc: raymarchShader.fragment,
            extensions: [basicSetup,javascript(), customKeymap,
                syntaxHighlighting(defaultHighlightStyle),
                bracketMatching(),
                decorationField,
                EditorView.lineWrapping,
                EditorView.domEventHandlers({
                    click: () => {
                        
                    }
                })
            ],            
        });
        
        let editorView = new EditorView({
            state,
            parent: DOMUtils.get("#editor")
          });

      

        let isRunning = false;

        DOMUtils.get<HTMLButtonElement>("#btn-run-shader").addEventListener("click",(e) => {          
            DOMUtils.toggleClasses("#btn-run-shader i",["bi-play-btn-fill","bi-stop-fill"]);

            if(isRunning){
                this.renderer.clear();
                this.renderer.isPaused = true;
            }else{
                this.renderer.isPaused = false;
            }           

            const material = new Material(this.renderer.device,{
                fragment: editorView.state.doc.toString(),
                vertex:   defaultWglslVertex
            })

            this.tryAddShader(material).then ( p => {
                this.renderer.start(0, 200, (frame) => {
                        fps.frame();
                });
            });

            isRunning = !isRunning;

        });





    }

    constructor(){

        this.setupEditor().then( r =>{

        });

         

    }
    
}





document.addEventListener("DOMContentLoaded", () => {


    const editor = new Editor();

});