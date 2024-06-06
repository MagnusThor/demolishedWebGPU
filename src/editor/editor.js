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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
const state_1 = require("@codemirror/state");
const view_1 = require("@codemirror/view");
const commands_1 = require("@codemirror/commands");
const DOMUtis_1 = require("./DOMUtis");
const Material_1 = require("../engine/Material");
const codemirror_1 = require("codemirror");
const lang_javascript_1 = require("@codemirror/lang-javascript");
const yy_fps_1 = require("yy-fps");
const language_1 = require("@codemirror/language");
const errorDecorator_1 = require("./errorDecorator");
const Renderer_1 = require("../engine/Renderer");
const Geometry_1 = require("../engine/Geometry");
const Rectangle_1 = require("../../example/meshes/Rectangle");
const mainShader_1 = require("../../example/shaders/shared/mainShader");
const raymarchShader_1 = require("../../example/shaders/wglsl/raymarchShader");
const fps = new yy_fps_1.FPS();
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
                console.log(err);
                DOMUtis_1.DOMUtils.get("#btn-run-shader").disabled = false;
            });
            return true;
        });
    }
    setupEditor() {
        return __awaiter(this, void 0, void 0, function* () {
            this.renderer = new Renderer_1.Renderer(document.querySelector("canvas"));
            yield this.renderer.init();
            const customKeymap = view_1.keymap.of([
                { key: "Mod-Shift-b", run: (view) => {
                        this.onCompile(view).then(shouldSave => {
                        });
                        return true;
                    } },
                ...commands_1.defaultKeymap,
            ]);
            const state = state_1.EditorState.create({
                doc: raymarchShader_1.raymarchShader.fragment,
                extensions: [codemirror_1.basicSetup, (0, lang_javascript_1.javascript)(), customKeymap,
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
            let editorView = new view_1.EditorView({
                state,
                parent: DOMUtis_1.DOMUtils.get("#editor")
            });
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
                    fragment: editorView.state.doc.toString(),
                    vertex: Material_1.defaultWglslVertex
                });
                this.tryAddShader(material).then(p => {
                    this.renderer.start(0, 200, (frame) => {
                        fps.frame();
                    });
                });
                isRunning = !isRunning;
            });
        });
    }
    constructor() {
        this.setupEditor().then(r => {
        });
    }
}
exports.Editor = Editor;
document.addEventListener("DOMContentLoaded", () => {
    const editor = new Editor();
});
