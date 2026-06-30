<template>
  <div class="main-container">
    <div class="editor-panel">
      <div class="panel-header">
        <span>📝 Éditeur d'algorithme</span>
        <span style="font-size:0.7rem;color:var(--comment);">Ctrl+Enter: Exécuter</span>
      </div>
      <div class="editor-wrapper">
        <CodeMirrorEditor v-model="code" placeholder="Écrivez votre algorithme ici..." :dark="darkMode" />
      </div>
    </div>

    <div class="output-panel">
      <div class="output-section" v-if="activeTab === 'output'">
        <div class="panel-header">
          <span>🖥 Sortie d'exécution</span>
          <span v-if="executing" style="color:var(--warning)">⏳ Exécution...</span>
          <span v-if="execTime" style="font-size:0.7rem;color:var(--comment)">{{ execTime }}ms</span>
        </div>
        <div class="output-content" ref="outputContainer">
          <div v-for="(line, i) in outputLines" :key="i"
            :class="['output-line', line.type ? line.type + '-line' : '']">
            {{ line.text }}
          </div>
          <div v-if="outputLines.length === 0 && !executing" style="color:var(--comment);font-style:italic;">
            ▶ Exécuter pour voir les résultats...
          </div>
        </div>
      </div>

      <div class="output-section" v-if="activeTab === 'python'">
        <div class="panel-header">
          <span>🐍 Code Python généré</span>
          <button class="btn btn-outline" @click="copyPython" style="font-size:0.7rem;padding:4px 10px;">📋
            Copier</button>
        </div>
        <div class="output-content">
          <PythonHighlight v-if="pythonCode" ref="pythonElement" :code="pythonCode" :dark="darkMode" />
          <div v-else style="color:var(--comment);font-style:italic;">🐍 Convertir pour générer le code Python...
          </div>
        </div>
      </div>

      <div class="tabs">
        <div class="tab" :class="{ active: activeTab === 'output' }" @click="activeTab = 'output'">🖥 Sortie</div>
        <div class="tab" :class="{ active: activeTab === 'python' }" @click="activeTab = 'python'">🐍 Python</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { Lexer } from '../../js/lexer.js';
import { Parser } from '../../js/parser.js';
import { PythonConverter } from '../../js/converter.js';
import CodeMirrorEditor from '../components/CodeMirrorEditor.vue';
import PythonHighlight from '../components/PythonHighlight.vue';

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['message']);

const activeTab = ref('output');
const outputLines = ref([]);
const pythonCode = ref('');
const pythonElement = ref(null);
const executing = ref(false);
const execTime = ref(null);
const outputContainer = ref(null);
let snackbarTimer = null;
let worker = null;

const code = ref(`Var n, s: entier

Début
  s ← 0
  n ← 1
  Tant Que n <= 10 Faire
    s ← s + n
    n ← n + 1
  Fin Tant Que
  Ecrire("La somme est:", s)
Fin`);

const STORAGE_KEY = 'algo-plus-plus-state';

function showMessage(msg) {
  emit('message', msg);
}

function saveState() {
  const state = {
    code: code.value,
    outputLines: outputLines.value,
    pythonCode: pythonCode.value,
    activeTab: activeTab.value,
    execTime: execTime.value
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

function loadState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      if (state.code !== undefined) code.value = state.code;
      if (state.outputLines !== undefined) outputLines.value = state.outputLines;
      if (state.pythonCode !== undefined) pythonCode.value = state.pythonCode;
      if (state.activeTab !== undefined) activeTab.value = state.activeTab;
      if (state.execTime !== undefined) execTime.value = state.execTime;
    }
  } catch (e) { /* ignore */ }
}

watch([code, outputLines, pythonCode, activeTab, execTime], () => {
  saveState();
});

// Listen for events dispatched by App.vue header buttons
function handleEditorRun() { runCode(); }
function handleEditorStop() { stopExecution(); }
function handleEditorConvert() { convertCode(); }
function handleEditorClear() { clearAll(); }
function handleEditorSetCode(e) {
  code.value = e.detail.code;
  outputLines.value.splice(0);
  pythonCode.value = '';
}

