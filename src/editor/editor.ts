
import { EditorState, StateField, StateEffect } from "@codemirror/state";

import { ViewPlugin, ViewUpdate, EditorView, keymap, gutter, GutterMarker, DecorationSet, Decoration, WidgetType } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands"
import { DOMUtils } from "./DOMUtis"
import { Material, defaultWglslVertex } from "../engine/Material";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { FPS } from 'yy-fps'
import beautify from "js-beautify";


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
import { IEntityBase, IOfflineEntity, IOfflineGraph, OfflineStorage } from "./OfflineStorage";


const fps = new FPS();


const randomStr = () => (Math.random() + 1).toString(36).substring(7);
/*
 LocalStorage related stuff
*/
export class StoredShader extends IEntityBase implements IOfflineEntity {
    constructor(public name: string, public description: string, public source: string) {
        super();
    }
}


export class Editor {

    renderer: Renderer;
    storage: OfflineStorage<StoredShader>;
    state: EditorState;
    editorView: EditorView;
    currentShader: StoredShader;

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
        this.tryCompile(source).then(conpileInfo => {
            DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = false;
            clearAllDecorations(view);
            const resultEl = DOMUtils.get("#compiler-result");
            resultEl.textContent = "There is no errors."
            conpileInfo.messages.forEach(error => {
                resultEl.append(DOMUtils.create("p").textContent = `${error.message} at line ${error.lineNum}.`);
                setTitleForLine(view, error.lineNum, error.message);
            });
        }).catch(err => {
            DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = false;
        });
        return true;
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
            ,{
                 key: "Mod-Shift-f",  run: (view:EditorView) => {
                    const code = view.state.doc.toString();
                    const formattedCode = beautify(code, {}); 
                    view.dispatch({
                        changes: {
                          from: 0,
                          to: view.state.doc.length,
                          insert: formattedCode,
                        },
                      });                 
                    return true;
                 } ,
            }
        ];

        const editorKeymap = keymap.of([
            ...defaultKeymap, ...customKeyMap,indentWithTab
        ]);

        const state = EditorState.create({
            doc: shader.source,
            extensions: [
                indentOnInput(),
                basicSetup, javascript(), editorKeymap,
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


        let isRunning = false;

        DOMUtils.get<HTMLButtonElement>("#btn-run-shader").addEventListener("click", (e) => {
            DOMUtils.toggleClasses("#btn-run-shader i", ["bi-play-btn-fill", "bi-stop-fill"]);

            if (isRunning) {
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

            isRunning = !isRunning;

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
        this.storage.save();
        this.renderStoredShaders(this.storage.model.collection);
    }

    renderStoredShaders(shaders: Array<StoredShader>): void {
        const parent = DOMUtils.get("#lst-shaders");

        DOMUtils.removeChilds(parent);

        shaders.forEach(shader => {
            const template = `
                <li class="list-group-item d-flex justify-content-between align-items-start">
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
                resolve(this.storage.model.collection[0]);

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
        this.initStorage().then(shader => {

            this.currentShader = shader;

            this.renderStoredShaders(this.storage.model.collection)
            this.setupEditor(shader).then(r => {
                this.setCurrentShader(shader);
            });
        }).catch(err => {
            this.renderStoredShaders(this.storage.model.collection);
        });
    }
}





document.addEventListener("DOMContentLoaded", () => {


    const editor = new Editor();

});