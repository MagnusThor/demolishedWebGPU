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
exports.Editor = exports.StoredShader = void 0;
const state_1 = require("@codemirror/state");
const view_1 = require("@codemirror/view");
const commands_1 = require("@codemirror/commands");
const DOMUtis_1 = require("./DOMUtis");
const Material_1 = require("../engine/Material");
const codemirror_1 = require("codemirror");
const lang_javascript_1 = require("@codemirror/lang-javascript");
const yy_fps_1 = require("yy-fps");
const js_beautify_1 = __importDefault(require("js-beautify"));
const language_1 = require("@codemirror/language");
const errorDecorator_1 = require("./errorDecorator");
const Renderer_1 = require("../engine/Renderer");
const Geometry_1 = require("../engine/Geometry");
const Rectangle_1 = require("../../example/meshes/Rectangle");
const blueColorShader_1 = require("../../example/shaders/wglsl/blueColorShader");
const mainShader_1 = require("../../example/shaders/shared/mainShader");
const OfflineStorage_1 = require("./OfflineStorage");
const fps = new yy_fps_1.FPS();
const randomStr = () => (Math.random() + 1).toString(36).substring(7);
/*
 LocalStorage related stuff
*/
class StoredShader extends OfflineStorage_1.IEntityBase {
    constructor(name, description, source) {
        super();
        this.name = name;
        this.description = description;
        this.source = source;
    }
}
exports.StoredShader = StoredShader;
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
            this.renderer.addMainPass(new Material_1.Material(this.renderer.device, mainShader_1.mainShader));
            return;
        });
    }
    onCompile(view) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = view.state.doc.toString();
            this.tryCompile(source).then(conpileInfo => {
                DOMUtis_1.DOMUtils.get("#btn-run-shader").disabled = false;
                (0, errorDecorator_1.clearAllDecorations)(view);
                const resultEl = DOMUtis_1.DOMUtils.get("#compiler-result");
                resultEl.textContent = "There is no errors.";
                conpileInfo.messages.forEach(error => {
                    resultEl.append(DOMUtis_1.DOMUtils.create("p").textContent = `${error.message} at line ${error.lineNum}.`);
                    (0, errorDecorator_1.setTitleForLine)(view, error.lineNum, error.message);
                });
            }).catch(err => {
                DOMUtis_1.DOMUtils.get("#btn-run-shader").disabled = false;
            });
            return true;
        });
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
                        const formattedCode = (0, js_beautify_1.default)(code, { /* Beautify options */});
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
            const editorKeymap = view_1.keymap.of([
                ...commands_1.defaultKeymap, ...customKeyMap, commands_1.indentWithTab
            ]);
            const state = state_1.EditorState.create({
                doc: shader.source,
                extensions: [
                    (0, language_1.indentOnInput)(),
                    codemirror_1.basicSetup, (0, lang_javascript_1.javascript)(), editorKeymap,
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
            let isRunning = false;
            DOMUtis_1.DOMUtils.get("#btn-run-shader").addEventListener("click", (e) => {
                DOMUtis_1.DOMUtils.toggleClasses("#btn-run-shader i", ["bi-play-btn-fill", "bi-stop-fill"]);
                if (isRunning) {
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
                isRunning = !isRunning;
            });
            DOMUtis_1.DOMUtils.on("click", "#btn-save", () => {
                this.updateCurrentShader();
            });
            DOMUtis_1.DOMUtils.on("click", "#btn-new", () => {
                const item = new StoredShader(`Shader ${randomStr()}`, "N/A", blueColorShader_1.blueColorShader.fragment);
                this.storage.insert(item);
                this.setCurrentShader(item);
                this.storage.save();
            });
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
        this.storage.save();
        this.renderStoredShaders(this.storage.model.collection);
    }
    renderStoredShaders(shaders) {
        const parent = DOMUtis_1.DOMUtils.get("#lst-shaders");
        DOMUtis_1.DOMUtils.removeChilds(parent);
        shaders.forEach(shader => {
            const template = `
                <li class="list-group-item d-flex justify-content-between align-items-start">
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
                    resolve(this.storage.model.collection[0]);
                }
                catch (err) {
                    this.storage = new OfflineStorage_1.OfflineStorage("editor");
                    this.storage.setup();
                    // create a default shader and add it to the storage
                    const defaultShader = new StoredShader(`Shader ${randomStr()} `, `My first WGLSL Shader`, blueColorShader_1.blueColorShader.fragment);
                    this.storage.insert(defaultShader);
                    this.storage.save();
                    reject("No storage found");
                }
            });
        });
    }
    constructor() {
        this.initStorage().then(shader => {
            this.currentShader = shader;
            this.renderStoredShaders(this.storage.model.collection);
            this.setupEditor(shader).then(r => {
                this.setCurrentShader(shader);
            });
        }).catch(err => {
            this.renderStoredShaders(this.storage.model.collection);
        });
    }
}
exports.Editor = Editor;
document.addEventListener("DOMContentLoaded", () => {
    const editor = new Editor();
});
