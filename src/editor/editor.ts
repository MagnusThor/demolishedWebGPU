
import { EditorState, StateField, StateEffect } from "@codemirror/state";

import { ViewPlugin, ViewUpdate, EditorView, keymap, gutter, GutterMarker, DecorationSet, Decoration, WidgetType } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands"
import { DOMUtils } from "./DOMUtis"
import { Material, defaultWglslVertex } from "../engine/Material";
import { basicSetup } from "codemirror";
import { FPS } from 'yy-fps'
import beautify from "js-beautify";
import {rust} from "@codemirror/lang-rust";



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
import { simpleMarcher } from "../../example/shaders/wglsl/simpleMarcher";
import { IOfflineGraph, OfflineStorage } from "./store/OfflineStorage";
import { StoredShader } from "./models/StoredShader";




const fps = new FPS();


const randomStr = () => (Math.random() + 1).toString(36).substring(7);
export class Editor {

    renderer: Renderer;
    storage: OfflineStorage<StoredShader>;
    state: EditorState;
    editorView: EditorView;
    currentShader: StoredShader;
    isRunning: boolean;

    async tryCompile(source: string): Promise<GPUCompilationInfo> {
        const shaderModule = this.renderer.device.createShaderModule({
            code: source
        });
        return await shaderModule.getCompilationInfo()
    }

