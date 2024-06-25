
import { EditorState } from "@codemirror/state";

import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands"
import { DOMUtils } from "./DOMUtis"
import { Material, defaultWglslVertex } from "../engine/Material";
import { basicSetup } from "codemirror";
import { FPS } from 'yy-fps'
import { rust } from "@codemirror/lang-rust";
import { solarizedDark } from 'cm6-theme-solarized-dark'



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
import { IOfflineGraph, OfflineStorage } from "./store/OfflineStorage";
import { IDocumentData, StoredShader, TypeOfShader } from "./models/StoredShader";
import { mainShader } from "../../example/shaders/shared/mainShader";
import { IMaterialShader } from "../interface/IMaterialShader";
import axios from "axios";





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


    sourceIndex: number = 0;

    async tryCompile(sources: IDocumentData[]): Promise<IError[]> {
        const results = await Promise.all(sources.map(async (document, index) => {
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
        this.renderer.clear();
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
                resultEl.classList.remove("d-none");
                const firstCorruptShader = compileInfo.filter(pre => {
                    return pre.errors.messages.length > 0
                })[0];
                DOMUtils.get<HTMLButtonElement>("#btn-run-shader").disabled = true;

                if (firstCorruptShader.documentIndex != this.sourceIndex) {

                    DOMUtils.get<HTMLSelectElement>("#select-source").selectedIndex = firstCorruptShader.documentIndex;

                    const transaction = this.editorView.state.update({
                        changes: {
                            from: 0, to: this.editorView.state.doc.length, insert:
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
                resultEl.classList.add("d-none");
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
                    return true;
                },
            }
        ];

        

        const state = EditorState.create({
            doc: shader.documents[this.sourceIndex].source,
            extensions: [
                solarizedDark,
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
                
                this.renderer.isPaused = true;

            } else {
                this.renderer.isPaused = false;
            }
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

        DOMUtils.on("click", "#btn-delete", () => {
            this.storage.delete(this.currentShader);

         
        
            // get the firstShader from the storage,
            let firstShader = this.storage.all()[0];
            this.setCurrentShader(firstShader);
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

        DOMUtils.on("click", "#btn-add-renderpass", () => {
            const renderpass: IDocumentData = {
                type: TypeOfShader.Frag,
                name: randomStr(),
                source: blueColorShader.fragment
            }
            this.currentShader.documents.push(renderpass);
            this.renderSourceList(this.currentShader.documents);
            this.updateCurrentShader();
        });

        DOMUtils.on("click", "#btn-remove-renderpass", () => {
            this.currentShader.documents.splice(this.sourceIndex, 1);
            const transaction = this.editorView.state.update({
                changes: {
                    from: 0, to: this.editorView.state.doc.length, insert:
                        this.currentShader.documents[0].source
                }
            })
            this.editorView.dispatch(transaction);
            this.sourceIndex = 0;
            this.renderSourceList(this.currentShader.documents);
        });

        DOMUtils.on("click", "#btn-export", () => {
        
            const blob = new Blob([this.storage.deSerialize()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = DOMUtils.create<HTMLAnchorElement>("a");
            a.href = url;
            a.download = 'data.json';
            a.click();
            URL.revokeObjectURL(url);          
          
        });

        DOMUtils.on<HTMLInputElement>("change","#upload-json", (evt,fileInput) => {
            if (!fileInput || fileInput.files?.length === 0) {
                return;
            }
            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = (event: ProgressEvent<FileReader>) => {
                const content = event.target?.result as string;
                try {
                    const data = JSON.parse(content) as IOfflineGraph<StoredShader>;
                        data.collection.forEach ( shader => {
                        const clone = new StoredShader(`${shader.name}`,
                            shader.description);
                        clone.documents = shader.documents;
                        this.storage.insert(clone);
                    });    
                    this.storage.save();
                    this.renderStoredShaders(this.storage.all())  
                    const p = DOMUtils.create("p");
                    p.textContent = "Shaders imported.";  
                    DOMUtils.get("#export-result").append(p);          
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                }
            };
            reader.readAsText(file);
        });

    }


    setCurrentShader(shader: StoredShader): void {
        this.currentShader = shader;
        DOMUtils.get<HTMLInputElement>("#shader-name").value = shader.name;
        DOMUtils.get<HTMLInputElement>("#shader-description").value = shader.description;
        // Create a transaction to replace the document
        const transaction = this.editorView.state.update({
            changes: { from: 0, to: this.editorView.state.doc.length, insert: shader.documents[0].source }
        });
        // Dispatch the transaction to the editor view
        this.editorView.dispatch(transaction);
        this.renderSourceList(shader.documents);
        this.editorView.focus();
        this.sourceIndex  = 0;
        
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
            const image = shader.thumbnail ? shader.thumbnail : "https://placehold.co/80x45?text=?";
            const template = `
                <li class="list-group-item d-flex justify-content-between align-items-start">
                   <img src="${image}" style="max-width:80px" class="img-thumbnail mr-3" >
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">${shader.name}</div>
                        ${DOMUtils.truncString(shader.description,80)}
                    </div>
                    <button class="btn btn-sm btn-secondary" data-id=${shader.id}">
                    <i class="bi bi-pencil-square"></i>
                    </button>
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

        parent.value = "0";

    }

    async initStorage(): Promise<StoredShader> {
        return new Promise((resolve, reject) => {
            try {
                this.storage = new OfflineStorage<StoredShader>("editor");
                this.storage.init();
                const lastModified = this.storage.all().sort((a: StoredShader, b: StoredShader) => {
                    return b.lastModified - a.lastModified
                })[0];
                this.renderSourceList(lastModified.documents);                
                resolve(lastModified);
            } catch (err) {
                this.storage = new OfflineStorage<StoredShader>("editor");
                this.storage.setup();
                axios.get<IOfflineGraph<StoredShader>>(`shaders/default.json?rnd=${randomStr()}`).then ( 
                    model => {
                    model.data.collection.forEach( shader => {
                    this.storage.insert(shader);
                    });
                    this.storage.save();
                    reject("No storage found")
                });                                
            }
        });
    }

    constructor() {
        this.setupUI();
        this.initStorage().then(shader => {

            this.storage.onChange = () => {
                this.renderStoredShaders(this.storage.all())
            }
            this.currentShader = shader;
            this.renderStoredShaders(this.storage.all())
            this.setupEditor(shader).then(r => {
                this.setCurrentShader(shader);
            });
        }).catch(err => {
            this.renderStoredShaders(this.storage.all());
            const shader = this.storage.all()[0];
            this.setupEditor(shader).then(r => {
                this.setCurrentShader(shader);
            });

        });

        DOMUtils.on<HTMLInputElement>("change", "#select-source", (ev, el) => {
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