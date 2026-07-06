<template>
  <div ref="editorContainer" class="codemirror-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, indentWithTab, indentLess, insertNewlineAndIndent, history, historyKeymap } from '@codemirror/commands';
import { StreamLanguage, syntaxHighlighting, HighlightStyle, indentUnit, bracketMatching, foldGutter, foldKeymap, codeFolding, foldService } from '@codemirror/language';
import { lintGutter, lintKeymap } from '@codemirror/lint';

import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap, snippetCompletion } from "@codemirror/autocomplete";

import { tags } from '@lezer/highlight';
import { oneDark } from '@codemirror/theme-one-dark';
import { snippets, mySnippetsCompletion } from '../codemirror/snippets.js';
import { useTooltips } from '../composables/useTooltips.js';

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
    if (stream.match(/^[a-zA-Z_àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ][a-zA-Z0-9_'àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]*/)) {
      const word = stream.current().toLowerCase();
      const keywords = new Set([
        'algorithme', 'algo', 'début', 'debut', 'fin', 'si', 'alors', 'sinon',
        'tant', 'que', 'faire', 'pour', 'pas',
        'répéter', 'repeter', 'jusqu\'à', 'jusqu_a',
        'fonction', 'fonction', 'procédure', 'procedure', 'retourner',
        'var', 'type', 'de',
        'et', 'ou', 'non', 'mod', 'div',
        'finsi', 'finpour', 'fintantque', 'tantque', 'sinonsi'
      ]);
      const types = new Set(['entier', 'booleen', 'chaine', 'chaîne', 'caractere', 'caractère', 'reel', 'réel']);
      const builtins = new Set(['ecrire', 'lire', 'ecrire_nl', 'écrire', 'écrire_nl',
        'long', 'sous_chaine', 'effacer', 'pos', 'valeur', 'convch', 'majus', 'chr', 'ord',
        'abs', 'sin', 'cos', 'tan', 'alea', 'aléa', 'arrondi', 'ent', 'racine']);
      if (types.has(word)) return 'type';
      if (keywords.has(word)) return 'keyword';
      if (builtins.has(word)) return 'builtin';
      return 'variable';
    }
    const operators = ['←', '∈', '<-', '!=', '≠', '<=', '>=', '≤', '≥', '=', '<', '>', '+', '-', '*', '/', ';'];
    operators.forEach(op => {
      if (stream.match(op)) return 'operator';
    });
    if (stream.match(/^[(),\[\]]/)) return 'bracket';
    stream.next();
    return null;
  }
});


function customFoldService(state, lineStart) {
  const doc = state.doc;
  const line = doc.lineAt(lineStart);
  const text = line.text;

  // === Début ... Fin ===
  if (/^\s*Début\s*$/i.test(text)) {
    return findMatching(state, line, {
      open: /^\s*Début\s*$/i,
      close: /^\s*Fin\s*$/i
    });
  }

  // === Si ... Fin Si ===
  if (/^\s*Si\b/i.test(text)) {
    return findMatching(state, line, {
      open: /^\s*Si\b/i,
      close: /^\s*Fin\s+Si\b/i
    });
  }

  // === Pour ... Fin Pour ===
  if (/^\s*Pour\b/i.test(text)) {
    return findMatching(state, line, {
      open: /^\s*Pour\b/i,
      close: /^\s*Fin\s+Pour\b/i
    });
  }

  // === Tant Que ... Fin Tant Que ===
  if (/^\s*Tant\s+Que\b/i.test(text)) {
    return findMatching(state, line, {
      open: /^\s*Tant\s+Que\b/i,
      close: /^\s*Fin\s+Tant\s+Que\b/i
    });
  }

  // === Répéter ... Jusqu'à ===
  if (/^\s*Répéter\b/i.test(text)) {
    return findMatching(state, line, {
      open: /^\s*Répéter\b/i,
      close: /^\s*Jusqu'à\b/i,
      nested: false
    });
  }

  return null;
}


