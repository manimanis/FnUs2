<template>
  <div ref="editorContainer" class="codemirror-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { StreamLanguage } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';

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
      const word = stream.current();
      const keywords = new Set([
        'Début', 'Fin', 'Si', 'Alors', 'Sinon',
        'Tant', 'Que', 'Faire', 'Pour',
        'Répéter', 'Jusqu\'à',
        'Fonction', 'Procédure', 'Retourner',
        'Var', 'Type', 'de',
        'et', 'ou', 'non', 'mod', 'div'
      ]);
      const types = new Set(['entier', 'booleen', 'chaine', 'caractere']);
      const builtins = new Set(['Ecrire', 'Lire', 'long']);
      if (types.has(word)) return 'type';
      if (keywords.has(word)) return 'keyword';
      if (builtins.has(word)) return 'builtin';
      return 'variable';
    }
    if (stream.match('←') || stream.match('<-')) return 'operator';
    if (stream.match('!=')) return 'operator';
    if (stream.match('<=') || stream.match('>=')) return 'operator';
    if (stream.match('=')) return 'operator';
    if (stream.match('<') || stream.match('>')) return 'operator';
    if (stream.match('+') || stream.match('-') || stream.match('*') || stream.match('/')) return 'operator';
    if (stream.match(';')) return 'operator';
    if (stream.match(/^[(),\[\]]/)) return 'bracket';
    stream.next();
    return null;
  }
});

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
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

const extensions = [
  pseudoCodeLanguage,
  oneDark,
  lineNumbers(),
  keymap.of([defaultKeymap, indentWithTab]),
  updateListener,
  placeholderExt,
  EditorView.theme({
    '&': {
      height: '100%',
      fontSize: '14px'
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    '.cm-content': {
      caretColor: 'white'
    },
    '.cm-keyword': { color: '#bb86fc', fontWeight: 'bold' },
    '.cm-type': { color: '#4fc3f7' },
    '.cm-builtin': { color: '#82aaff' },
    '.cm-variable': { color: '#e0e0e0' },
    '.cm-string': { color: '#c3e88d' },
    '.cm-number': { color: '#f78c6c' },
    '.cm-comment': { color: '#6d6d8a', fontStyle: 'italic' },
    '.cm-operator': { color: '#89ddff' },
    '.cm-bracket': { color: '#e0e0e0' }
  }, { dark: true })
];

onMounted(() => {
  const state = EditorState.create({
    doc: props.modelValue,
    extensions
  });

  view = new EditorView({
    state,
    parent: editorContainer.value
  });
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
</script>

<style scoped>
.codemirror-wrapper {
  height: calc(100vh - 92px);
  border-radius: 6px;
  overflow: auto;
  background: #282c34;
}
</style>