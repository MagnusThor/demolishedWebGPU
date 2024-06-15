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
const js_beautify_1 = __importDefault(require("js-beautify"));
const lang_rust_1 = require("@codemirror/lang-rust");
const language_1 = require("@codemirror/language");
const errorDecorator_1 = require("./errorDecorator");
const Renderer_1 = require("../engine/Renderer");
const Geometry_1 = require("../engine/Geometry");
const Rectangle_1 = require("../../example/meshes/Rectangle");
const blueColorShader_1 = require("../../example/shaders/wglsl/blueColorShader");
const OfflineStorage_1 = require("./store/OfflineStorage");
const StoredShader_1 = require("./models/StoredShader");
const FXAAShader_1 = require("../../example/shaders/shared/FXAAShader");
const fps = new yy_fps_1.FPS();
const randomStr = () => (Math.random() + 1).toString(36).substring(7);
class Editor {
    tryCompile(source) {
        return __awaiter(this, void 0, void 0, function* () {
            const shaderModule = this.renderer.device.createShaderModule({
                code: source
            });
            return yield shaderModule.getCompilationInfo();
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
    tryAddShader(shader) {
        return __awaiter(this, void 0, void 0, function* () {
            const geometry = new Geometry_1.Geometry(this.renderer.device, Rectangle_1.rectGeometry);
            yield this.renderer.addRenderPass("iChannel0", shader, geometry, []).catch(err => {
                console.log(err);
            });
            this.renderer.addMainPass(new Material_1.Material(this.renderer.device, FXAAShader_1.FAXXShader));
            return;
        });
    }
    onCompile(view) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = view.state.doc.toString();
            if (this.isRunning) {
                this.renderer.pause();
                this.isRunning = false;
            }
            const pa = DOMUtis_1.DOMUtils.get("#btn-run-shader i");
            if (pa.classList.contains("bi-stop-fill")) {
                pa.classList.remove("bi-stop-fill");
                pa.classList.add("bi-play-btn-fill");
            }
            this.tryCompile(source).then(conpileInfo => {
                DOMUtis_1.DOMUtils.get("#btn-run-shader").disabled = false;
                (0, errorDecorator_1.clearAllDecorations)(view);
                const resultEl = DOMUtis_1.DOMUtils.get("#compiler-result");
                DOMUtis_1.DOMUtils.removeChilds(resultEl);
                if (conpileInfo.messages.length > 0) {
                    DOMUtis_1.DOMUtils.get("#btn-run-shader").disabled = true;
                }
                conpileInfo.messages.forEach(error => {
                    resultEl.append(DOMUtis_1.DOMUtils.create("p").textContent = `${error.message} at line ${error.lineNum}.`);
                    (0, errorDecorator_1.setTitleForLine)(view, error.lineNum, error.message);
                });
            }).catch(err => {
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
                },
                {
                    key: "Mod-Shift-f", run: (view) => {
                        const code = view.state.doc.toString();
                        const formattedCode = (0, js_beautify_1.default)(code, {});
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
            const state = state_1.EditorState.create({
                doc: shader.source,
                extensions: [
                    (0, language_1.indentOnInput)(),
                    codemirror_1.basicSetup, (0, lang_rust_1.rust)(), view_1.keymap.of([
                        ...commands_1.defaultKeymap, ...customKeyMap, commands_1.indentWithTab
                    ]),
                    (0, language_1.syntaxHighlighting)(language_1.defaultHighlightStyle),
                    (0, language_1.bracketMatching)(),
                    errorDecorator_1.decorationField,
                    view_1.EditorView.lineWrapping,
                    view_1.EditorView.domEventHandlers({
                        click: () => {
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
            DOMUtis_1.DOMUtils.get("#btn-run-shader i").classList.toggle("bi-play-btn-fill");
            DOMUtis_1.DOMUtils.get("#btn-run-shader i").classList.toggle("bi-stop-fill");
            if (this.isRunning) {
                this.renderer.clear();
                this.renderer.isPaused = true;
            }
            else {
                this.renderer.isPaused = false;
            }
            const material = new Material_1.Material(this.renderer.device, {
                fragment: this.editorView.state.doc.toString(),
                vertex: Material_1.defaultWglslVertex
            });
            this.tryAddShader(material).then(p => {
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
            const item = new StoredShader_1.StoredShader(`Shader ${randomStr()}`, "N/A", blueColorShader_1.blueColorShader.fragment);
            this.storage.insert(item);
            this.setCurrentShader(item);
            this.storage.save();
        });
        DOMUtis_1.DOMUtils.on("click", "#btn-canvas-fullscreen", this.toggleCanvasFullScreen);
        DOMUtis_1.DOMUtils.on("click", "#btn-clone", () => {
            const clone = new StoredShader_1.StoredShader(`Copy of ${this.currentShader.name}`, this.currentShader.description, this.currentShader.source);
            this.storage.insert(clone);
            this.currentShader = clone;
        });
    }
    setCurrentShader(shader) {
        this.currentShader = shader;
        DOMUtis_1.DOMUtils.get("#shader-name").value = shader.name;
        DOMUtis_1.DOMUtils.get("#shader-description").value = shader.description;
        // Create a transaction to replace the document
        const transaction = this.editorView.state.update({
            changes: { from: 0, to: this.editorView.state.doc.length, insert: shader.source }
        });
        // Dispatch the transaction to the editor view
        this.editorView.dispatch(transaction);
    }
    updateCurrentShader() {
        this.currentShader.source = this.editorView.state.doc.toString();
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
            const item = DOMUtis_1.DOMUtils.toDOM(template);
            const button = DOMUtis_1.DOMUtils.get("button", item);
            button.dataset.id = shader.id;
            DOMUtis_1.DOMUtils.on("click", button, () => {
                this.setCurrentShader(shader);
            });
            parent.append(item);
        });
    }
    initStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    this.storage = new OfflineStorage_1.OfflineStorage("editor");
                    this.storage.init();
                    const lastModified = this.storage.model.collection.sort((a, b) => {
                        return b.lastModified - a.lastModified;
                    })[0];
                    resolve(lastModified);
                }
                catch (err) {
                    this.storage = new OfflineStorage_1.OfflineStorage("editor");
                    this.storage.setup();
                    // create a default shader and add it to the storage
                    const defaultShader = new StoredShader_1.StoredShader(`Shader ${randomStr()} `, `My first WGLSL Shader`, blueColorShader_1.blueColorShader.fragment);
                    this.storage.insert(defaultShader);
                    this.storage.save();
                    reject("No storage found");
                }
            });
        });
    }
    constructor() {
        this.setupUI();
        this.initStorage().then(shader => {
            this.storage.onChange = () => {
                this.renderStoredShaders(this.storage.model.collection);
            };
            this.currentShader = shader;
            this.renderStoredShaders(this.storage.model.collection);
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
exports.Editor = Editor;
document.addEventListener("DOMContentLoaded", () => {
    const editor = new Editor();
});