    async initwebGPU(): Promise<GPUDevice> {
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
    async tryAddShader(shader: Material): Promise<void> {
        const geometry = new Geometry(this.renderer.device, rectGeometry);
        await this.renderer.addRenderPass("iChannel0", shader, geometry, []).catch(err => {
            console.log(err);
        });
        this.renderer.addMainPass(new Material(this.renderer.device, mainShader));
        return;
    }

    async onCompile(view: EditorView): Promise<boolean> {
        const source = view.state.doc.toString();
        if(this.isRunning){
            this.renderer.pause();   
            this.isRunning = false;    
        }      
        const pa = DOMUtils.get("#btn-run-shader i");
        if(pa.classList.contains("bi-stop-fill")){
            pa.classList.remove("bi-stop-fill");
            pa.classList.add("bi-play-btn-fill");
        }    
        this.tryCompile(source).then(conpileInfo => {
            DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = false;
            clearAllDecorations(view);
            const resultEl = DOMUtils.get("#compiler-result");
            DOMUtils.removeChilds(resultEl);
            if(conpileInfo.messages.length >0 ){
                DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = true;
            }
            conpileInfo.messages.forEach(error => {
                resultEl.append(DOMUtils.create("p").textContent = `${error.message} at line ${error.lineNum}.`);
                setTitleForLine(view, error.lineNum, error.message);
            });
        }).catch(err => {
            DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = true;
        });
        return true;
    }

    toggleCanvasFullScreen(): void {
        const canvas = DOMUtils.get<HTMLCanvasElement>("canvas");
        if (!document.fullscreenElement) {
            canvas.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }

    async setupEditor(shader: StoredShader) {
        this.renderer = new Renderer(document.querySelector("canvas"));
        await this.renderer.init();
        const customKeyMap = [
            {
                key: "Mod-Shift-b", run: (view: EditorView) => {
                    this.onCompile(view).then(shouldSave => {
                    });
                    return true;
                }
            },
            {
                key: "Mod-s", run: () => {
                    this.updateCurrentShader();
                    return true;
                }
            }
            , {
                key: "Mod-Shift-f", run: (view: EditorView) => {
                    const code = view.state.doc.toString();
                    const formattedCode = beautify(code,
                        {
                        }
                    );
                    view.dispatch({
                        changes: {
                            from: 0,
                            to: view.state.doc.length,
                            insert: formattedCode,
                        },
                    });
                    return true;
                },
            }
        ];


        const state = EditorState.create({
            doc: shader.source,
            extensions: [
                indentOnInput(),
                basicSetup, rust(), keymap.of([
                    ...defaultKeymap, ...customKeyMap, indentWithTab
                ]),
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

        this.editorView = new EditorView({
            state,
            parent: DOMUtils.get("#editor")
        });


        this.state = state;
        this.isRunning = false;


    }


    setupUI(): void {
        DOMUtils.get<HTMLButtonElement>("#btn-run-shader").addEventListener("click", (e) => {
          
            DOMUtils.get("#btn-run-shader i").classList.toggle("bi-play-btn-fill")
            DOMUtils.get("#btn-run-shader i").classList.toggle("bi-stop-fill")


            if (this.isRunning) {
                this.renderer.clear();
                this.renderer.isPaused = true;
            
               
            } else {
                this.renderer.isPaused = false;
            
         
            }
            const material = new Material(this.renderer.device, {
                fragment: this.editorView.state.doc.toString(),
                vertex: defaultWglslVertex
            })
            this.tryAddShader(material).then(p => {
                this.renderer.start(0, 200, (frame) => {
                    fps.frame();
                });
            });
            this.isRunning = !this.isRunning;
        });

        DOMUtils.on("click", "#btn-save", () => {
            this.updateCurrentShader();
        });

        DOMUtils.on("click", "#btn-new", () => {
            const item = new StoredShader(`Shader ${randomStr()}`, "N/A",
                blueColorShader.fragment
            );
            this.storage.insert(item);
            this.setCurrentShader(item);
            this.storage.save();
        });

        DOMUtils.on("click","#btn-canvas-fullscreen", this.toggleCanvasFullScreen)
        DOMUtils.on("click","#btn-clone", () => {
            const clone = new StoredShader(`Copy of ${this.currentShader.name}`,
                this.currentShader.description,this.currentShader.source);
            this.storage.insert(clone);
            this.currentShader = clone;  
        });
    }


    setCurrentShader(shader: StoredShader): void {
        this.currentShader = shader;
        DOMUtils.get<HTMLInputElement>("#shader-name").value = shader.name;
        DOMUtils.get<HTMLInputElement>("#shader-description").value = shader.description;
        // Create a transaction to replace the document
        const transaction = this.editorView.state.update({
            changes: { from: 0, to: this.editorView.state.doc.length, insert: shader.source }
        });
        // Dispatch the transaction to the editor view
        this.editorView.dispatch(transaction);
    }

    updateCurrentShader() {
        this.currentShader.source = this.editorView.state.doc.toString();
        this.currentShader.name = DOMUtils.get<HTMLInputElement>("#shader-name").value;
        this.currentShader.description = DOMUtils.get<HTMLInputElement>("#shader-description").value;
        this.storage.update(this.currentShader);
        this.currentShader.thumbnail = this.renderer.canvas.toDataURL();
        this.storage.save();     
    }

    renderStoredShaders(shaders: Array<StoredShader>): void {
        const parent = DOMUtils.get("#lst-shaders");
        DOMUtils.removeChilds(parent);

        shaders.forEach(shader => {
            const image = shader.thumbnail ? shader.thumbnail : "https://via.placeholder.com/40";
            console.log(image);

            const template = `
                <li class="list-group-item d-flex justify-content-between align-items-start">
                   <img src="${image}" style="max-width:80px" class="img-thumbnail mr-3" >
                    <div class="ms-2 me-auto">

                        <div class="fw-bold">${shader.name}</div>
                        ${shader.description}
                    </div>
                    <button class="btn btn-sm btn-secondary" data-id=${shader.id}">Edit</button>
                </li>`;
            const item = DOMUtils.toDOM(template);
            const button = DOMUtils.get("button", item);
            button.dataset.id = shader.id;
            DOMUtils.on("click", button, () => {
                this.setCurrentShader(shader);
            });
            parent.append(item);
        });
    }

    async initStorage(): Promise<StoredShader> {
        return new Promise((resolve, reject) => {
            try {
                this.storage = new OfflineStorage<StoredShader>("editor");
                this.storage.init();
                const lastModified = this.storage.model.collection.sort ( (a:StoredShader,b:StoredShader) => {
                        return b.lastModified - a.lastModified
                })[0];
                resolve(lastModified);
            } catch (err) {
                this.storage = new OfflineStorage<StoredShader>("editor");
                this.storage.setup();
                // create a default shader and add it to the storage
                const defaultShader = new StoredShader(`Shader ${randomStr()} `,
                    `My first WGLSL Shader`, blueColorShader.fragment);
                this.storage.insert(defaultShader);
                this.storage.save();
                reject("No storage found")
            }
        });
    }

    constructor() {
        this.setupUI();
        this.initStorage().then(shader => {

            this.storage.onChange = () => {
                this.renderStoredShaders(this.storage.model.collection)
            }
            this.currentShader = shader;
            this.renderStoredShaders(this.storage.model.collection)
            this.setupEditor(shader).then(r => {
                this.setCurrentShader(shader);
            });
        }).catch(err => {            
            this.renderStoredShaders(this.storage.model.collection);
            const shader = this.storage.model.collection[0];
            this.setupEditor(shader).then(r => {
                this.setCurrentShader(shader);
            });

        });
    }
}





document.addEventListener("DOMContentLoaded", () => {


    const editor = new Editor();

});