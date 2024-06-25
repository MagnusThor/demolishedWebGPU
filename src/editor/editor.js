"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
const state_1 = require("@codemirror/state");
const view_1 = require("@codemirror/view");
const commands_1 = require("@codemirror/commands");
const DOMUtis_1 = require("./DOMUtis");
const Material_1 = require("../engine/Material");
const codemirror_1 = require("codemirror");
const yy_fps_1 = require("yy-fps");
const lang_rust_1 = require("@codemirror/lang-rust");
const cm6_theme_solarized_dark_1 = require("cm6-theme-solarized-dark");
const language_1 = require("@codemirror/language");
const errorDecorator_1 = require("./errorDecorator");
const Renderer_1 = require("../engine/Renderer");
const Geometry_1 = require("../engine/Geometry");
const Rectangle_1 = require("../../example/meshes/Rectangle");
const blueColorShader_1 = require("../../example/shaders/wglsl/blueColorShader");
const OfflineStorage_1 = require("./store/OfflineStorage");
const StoredShader_1 = require("./models/StoredShader");
const mainShader_1 = require("../../example/shaders/shared/mainShader");
const axios_1 = __importDefault(require("axios"));
const fps = new yy_fps_1.FPS();
const randomStr = () => (Math.random() + 1).toString(36).substring(7);
class Editor {
    tryCompile(sources) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all(sources.map((document, index) => __awaiter(this, void 0, void 0, function* () {
                const source = document.source;
                const shaderModule = this.renderer.device.createShaderModule({
                    code: source
                });
                const compileError = {
                    documentIndex: index,
                    name: document.name,
                    errors: yield shaderModule.getCompilationInfo(),
                };
                return compileError;
            })));
            return results;
        });
    }
    initwebGPU() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!navigator.gpu) {
                console.error("WebGPU not supported on this browser.");
                return null;
            }
            const adapter = yield navigator.gpu.requestAdapter();
            if (!adapter) {
                console.error("Failed to get GPU adapter.");
                return null;
            }
            const device = yield adapter.requestDevice();
            return device;
        });
    }
    tryAddShaders(documents) {
        return __awaiter(this, void 0, void 0, function* () {
            this.renderer.renderPassBacklog.clear();
            const rectangle = new Geometry_1.Geometry(this.renderer.device, Rectangle_1.rectGeometry);
            yield Promise.all(documents.map((document, index) => __awaiter(this, void 0, void 0, function* () {
                const source = document.source;
                if (document.type === StoredShader_1.TypeOfShader.Frag) {
                    const material = new Material_1.Material(this.renderer.device, {
                        fragment: source,
                        vertex: Material_1.defaultWglslVertex
                    });
                    yield this.renderer.addRenderPass(`iChannel${index - 1}`, material, rectangle, []).catch(err => {
                        console.error(err);
                    });
                }
                return true;
            })));
            mainShader_1.mainShader.fragment = documents[0].source;
            this.updateMainRenderPass(mainShader_1.mainShader);
            return;
        });
    }
    updateMainRenderPass(material) {
        this.renderer.addMainPass(new Material_1.Material(this.renderer.device, material));
    }
    onCompile(view) {
        return __awaiter(this, void 0, void 0, function* () {
            this.renderer.clear();
            const source = view.state.doc.toString();
            this.currentShader.documents[this.sourceIndex].source = view.state.doc.toString();
            if (this.isRunning) {
                this.renderer.pause();
                this.isRunning = false;
            }
            const pa = DOMUtis_1.DOMUtils.get("#btn-run-shader i");
            if (pa.classList.contains("bi-stop-fill")) {
                pa.classList.remove("bi-stop-fill");
                pa.classList.add("bi-play-btn-fill");
            }
            this.tryCompile(this.currentShader.documents).then(compileInfo => {
                DOMUtis_1.DOMUtils.get("#btn-run-shader").disabled = false;
                (0, errorDecorator_1.clearAllDecorations)(view);
                const resultEl = DOMUtis_1.DOMUtils.get("#compiler-result");
                DOMUtis_1.DOMUtils.removeChilds(resultEl);
                const hasErrors = compileInfo.some(ci => ci.errors.messages.length > 0);
                if (hasErrors) {
                    resultEl.classList.remove("d-none");
                    const firstCorruptShader = compileInfo.filter(pre => {
                        return pre.errors.messages.length > 0;
                    })[0];
                    DOMUtis_1.DOMUtils.get("#btn-run-shader").disabled = true;
                    if (firstCorruptShader.documentIndex != this.sourceIndex) {
                        DOMUtis_1.DOMUtils.get("#select-source").selectedIndex = firstCorruptShader.documentIndex;
                        const transaction = this.editorView.state.update({
                            changes: {
                                from: 0, to: this.editorView.state.doc.length, insert: this.currentShader.documents[firstCorruptShader.documentIndex].source
                            }
                        });
                        // Dispatch the transaction to the editor view
                        this.editorView.dispatch(transaction);
                        this.sourceIndex = firstCorruptShader.documentIndex;
                    }
                    firstCorruptShader.errors.messages.forEach(error => {
                        resultEl.append(DOMUtis_1.DOMUtils.create("p").textContent = `${error.message} at line ${error.lineNum}.`);
                        (0, errorDecorator_1.setTitleForLine)(view, error.lineNum, error.message);
                    });
                }
                else {
                    resultEl.classList.add("d-none");
                    DOMUtis_1.DOMUtils.get("#btn-run-shader").disabled = false;
                }
            }).catch(err => {
                console.log(err);
                DOMUtis_1.DOMUtils.get("#btn-run-shader").disabled = true;
            });
            return true;
        });
    }
    toggleCanvasFullScreen() {
        const canvas = DOMUtis_1.DOMUtils.get("canvas");
        if (!document.fullscreenElement) {
            canvas.requestFullscreen();
        }
        else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
    setupEditor(shader) {
        return __awaiter(this, void 0, void 0, function* () {
            this.renderer = new Renderer_1.Renderer(document.querySelector("canvas"));
            yield this.renderer.init();
            const customKeyMap = [
                {
                    key: "Mod-Shift-b", run: (view) => {
                        this.onCompile(view).then(result => {
                            const typeToCompile = this.currentShader.documents[this.sourceIndex].type;
                            if (typeToCompile == StoredShader_1.TypeOfShader.Frag) {
                                const material = new Material_1.Material(this.renderer.device, {
                                    fragment: this.editorView.state.doc.toString(),
                                    vertex: Material_1.defaultWglslVertex
                                });
                            }
                            else if (typeToCompile === StoredShader_1.TypeOfShader.MainFrag) {
                                const mainFragSource = this.editorView.state.doc.toString();
                                const shader = {
                                    fragment: mainFragSource,
                                    vertex: mainShader_1.mainShader.vertex
                                };
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
                },
                {
                    key: "Mod-Shift-f", run: (view) => {
                        return true;
                    },
                }
            ];
            const state = state_1.EditorState.create({
                doc: shader.documents[this.sourceIndex].source,
                extensions: [
                    cm6_theme_solarized_dark_1.solarizedDark,
                    (0, language_1.indentOnInput)(),
                    codemirror_1.basicSetup, (0, lang_rust_1.rust)(), view_1.keymap.of([
                        ...commands_1.defaultKeymap, ...customKeyMap, commands_1.indentWithTab
                    ]),
                    (0, language_1.syntaxHighlighting)(language_1.defaultHighlightStyle),
                    (0, language_1.bracketMatching)(),
                    errorDecorator_1.decorationField,
                    view_1.EditorView.lineWrapping,
                    view_1.EditorView.domEventHandlers({
                        los: () => {
                        }
                    })
                ],
            });
            this.editorView = new view_1.EditorView({
                state,
                parent: DOMUtis_1.DOMUtils.get("#editor")
            });
            this.state = state;
            this.isRunning = false;
        });
    }
    setupUI() {
        DOMUtis_1.DOMUtils.get("#btn-run-shader").addEventListener("click", (e) => {
            this.currentShader.documents[this.sourceIndex].source = this.editorView.state.doc.toString();
            DOMUtis_1.DOMUtils.get("#btn-run-shader i").classList.toggle("bi-play-btn-fill");
            DOMUtis_1.DOMUtils.get("#btn-run-shader i").classList.toggle("bi-stop-fill");
            if (this.isRunning) {
                this.renderer.isPaused = true;
            }
            else {
                this.renderer.isPaused = false;
            }
            this.tryAddShaders(this.currentShader.documents).then(p => {
                this.renderer.start(0, 200, (frame) => {
                    fps.frame();
                });
            });
            this.isRunning = !this.isRunning;
        });
        DOMUtis_1.DOMUtils.on("click", "#btn-save", () => {
            this.updateCurrentShader();
        });
        DOMUtis_1.DOMUtils.on("click", "#btn-new", () => {
            const item = new StoredShader_1.StoredShader(`Shader ${randomStr()}`, "N/A");
            item.addDocument(randomStr(), mainShader_1.mainShader.fragment, StoredShader_1.TypeOfShader.MainFrag);
            item.addDocument(randomStr(), blueColorShader_1.blueColorShader.fragment, StoredShader_1.TypeOfShader.Frag);
            this.storage.insert(item);
            this.setCurrentShader(item);
            this.storage.save();
        });
        DOMUtis_1.DOMUtils.on("click", "#btn-delete", () => {
            this.storage.delete(this.currentShader);
            // get the firstShader from the storage,
            let firstShader = this.storage.all()[0];
            this.setCurrentShader(firstShader);
            this.storage.save();
        });
        DOMUtis_1.DOMUtils.on("click", "#btn-canvas-fullscreen", this.toggleCanvasFullScreen);
        DOMUtis_1.DOMUtils.on("click", "#btn-clone", () => {
            const clone = new StoredShader_1.StoredShader(`Copy of ${this.currentShader.name}`, this.currentShader.description);
            clone.documents = this.currentShader.documents;
            this.storage.insert(clone);
            this.currentShader = clone;
        });
        DOMUtis_1.DOMUtils.on("click", "#btn-add-renderpass", () => {
            const renderpass = {
                type: StoredShader_1.TypeOfShader.Frag,
                name: randomStr(),
                source: blueColorShader_1.blueColorShader.fragment
            };
            this.currentShader.documents.push(renderpass);
            this.renderSourceList(this.currentShader.documents);
            this.updateCurrentShader();
        });
        DOMUtis_1.DOMUtils.on("click", "#btn-remove-renderpass", () => {
            this.currentShader.documents.splice(this.sourceIndex, 1);
            const transaction = this.editorView.state.update({
                changes: {
                    from: 0, to: this.editorView.state.doc.length, insert: this.currentShader.documents[0].source
                }
            });
            this.editorView.dispatch(transaction);
            this.sourceIndex = 0;
            this.renderSourceList(this.currentShader.documents);
        });
        DOMUtis_1.DOMUtils.on("click", "#btn-export", () => {
            const blob = new Blob([this.storage.deSerialize()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = DOMUtis_1.DOMUtils.create("a");
            a.href = url;
            a.download = 'data.json';
            a.click();
            URL.revokeObjectURL(url);
        });
        DOMUtis_1.DOMUtils.on("change", "#upload-json", (evt, fileInput) => {
            var _a;
            if (!fileInput || ((_a = fileInput.files) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                return;
            }
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                var _a;
                const content = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                try {
                    const data = JSON.parse(content);
                    data.collection.forEach(shader => {
                        const clone = new StoredShader_1.StoredShader(`${shader.name}`, shader.description);
                        clone.documents = shader.documents;
                        this.storage.insert(clone);
                    });
                    this.storage.save();
                    this.renderStoredShaders(this.storage.all());
                    const p = DOMUtis_1.DOMUtils.create("p");
                    p.textContent = "Shaders imported.";
                    DOMUtis_1.DOMUtils.get("#export-result").append(p);
                }
                catch (e) {
                    console.error('Error parsing JSON:', e);
                }
            };
            reader.readAsText(file);
        });
    }
    setCurrentShader(shader) {
        this.currentShader = shader;
        DOMUtis_1.DOMUtils.get("#shader-name").value = shader.name;
        DOMUtis_1.DOMUtils.get("#shader-description").value = shader.description;
        // Create a transaction to replace the document
        const transaction = this.editorView.state.update({
            changes: { from: 0, to: this.editorView.state.doc.length, insert: shader.documents[0].source }
        });
        // Dispatch the transaction to the editor view
        this.editorView.dispatch(transaction);
        this.renderSourceList(shader.documents);
        this.editorView.focus();
        this.sourceIndex = 0;
    }
    updateCurrentShader() {
        this.currentShader.documents[this.sourceIndex].source = this.editorView.state.doc.toString();
        this.currentShader.name = DOMUtis_1.DOMUtils.get("#shader-name").value;
        this.currentShader.description = DOMUtis_1.DOMUtils.get("#shader-description").value;
        this.storage.update(this.currentShader);
        this.currentShader.thumbnail = this.renderer.canvas.toDataURL();
        this.storage.save();
    }
    renderStoredShaders(shaders) {
        const parent = DOMUtis_1.DOMUtils.get("#lst-shaders");
        DOMUtis_1.DOMUtils.removeChilds(parent);
        shaders.forEach(shader => {
            const image = shader.thumbnail ? shader.thumbnail : "https://placehold.co/80x45?text=?";
            const template = `
                <li class="list-group-item d-flex justify-content-between align-items-start">
                   <img src="${image}" style="max-width:80px" class="img-thumbnail mr-3" >
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">${shader.name}</div>
                        ${DOMUtis_1.DOMUtils.truncString(shader.description, 80)}
                    </div>
                    <button class="btn btn-sm btn-secondary" data-id=${shader.id}">
                    <i class="bi bi-pencil-square"></i>
                    </button>
                </li>`;
            const item = DOMUtis_1.DOMUtils.toDOM(template);
            const button = DOMUtis_1.DOMUtils.get("button", item);
            button.dataset.id = shader.id;
            DOMUtis_1.DOMUtils.on("click", button, () => {
                this.setCurrentShader(shader);
            });
            parent.append(item);
        });
    }
    renderSourceList(documents) {
        const parent = DOMUtis_1.DOMUtils.get("#select-source");
        DOMUtis_1.DOMUtils.removeChilds(parent);
        documents.forEach((doc, index) => {
            const option = DOMUtis_1.DOMUtils.create("option");
            const suffix = doc.type === StoredShader_1.TypeOfShader.Frag ? `iChannel${index}` : "";
            option.text = `${doc.name}(${doc.type}) ${suffix}`;
            option.value = index.toString();
            parent.append(option);
        });
        parent.value = "0";
    }
    initStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    this.storage = new OfflineStorage_1.OfflineStorage("editor");
                    this.storage.init();
                    const lastModified = this.storage.all().sort((a, b) => {
                        return b.lastModified - a.lastModified;
                    })[0];
                    this.renderSourceList(lastModified.documents);
                    resolve(lastModified);
                }
                catch (err) {
                    this.storage = new OfflineStorage_1.OfflineStorage("editor");
                    this.storage.setup();
                    axios_1.default.get(`shaders/default.json?rnd=${randomStr()}`).then(model => {
                        model.data.collection.forEach(shader => {
                            this.storage.insert(shader);
                        });
                        this.storage.save();
                        reject("No storage found");
                    });
                }
            });
        });
    }
    constructor() {
        this.sourceIndex = 0;
        this.setupUI();
        this.initStorage().then(shader => {
            this.storage.onChange = () => {
                this.renderStoredShaders(this.storage.all());
            };
            this.currentShader = shader;
            this.renderStoredShaders(this.storage.all());
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
        DOMUtis_1.DOMUtils.on("change", "#select-source", (ev, el) => {
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
exports.Editor = Editor;
document.addEventListener("DOMContentLoaded", () => {
    const getURLParameter = (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };
    const widthStr = getURLParameter("w");
    const heightStr = getURLParameter("h");
    // Type Assertions for Safety
    const width = widthStr ? parseInt(widthStr, 10) : null;
    const height = heightStr ? parseInt(heightStr, 10) : null;
    if (width && height) {
        const canvas = document.querySelector("#result-canvas");
        canvas.width = width;
        canvas.height = height;
    }
    const editor = new Editor();
});
