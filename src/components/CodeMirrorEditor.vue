<template>
  <div ref="editorContainer" class="codemirror-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab, indentLess, insertNewlineAndIndent } from '@codemirror/commands';
import { StreamLanguage, syntaxHighlighting, HighlightStyle, indentUnit } from '@codemirror/language';

import { closeBrackets, closeBracketsKeymap, autocompletion, snippetCompletion } from "@codemirror/autocomplete";

import { tags } from '@lezer/highlight';
import { oneDark } from '@codemirror/theme-one-dark';
import { snippets, mySnippetsCompletion } from '../codemirror/snippets.js';

const pseudoCodeLanguage = StreamLanguage.define({
  name: 'pseudocode',
  startState: () => ({}),
  token: (stream) => {
    if (stream.match('//')) {
      stream.skipToEnd();
      return 'comment';
    }
    if (stream.match('"')) {
      stream.skipTo('"');
      stream.next();
      return 'string';
    }
    if (stream.match(/^\d+/)) {
      return 'number';
    }
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_'àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]*/)) {
      const word = stream.current().toLowerCase();
      const keywords = new Set([
        'début', 'debut', 'fin', 'si', 'alors', 'sinon',
        'tant', 'que', 'faire', 'pour', 'pas',
        'répéter', 'repeter', 'jusqu\'à', 'jusqu_a',
        'fonction', 'fonction', 'procédure', 'procedure', 'retourner',
        'var', 'type', 'de',
        'et', 'ou', 'non', 'mod', 'div'
      ]);
      const types = new Set(['entier', 'booleen', 'chaine', 'caractere']);
      const builtins = new Set(['ecrire', 'lire', 
      'long', 'sous_chaine', 'effacer', 'pos', 'valeur', 'convch', 'majus', 'chr', 'ord', 
      'abs', 'sin', 'cos', 'tan', 'alea', 'aléa', 'arrondi', 'ent', 'racine']);
      if (types.has(word)) return 'type';
      if (keywords.has(word)) return 'keyword';
      if (builtins.has(word)) return 'builtin';
      return 'variable';
    }
    const operators = ['←', '<-', '!=', '≠', '<=', '>=', '≤', '≥', '=', '<', '>', '+', '-', '*', '/', ';'];
    operators.forEach(op => {
      if (stream.match(op)) return 'operator';
    });
    if (stream.match(/^[(),\[\]]/)) return 'bracket';
    stream.next();
    return null;
  }
});

// Smart character replacement: define all symbol replacements in one place.
// The last character of each key is the trigger key; the preceding part is
// the prefix to look for before it.
const repSymbols = {
  '<-': '←',
  '>=': '≥',
  '<=': '≤',
  '(-': '∈',
  '!=': '≠'
};

// Build a lookup table from repSymbols: { triggerKey: { prefix: replacement } }
const digraphs = {};
for (const [seq, replacement] of Object.entries(repSymbols)) {
  const trigger = seq[seq.length - 1];
  const prefix = seq.slice(0, -1);
  (digraphs[trigger] ??= {})[prefix] = replacement;
}

function handleDigraph(key) {
  return (view) => {
    const { state, dispatch } = view;
    const pos = state.selection.main.head;
    const pairs = digraphs[key];
    if (!pairs || pos < 1) return false;

    for (const [prefix, replacement] of Object.entries(pairs)) {
      const prefixLen = prefix.length;
      if (pos >= prefixLen && state.sliceDoc(pos - prefixLen, pos) === prefix) {
        dispatch(state.update({
          changes: { from: pos - prefixLen, to: pos, insert: replacement },
          selection: { anchor: pos }
        }));
        return true;
      }
    }
    return false;
  };
}


const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  dark: {
    type: Boolean,
    default: true
  },
  fontSize: {
    type: Number,
    default: 13
  }
});

const emit = defineEmits(['update:modelValue']);

const editorContainer = ref(null);
let view = null;

const updateListener = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    emit('update:modelValue', update.state.doc.toString());
  }
});

const placeholderExt = EditorView.contentAttributes.of({
  'data-placeholder': props.placeholder
});

// Shared base theme for consistent sizing across both modes
const baseTheme = EditorView.theme({
  '&': {
    fontSize: `${props.fontSize}px`
  },
  '.cm-scroller': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  }
});

