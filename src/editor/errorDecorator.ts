import {ViewPlugin,ViewUpdate, EditorView, keymap,gutter, GutterMarker,DecorationSet, Decoration,WidgetType  } from "@codemirror/view";

import { EditorState,StateField,StateEffect  } from "@codemirror/state";


export function createLineMark(lineNumber: number,title:string) {
    return Decoration.line({
      class: "error-line",
      attributes: {
        title: title
      }
    }).range(lineNumber);
  }
  
  // Define the effect to add or remove decorations
  export const addDecorationEffect = StateEffect.define<{ lineNumber: number,title:string }>({
    map: (value, mapping) => ({ lineNumber: mapping.mapPos(value.lineNumber),title:value.title })
  });

  export const clearDecorationsEffect = StateEffect.define<void>();
  
  // Create a StateField to store the decorations
  export const decorationField = StateField.define<DecorationSet>({
    create() {
      return Decoration.none;
    },
    update(decorations, tr) {
        decorations = decorations.map(tr.changes);
        for (let effect of tr.effects) {
          if (effect.is(addDecorationEffect)) {
            decorations = decorations.update({
              add: [createLineMark(effect.value.lineNumber, effect.value.title)],
            });
          } else if (effect.is(clearDecorationsEffect)) {
            decorations = Decoration.none;
          }
        }
        return decorations;
    },
    provide: f => EditorView.decorations.from(f)
  });
  
  export function setTitleForLine(view: EditorView, lineNumber: number, title: string) {
    const line = view.state.doc.line(lineNumber ); 
    const transaction = view.state.update({
      effects: addDecorationEffect.of({ lineNumber: line.from, title })
    });
    view.dispatch(transaction);
  }

  export function clearAllDecorations(view: EditorView) {
    const transaction = view.state.update({
      effects: clearDecorationsEffect.of()
    });
    view.dispatch(transaction);
  }
