"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllDecorations = exports.setTitleForLine = exports.decorationField = exports.clearDecorationsEffect = exports.addDecorationEffect = exports.createLineMark = void 0;
const view_1 = require("@codemirror/view");
const state_1 = require("@codemirror/state");
function createLineMark(lineNumber, title) {
    return view_1.Decoration.line({
        class: "error-line",
        attributes: {
            title: title
        }
    }).range(lineNumber);
}
exports.createLineMark = createLineMark;
// Define the effect to add or remove decorations
exports.addDecorationEffect = state_1.StateEffect.define({
    map: (value, mapping) => ({ lineNumber: mapping.mapPos(value.lineNumber), title: value.title })
});
exports.clearDecorationsEffect = state_1.StateEffect.define();
// Create a StateField to store the decorations
exports.decorationField = state_1.StateField.define({
    create() {
        return view_1.Decoration.none;
    },
    update(decorations, tr) {
        decorations = decorations.map(tr.changes);
        for (let effect of tr.effects) {
            if (effect.is(exports.addDecorationEffect)) {
                decorations = decorations.update({
                    add: [createLineMark(effect.value.lineNumber, effect.value.title)],
                });
            }
            else if (effect.is(exports.clearDecorationsEffect)) {
                decorations = view_1.Decoration.none;
            }
        }
        return decorations;
    },
    provide: f => view_1.EditorView.decorations.from(f)
});
function setTitleForLine(view, lineNumber, title) {
    const line = view.state.doc.line(lineNumber);
    const transaction = view.state.update({
        effects: exports.addDecorationEffect.of({ lineNumber: line.from, title })
    });
    view.dispatch(transaction);
}
exports.setTitleForLine = setTitleForLine;
function clearAllDecorations(view) {
    const transaction = view.state.update({
        effects: exports.clearDecorationsEffect.of()
    });
    view.dispatch(transaction);
}
exports.clearAllDecorations = clearAllDecorations;