function findMatching(state, startLine, { open, close, nested = true }) {
  const doc = state.doc;
  let depth = 1;
  let pos = startLine.to + 1;

  while (pos <= doc.length) {
    const line = doc.lineAt(pos);
    const text = line.text;

    if (nested && open.test(text)) {
      depth++;
    }

    if (close.test(text)) {
      depth--;

      if (depth === 0) {
        return { from: startLine.to, to: line.from };
      }
    }

    pos = line.to + 1;
  }

  return null;
}


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
      if (pos >= prefixLen && state.doc.slice(pos - prefixLen, pos).toString() === prefix) {
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
let lastEmittedValue = props.modelValue; // Tracker la dernière valeur émise

// Theme compartment for dynamic theme switching
const themeCompartment = new Compartment();

// Tooltips integration
const { showTooltip, hideTooltip, getTooltip } = useTooltips();

const updateListener = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    const newValue = update.state.doc.toString();
    // N'émettre que si la valeur a vraiment changé (pas juste undo/redo interne)
    if (newValue !== lastEmittedValue) {
      lastEmittedValue = newValue;
      emit('update:modelValue', newValue);
    }
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
    highlightActiveLine(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    drawSelection(),
    rectangularSelection(),
    crosshairCursor(),
    bracketMatching(),
    codeFolding(),
    foldGutter({
      markerDOM(open) {
        const el = document.createElement("div");

        el.textContent = open ? "−" : "+";

        Object.assign(el.style, {
          width: "14px",
          height: "14px",
          border: "1px solid #aaa",
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: "bold",
          cursor: "pointer",
        });

        return el;
      }
    }),
    foldService.of(customFoldService),
    lintGutter(),
    EditorState.tabSize.of(2),
    indentUnit.of('  '),
    closeBrackets(),
    history({
      minDepth: 300,
      newGroupDelay: 500
    }),
    keymap.of([
      { key: 'Enter', run: indentAfterKeywords },
      ...defaultKeymap,
      ...historyKeymap,
      ...closeBracketsKeymap,
      ...foldKeymap,
      ...lintKeymap,
      ...completionKeymap,
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
    themeCompartment.of(dark ? [oneDark] : [lightTheme, lightSyntax]),
    baseTheme
  ];

  return exts;
}

function buildView() {
  if (view) {
    view.destroy();
  }
  lastEmittedValue = props.modelValue; // Réinitialiser le tracker
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

function updateTheme(dark) {
  if (!view) return;
  
  // Use compartment to swap theme without destroying the view
  view.dispatch({
    effects: themeCompartment.reconfigure(dark ? [oneDark] : [lightTheme, lightSyntax])
  });
}

// Méthode exposée pour mettre à jour le contenu de l'extérieur
function setContent(newValue) {
  if (view && newValue !== view.state.doc.toString()) {
    lastEmittedValue = newValue; // Mettre à jour le tracker AVANT le dispatch
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: newValue
      }
    });
  }
}

// Exposer la méthode
defineExpose({
  setContent
});


// Tooltip handling on mouse move
function handleMouseMove(event) {
  if (!view) return;

  const { state } = view;
  const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });

  if (pos === null) {
    hideTooltip();
    return;
  }

  // Find the word at the current position
  const wordRange = findWordAt(state, pos);
  if (!wordRange) {
    hideTooltip();
    return;
  }

  const word = state.doc.slice(wordRange.from, wordRange.to).toString();
  const tooltip = getTooltip(word);

  if (tooltip) {
    showTooltip(word, event);
  } else {
    hideTooltip();
  }
}

function findWordAt(state, pos) {
  const doc = state.doc;
  const line = doc.lineAt(pos);

  // Check if we're on a word character
  const charAtPos = doc.slice(pos, pos + 1).toString();
  if (!/[\wàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(charAtPos)) {
    return null;
  }

  // Find the start of the word
  let start = pos;
  while (start > line.from) {
    const char = doc.slice(start - 1, start).toString();
    if (!/[\wàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(char)) {
      break;
    }
    start--;
  }

  // Find the end of the word
  let end = pos;
  while (end < line.to) {
    const char = doc.slice(end, end + 1).toString();
    if (!/[\wàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(char)) {
      break;
    }
    end++;
  }

  // Check if it's a valid word (at least 2 characters)
  if (end - start < 2) {
    return null;
  }

  return { from: start, to: end };
}

onMounted(() => {
  buildView();

  // Add mouse move listener for tooltips
  if (editorContainer.value) {
    editorContainer.value.addEventListener('mousemove', handleMouseMove);
    editorContainer.value.addEventListener('mouseleave', hideTooltip);
  }
});

onUnmounted(() => {
  if (view) {
    view.destroy();
  }
  hideTooltip();

  // Remove mouse move listeners
  if (editorContainer.value) {
    editorContainer.value.removeEventListener('mousemove', handleMouseMove);
    editorContainer.value.removeEventListener('mouseleave', hideTooltip);
  }
});

watch(() => props.dark, (newDark) => {
  updateTheme(newDark);
});

watch(() => props.fontSize, (newSize) => {
  if (view) {
    const scroller = view.scrollDOM;
    if (scroller) {
      scroller.style.fontSize = `${newSize}px`;
    }
  }
});

// Watch for external changes to modelValue (e.g., when loading from localStorage)
watch(() => props.modelValue, (newValue) => {
  if (view && newValue !== undefined && newValue !== view.state.doc.toString()) {
    setContent(newValue);
  }
});

</script>

<style scoped>
.codemirror-wrapper {
  border-radius: 6px;
  overflow: auto;
}

@media (max-width: 1024px) {
  .codemirror-wrapper {
    height: 100%;
    border-radius: 6px;
    overflow: auto;
  }
}
</style>