
import { EditorState } from "@codemirror/state";

import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands"
import { DOMUtils } from "./DOMUtis"
import { Material, defaultWglslVertex } from "../engine/Material";
import { basicSetup } from "codemirror";
import { FPS } from 'yy-fps'
import beautify from "js-beautify";
import { rust } from "@codemirror/lang-rust";



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
import { blueColorShader } from "../../example/shaders/wglsl/blueColorShader";
import { OfflineStorage } from "./store/OfflineStorage";
import { IDocumentData, StoredShader, TypeOfShader } from "./models/StoredShader";
import { FAXXShader } from "../../example/shaders/shared/fxaaShader";
import { mainShader } from "../../example/shaders/shared/mainShader";
import { IMaterialShader } from "../interface/IMaterialShader";





const fps = new FPS();


const randomStr = () => (Math.random() + 1).toString(36).substring(7);


export interface IError {
    name: string,
    documentIndex: number,
    errors: GPUCompilationInfo,


}
export class Editor {

    renderer: Renderer;
    storage: OfflineStorage<StoredShader>;
    state: EditorState;
    editorView: EditorView;
    currentShader: StoredShader;
    isRunning: boolean;


    sourceIndex: number = 1;

    async tryCompile(sources: IDocumentData[]): Promise<IError[]> {
        const results = await Promise.all(sources.map(async (document,index) => {
            const source = document.source;
            const shaderModule = this.renderer.device.createShaderModule({
                code: source
            });
            const compileError: IError = {
                documentIndex: index,
                name: document.name,
                errors: await shaderModule.getCompilationInfo(),
            }
            return compileError
        }));


        return results;
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
    async tryAddShaders(documents: IDocumentData[]): Promise<void> {


        this.renderer.renderPassBacklog.clear();

        const rectangle = new Geometry(this.renderer.device, rectGeometry);

        await Promise.all(documents.map(async (document, index) => {
            const source = document.source;
            if (document.type === TypeOfShader.Frag) {
                const material = new Material(this.renderer.device, {
                    fragment: source,
                    vertex: defaultWglslVertex
                });
                await this.renderer.addRenderPass(`iChannel${index - 1}`, material, rectangle, []).catch(err => {
                    console.error(err);
                });
            }
            return true
        }));
        mainShader.fragment = documents[0].source;
        this.updateMainRenderPass(mainShader);
        return;
    }

    updateMainRenderPass(material: IMaterialShader) {
        this.renderer.addMainPass(new Material(this.renderer.device,
            material
        ));
    }

    async onCompile(view: EditorView): Promise<boolean> {
        const source = view.state.doc.toString();
        this.currentShader.documents[this.sourceIndex].source = view.state.doc.toString();


        if (this.isRunning) {
            this.renderer.pause();
            this.isRunning = false;
        }
        const pa = DOMUtils.get("#btn-run-shader i");
        if (pa.classList.contains("bi-stop-fill")) {
            pa.classList.remove("bi-stop-fill");
            pa.classList.add("bi-play-btn-fill");
        }


        this.tryCompile(this.currentShader.documents).then(compileInfo => {

            DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = false;
            clearAllDecorations(view);
            const resultEl = DOMUtils.get("#compiler-result");
            DOMUtils.removeChilds(resultEl);
            const hasErrors = compileInfo.some(ci => ci.errors.messages.length > 0);
            if (hasErrors) {        
                const firstCorruptShader = compileInfo.filter(pre => {
                    return pre.errors.messages.length > 0
                })[0];
                DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = true;

                if(firstCorruptShader.documentIndex != this.sourceIndex){

                    DOMUtils.get<HTMLSelectElement>("#select-source").selectedIndex = firstCorruptShader.documentIndex;

                    const transaction = this.editorView.state.update({
                        changes: { from: 0, to: this.editorView.state.doc.length, insert: 
                            this.currentShader.documents[firstCorruptShader.documentIndex].source                            
                         }
                    });
            
                    // Dispatch the transaction to the editor view
                    this.editorView.dispatch(transaction);
    
                    this.sourceIndex = firstCorruptShader.documentIndex;
    
                }


                 firstCorruptShader.errors.messages.forEach(error => {       
                    resultEl.append(DOMUtils.create("p").textContent = `${error.message} at line ${error.lineNum}.`);
                    setTitleForLine(view, error.lineNum, error.message);
                });

            } else {
                DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = false;
            }


        }).catch(err => {
            console.log(err);
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
                    this.onCompile(view).then(result => {

                        const typeToCompile = this.currentShader.documents[this.sourceIndex].type;
                        if (typeToCompile == TypeOfShader.Frag) {
                            const material = new Material(this.renderer.device, {
                                fragment: this.editorView.state.doc.toString(),
                                vertex: defaultWglslVertex
                            });
                        } else if (typeToCompile === TypeOfShader.MainFrag) {
                            const mainFragSource = this.editorView.state.doc.toString();
                            const shader: IMaterialShader = {
                                fragment: mainFragSource,
                                vertex: mainShader.vertex
                            }
                        }
                        console.log(typeToCompile, this.sourceIndex);
                    }).catch(err => {
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
            doc: shader.documents[this.sourceIndex].source,
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
                    los: () => {
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

            this.currentShader.documents[this.sourceIndex].source = this.editorView.state.doc.toString();

            DOMUtils.get("#btn-run-shader i").classList.toggle("bi-play-btn-fill")
            DOMUtils.get("#btn-run-shader i").classList.toggle("bi-stop-fill")

            if (this.isRunning) {
                this.renderer.clear();
                this.renderer.isPaused = true;


            } else {
                this.renderer.isPaused = false;


            }

            // const material = new Material(this.renderer.device, {
            //     fragment: this.editorView.state.doc.toString(),
            //     vertex: defaultWglslVertex
            // });

            this.tryAddShaders(this.currentShader.documents).then(p => {
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
            const item = new StoredShader(`Shader ${randomStr()}`, "N/A");
            item.addDocument(randomStr(), mainShader.fragment, TypeOfShader.MainFrag);
            item.addDocument(randomStr(), blueColorShader.fragment, TypeOfShader.Frag);

            this.storage.insert(item);
            this.setCurrentShader(item);
            this.storage.save();
        });

        DOMUtils.on("click", "#btn-canvas-fullscreen", this.toggleCanvasFullScreen)

        DOMUtils.on("click", "#btn-clone", () => {
            const clone = new StoredShader(`Copy of ${this.currentShader.name}`,
                this.currentShader.description);
            clone.documents = this.currentShader.documents;
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
            changes: { from: 0, to: this.editorView.state.doc.length, insert: shader.documents[1].source }
        });

        // Dispatch the transaction to the editor view
        this.editorView.dispatch(transaction);
    }

    updateCurrentShader() {
        this.currentShader.documents[this.sourceIndex].source = this.editorView.state.doc.toString();
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


    renderSourceList(documents: IDocumentData[]) {

        const parent = DOMUtils.get<HTMLInputElement>("#select-source");
        DOMUtils.removeChilds(parent);

        documents.forEach((doc, index) => {
            const option = DOMUtils.create<HTMLOptionElement>("option");
            const suffix = doc.type === TypeOfShader.Frag ? `iChannel${index}` : "";

            option.text = `${doc.name}(${doc.type}) ${suffix}`;

            option.value = index.toString();
            parent.append(option);
        });

        parent.value = "1"

    }

    async initStorage(): Promise<StoredShader> {
        return new Promise((resolve, reject) => {
            try {
                this.storage = new OfflineStorage<StoredShader>("editor");
                this.storage.init();

                const lastModified = this.storage.model.collection.sort((a: StoredShader, b: StoredShader) => {
                    return b.lastModified - a.lastModified
                })[0];


                this.renderSourceList(lastModified.documents);

                resolve(lastModified);


            } catch (err) {

                this.storage = new OfflineStorage<StoredShader>("editor");
                this.storage.setup();

                // create a default shader and add it to the storage
                const defaultShader = new StoredShader(`Shader ${randomStr()} `,
                    `My first WGLSL Shader`);

                defaultShader.addDocument(randomStr(), mainShader.fragment, TypeOfShader.MainFrag);
                defaultShader.addDocument(randomStr(), blueColorShader.fragment, TypeOfShader.Frag);

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

        DOMUtils.on("change", "#select-source", (ev, el) => {

            this.currentShader.documents[this.sourceIndex].source = this.editorView.state.doc.toString();


            const document = this.currentShader.documents[parseInt(el.value)];

            const transaction = this.editorView.state.update({
                changes: { from: 0, to: this.editorView.state.doc.length, insert: document.source }
            });

            this.editorView.dispatch(transaction);
            this.sourceIndex = parseInt(el.value);

        });

    }
}





document.addEventListener("DOMContentLoaded", () => {


    const editor = new Editor();

});