onMounted(() => {
  loadState();
  worker = new Worker(new URL('../../js/worker.js', import.meta.url), { type: 'module' });

  function addOutput(outObj) {
    const lastOutput = outputLines.value.length > 0 ? outputLines.value[outputLines.value.length - 1] : null;
    if (lastOutput == null || lastOutput.type !== outObj.type) {
      outputLines.value.push(outObj);
    } else {
      lastOutput.text += outObj.text;
    }
    scrollOutput();
  }

  worker.onmessage = (e) => {
    const data = e.data;
    if (data.type === 'output') {
      if (typeof data.text === 'object' && data.text.type === 'error') {
        addOutput({ text: data.text.text, type: 'error' });
      } else {
        addOutput({ text: String(data.text) });
      }
    } else if (data.type === 'input_request') {
      const val = window.prompt(data.prompt);
      addOutput({ text: val });
      worker.postMessage({ type: 'input_response', id: data.id, value: val });
    } else if (data.type === 'done') {
      if (outputLines.value.length === 0) {
        addOutput({ text: '✅ Programme exécuté avec succès.', type: 'success' });
      } else {
        addOutput({ text: `✅ Terminé (${data.execTime}ms)`, type: 'success' });
      }
      execTime.value = data.execTime;
      executing.value = false;
    } else if (data.type === 'stopped') {
      addOutput({ text: '⛔ Exécution arrêtée par l\'utilisateur.', type: 'warning' });
      execTime.value = Math.round(performance.now() - startTime);
      executing.value = false;
    } else if (data.type === 'error') {
      addOutput({ text: `❌ ${data.text}`, type: 'error' });
      execTime.value = Math.round(performance.now() - startTime);
      executing.value = false;
    }
  };

  // Register custom event listeners from App.vue header
  window.addEventListener('editor-run', handleEditorRun);
  window.addEventListener('editor-stop', handleEditorStop);
  window.addEventListener('editor-convert', handleEditorConvert);
  window.addEventListener('editor-clear', handleEditorClear);
  window.addEventListener('editor-set-code', handleEditorSetCode);
});

onUnmounted(() => {
  if (worker) worker.terminate();
  window.removeEventListener('editor-run', handleEditorRun);
  window.removeEventListener('editor-stop', handleEditorStop);
  window.removeEventListener('editor-convert', handleEditorConvert);
  window.removeEventListener('editor-clear', handleEditorClear);
  window.removeEventListener('editor-set-code', handleEditorSetCode);
});

function scrollOutput() {
  nextTick(() => {
    if (outputContainer.value) {
      outputContainer.value.scrollTop = outputContainer.value.scrollHeight;
    }
  });
}

let startTime = 0;

function runCode() {
  outputLines.value.splice(0);
  pythonCode.value = '';
  activeTab.value = 'output';
  executing.value = true;
  execTime.value = null;
  startTime = performance.now();
  try {
    worker.postMessage({ type: 'run', code: code.value });
  } catch (err) {
    outputLines.value.push({ text: `❌ ${err.message}`, type: 'error' });
    execTime.value = Math.round(performance.now() - startTime);
    executing.value = false;
    scrollOutput();
  }
}

function stopExecution() {
  if (executing.value) {
    try {
      worker.postMessage({ type: 'stop', code: '' })
    } catch (err) {
      outputLines.value.push({ text: `❌ ${err.message}`, type: 'error' });
      execTime.value = Math.round(performance.now() - startTime);
      executing.value = false;
      scrollOutput();
    }
  }
}

function convertCode() {
  pythonCode.value = '';
  activeTab.value = 'python';
  try {
    const lexer = new Lexer(code.value);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const converter = new PythonConverter();
    pythonCode.value = converter.convert(ast);
    showMessage('✅ Conversion Python réussie !');
  } catch (err) {
    pythonCode.value = `# ERREUR: ${err.message}`;
    showMessage('❌ Erreur de conversion');
  }
}

function copyPython() {
  if (pythonCode.value) {
    new Promise((resolve, reject) => {
      try { copy(); resolve(); } catch (e) { reject(e); }
    })
      .then(() => showMessage('✅ Copié !'))
      .catch((e) => showMessage('❌ Copie échouée' + e));
  }
}

function clearAll() {
  code.value = '';
  outputLines.value.splice(0);
  pythonCode.value = '';
  activeTab.value = 'output';
  sessionStorage.removeItem(STORAGE_KEY);
  showMessage('🗑 Tout effacé');
}

function cloneWithInlineStyles(element) {
  const clone = element.cloneNode(true);
  function applyInlineStyles(source, target) {
    const computedStyle = window.getComputedStyle(source);
    const colorProperties = [
      "font-family", "font-size", "color", "background-color",
      "border-color", "border-top-color", "border-right-color",
      "border-bottom-color", "border-left-color", "outline-color",
      "text-decoration-color", "box-shadow"
    ];
    colorProperties.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== "rgba(0, 0, 0, 0)") {
        target.style.setProperty(prop, value);
      }
    });
    target.removeAttribute("class");
  }
  const sourceElements = [element, ...element.querySelectorAll("*")];
  const targetElements = [clone, ...clone.querySelectorAll("*")];
  sourceElements.forEach((srcEl, index) => {
    const targetEl = targetElements[index];
    applyInlineStyles(srcEl, targetEl);
  });
  return clone;
}

function copy() {
  const el = cloneWithInlineStyles(pythonElement.value?.preElement);
  el.innerHTML = "<p>" + el.innerHTML
    .replaceAll('\n', '</p><p>')
    .replaceAll('    ', '&nbsp;&nbsp;&nbsp;&nbsp;')
    + "</p>";
  navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([el.innerHTML], { type: "text/html" }),
      "text/plain": new Blob([pythonCode.value], { type: "text/plain" })
    })
  ]);
}
</script>