// Light mode syntax highlighting (uses lezer tags to apply colors)
const lightSyntax = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: '#7b1fa2', fontWeight: 'bold' },
  { tag: tags.typeName, color: '#00695c' },
  { tag: tags.bool, color: '#00695c' },
  { tag: tags.standard(tags.typeName), color: '#00695c' },
  { tag: tags.standard(tags.variableName), color: '#1565c0' },
  { tag: tags.variableName, color: '#2d2d3a' },
  { tag: tags.string, color: '#2e7d32' },
  { tag: tags.number, color: '#e65100' },
  { tag: tags.comment, color: '#9e9e9e', fontStyle: 'italic' },
  { tag: tags.operator, color: '#00695c' },
  { tag: tags.paren, color: '#2d2d3a' },
  { tag: tags.brace, color: '#2d2d3a' },
  { tag: tags.squareBracket, color: '#2d2d3a' },
]));

// Light mode base theme
const lightTheme = EditorView.theme({
  '&': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    backgroundColor: '#ffffff',
    color: '#2d2d3a'
  },
  '.cm-content': {
    caretColor: 'black'
  },
  '.cm-gutters': {
    backgroundColor: '#f5f5f8',
    color: '#6b6b80',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(98,0,238,0.08)'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(98,0,238,0.04)'
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(98,0,238,0.2)'
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(98,0,238,0.3)'
  },
  '.cm-cursor': {
    borderLeftColor: 'black'
  },
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(98,0,238,0.15)',
    outline: '1px solid rgba(98,0,238,0.3)'
  },
  '.cm-nonmatchingBracket': {
    backgroundColor: 'rgba(198,40,40,0.15)'
  },
  '.cm-placeholder': {
    color: '#9e9e9e',
    fontStyle: 'italic'
  }
}, { dark: false });


function indentAfterKeywords(view) {
  const indentKeywords = ['faire', 'alors', 'répéter', 'repeter', 'début', 'debut', 'fin'];
  const { state } = view;
  const { from } = state.selection.main;

  const line = state.doc.lineAt(from);
  const text = line.text;

  const shouldIndent = indentKeywords.some(kw =>
    text.trim().toLowerCase().endsWith(kw)
  );

  insertNewlineAndIndent(view);

  const pos = view.state.selection.main.from;

  if (shouldIndent) {
    view.dispatch({
      changes: { from: pos, insert: '  ' },
      selection: { anchor: pos + 2 }
    });
  }

  return true;
}

// Custom keymap for Tab, Shift+Tab, and smart character replacement
const customKeymap = keymap.of([
  {
    key: 'Shift-Tab', run: (view) => {
      const { state, dispatch } = view;
      if (dispatch) {
        const pos = state.selection.main.head;
        const line = state.doc.lineAt(pos);
        const lineText = line.text;
        const indentStr = lineText.slice(0, lineText.length - lineText.trimStart().length);
        if (indentStr.length >= 2) {
          dispatch(state.update({
            changes: { from: line.from, to: line.from + 2, insert: '' }
          }));
        }
        return true;
      }
      return false;
    }
  },
  { key: '-', run: handleDigraph('-') },
  { key: '>', run: handleDigraph('>') },
  { key: '=', run: handleDigraph('=') }
]);

function createExtensions(dark) {
  const exts = [
    pseudoCodeLanguage,
    lineNumbers(),
    EditorState.tabSize.of(2),
    indentUnit.of('  '),
    closeBrackets(),
    keymap.of([
      { key: 'Enter', run: indentAfterKeywords },
      ...defaultKeymap,
      ...closeBracketsKeymap,
      indentWithTab,
      { key: 'Backspace', run: indentLess },
    ]),
    customKeymap,
    updateListener,
    placeholderExt,
    autocompletion({
      override: [mySnippetsCompletion],
      activateOnTyping: true
    }),

  ];

  if (dark) {
    exts.push(oneDark);
  } else {
    exts.push(lightTheme);
    exts.push(lightSyntax);
  }

  exts.push(baseTheme);

  return exts;
}

function buildView() {
  if (view) {
    view.destroy();
  }
  const state = EditorState.create({
    doc: props.modelValue,
    extensions: createExtensions(props.dark)
  });
  view = new EditorView({
    state,
    parent: editorContainer.value
  });
  
  // Appliquer la taille de police
  if (view && props.fontSize) {
    const scroller = view.scrollDOM;
    if (scroller) {
      scroller.style.fontSize = `${props.fontSize}px`;
    }
  }
}

onMounted(() => {
  buildView();
});

onUnmounted(() => {
  if (view) {
    view.destroy();
  }
});

watch(() => props.modelValue, (newValue) => {
  if (view && newValue !== view.state.doc.toString()) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: newValue
      }
    });
  }
});

watch(() => props.dark, () => {
  buildView();
});

watch(() => props.fontSize, (newSize) => {
  if (view) {
    const scroller = view.scrollDOM;
    if (scroller) {
      scroller.style.fontSize = `${newSize}px`;
    }
  }
});
</script>

<style scoped>
.codemirror-wrapper {
  height: calc(100vh - 92px);
  border-radius: 6px;
  overflow: auto;
}
</style>