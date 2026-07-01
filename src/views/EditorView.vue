<template>
  <div class="main-container" :class="{ 'split-view': splitView, 'presentation-mode': presentationMode, 'fullscreen': isFullscreen }" :style="splitView ? getContainerStyle() : {}">
    <div class="editor-panel">
      <div class="panel-header">
        <span>📝 Éditeur d'algorithme</span>
        <div class="header-actions">
          <span style="font-size:0.7rem;color:var(--comment);">Ctrl+Enter: Exécuter</span>
          <button class="btn-icon" @click="toggleSplitView" :title="splitView ? 'Vue unifiée' : 'Vue splitée'">
            {{ splitView ? '◀' : '▶' }}
          </button>
        </div>
      </div>
      <div class="editor-wrapper">
        <CodeMirrorEditor 
          v-model="code" 
          placeholder="Écrivez votre algorithme ici..." 
          :dark="darkMode"
          :fontSize="fontSize"
        />
      </div>
    </div>

    <div v-if="splitView" class="resizer" @mousedown="startResize"></div>

    <div class="output-panel" v-show="splitView || !splitView">
      <div class="output-section" v-if="activeTab === 'output'">
        <div class="panel-header">
          <span>🖥 Sortie d'exécution</span>
          <div class="header-actions">
            <span v-if="executing" style="color:var(--warning)">⏳ Exécution...</span>
            <span v-if="execTime" style="font-size:0.7rem;color:var(--comment)">{{ execTime }}ms</span>
            <button class="btn-icon" @click="exportOutput" title="Exporter TXT">📥</button>
            <button class="btn-icon" @click="exportPDF" title="Exporter PDF">📄</button>
            <button class="btn-icon" @click="takeScreenshot" title="Capture d'écran">📷</button>
          </div>
        </div>
        <div class="output-content" ref="outputContainer">
          <div v-for="(line, i) in outputLines" :key="i"
            :class="['output-line', line.type ? line.type + '-line' : '']">
            {{ line.text }}
          </div>
          <div v-if="showInputModal" class="input-line">
            <span class="input-prompt-text">{{ inputModalMessage }}</span>
            <input
              ref="inlineInputRef"
              v-model="inputValue"
              type="text"
              @keyup.enter="submitInlineInput"
              @keyup.esc="cancelInlineInput"
              class="inline-input"
            />
          </div>
          <div v-if="executing && outputLines.length > 0 && execTime === null" class="executing-indicator">
            <span class="executing-spinner"></span>
            <span>Exécution en cours...</span>
          </div>
          <div v-if="outputLines.length === 0 && !executing && !showInputModal" style="color:var(--comment);font-style:italic;">
            ▶ Exécuter pour voir les résultats...
          </div>
        </div>
      </div>

      <div class="output-section" v-if="activeTab === 'data'">
        <div class="panel-header">
          <span>📊 Données d'entrée</span>
          <div class="header-actions">
            <button class="btn-icon" @click="clearData" title="Effacer les données">🗑</button>
          </div>
        </div>
        <div class="output-content data-content">
          <div class="data-help">
            Saisissez les valeurs qui seront lues par l'instruction <code>Lire</code>, une par ligne.
            Si le nombre de données est insuffisant, une saisie interactive sera demandée.
          </div>
          <textarea
            v-model="dataText"
            class="data-textarea"
            placeholder="12&#10;42&#10;Bonjour&#10;3.14"
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <div class="output-section" v-if="activeTab === 'python'">
        <div class="panel-header">
          <span>🐍 Code Python généré</span>
          <div class="header-actions">
            <button class="btn btn-outline" @click="copyPython" style="font-size:0.7rem;padding:4px 10px;">📋 Copier</button>
            <button class="btn-icon" @click="takeScreenshot" title="Capture d'écran">📷</button>
          </div>
        </div>
        <div class="output-content" ref="pythonContainer">
          <PythonHighlight v-if="pythonCode" ref="pythonElement" :code="pythonCode" :dark="darkMode" />
          <div v-else style="color:var(--comment);font-style:italic;">🐍 Convertir pour générer le code Python...
          </div>
        </div>
      </div>

      <div class="tabs">
        <div class="tab" :class="{ active: activeTab === 'output' }" @click="activeTab = 'output'">🖥 Sortie</div>
        <div class="tab" :class="{ active: activeTab === 'data' }" @click="activeTab = 'data'">📊 Données</div>
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
import { useStorage } from '../composables/useStorage.js';
import { useWorker } from '../composables/useWorker.js';
import { useKeyboardShortcuts, createShortcut, createKeyShortcut } from '../composables/useKeyboardShortcuts.js';

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['message']);

// Storage composables
const { value: activeTab, load: loadTab, save: saveTab } = useStorage('algo-plus-plus-active-tab', 'output', sessionStorage);
const { value: outputLines, load: loadOutput, save: saveOutput } = useStorage('algo-plus-plus-output', [], sessionStorage);
const { value: pythonCode, load: loadPython, save: savePython } = useStorage('algo-plus-plus-python', '', sessionStorage);
const { value: dataText, load: loadData, save: saveData } = useStorage('algo-plus-plus-data', '', localStorage);
const { value: fontSize, load: loadFontSize } = useStorage('algo-plus-plus-font-size', 13);
const { value: splitView, load: loadSplitView } = useStorage('algo-plus-plus-split-view', true);
const { value: editorWidth, load: loadEditorWidth } = useStorage('algo-plus-plus-editor-width', 50);
const { value: editorHeight, load: loadEditorHeight } = useStorage('algo-plus-plus-editor-height', 50);

// Refs
const pythonElement = ref(null);
const outputContainer = ref(null);
const pythonContainer = ref(null);
const isResizing = ref(false);
const presentationMode = ref(false);
const isFullscreen = ref(false);
const isHorizontalSplit = ref(false);

// Input inline state
const showInputModal = ref(false);
const inputModalMessage = ref('');
const inputValue = ref('');
const pendingInputId = ref(null);
const inlineInputRef = ref(null);

// Auto-focus input when it appears
watch(showInputModal, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (inlineInputRef.value) {
        inlineInputRef.value.focus();
        inlineInputRef.value.select();
      }
    });
  }
});

// Worker composable
const { 
  worker, 
  executing, 
  execTime, 
  init: initWorker, 
  terminate: terminateWorker, 
  postMessage: postWorkerMessage,
  setExecuting,
  setExecTime
} = useWorker('../../js/worker.js');

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

// Auto-save watcher
watch(code, () => {
  saveState();
}, { deep: true });

const STORAGE_KEY = 'algo-plus-plus-state';

function showMessage(msg) {
  emit('message', msg);
}

function addOutput(outObj) {
  const lastOutput = outputLines.value.length > 0 ? outputLines.value[outputLines.value.length - 1] : null;
  if (lastOutput == null || lastOutput.type !== outObj.type) {
    outputLines.value.push(outObj);
  } else {
    lastOutput.text += outObj.text;
  }
  scrollOutput();
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
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

// Load preferences
loadFontSize();
loadSplitView();
loadEditorWidth();
loadEditorHeight();
loadData();

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

function handleChangeFontSize(e) {
  if (e.detail && e.detail.delta) {
    changeFontSize(e.detail.delta);
  }
}

onMounted(() => {
  loadState();
  initWorker();

  // Détecter le mode de split selon la taille de la fenêtre
  function updateSplitMode() {
    isHorizontalSplit.value = window.innerWidth < 1024;
  }
  updateSplitMode();
  window.addEventListener('resize', updateSplitMode);

  worker.value.onmessage = (e) => {
    const data = e.data;
    if (data.type === 'output') {
      if (typeof data.text === 'object' && data.text.type === 'error') {
        addOutput({ text: data.text.text, type: 'error' });
      } else {
        addOutput({ text: String(data.text) });
      }
    } else if (data.type === 'input_request') {
      pendingInputId.value = data.id;
      inputModalMessage.value = data.prompt;
      showInputModal.value = true;
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
      setExecTime();
      executing.value = false;
    } else if (data.type === 'error') {
      addOutput({ text: `❌ ${data.text}`, type: 'error' });
      setExecTime();
      executing.value = false;
    }
  };

  // Register custom event listeners from App.vue header
  window.addEventListener('editor-run', handleEditorRun);
  window.addEventListener('editor-stop', handleEditorStop);
  window.addEventListener('editor-convert', handleEditorConvert);
  window.addEventListener('editor-clear', handleEditorClear);
  window.addEventListener('editor-set-code', handleEditorSetCode);
  window.addEventListener('editor-change-font-size', handleChangeFontSize);
  window.addEventListener('editor-toggle-presentation', togglePresentationMode);
  window.addEventListener('editor-toggle-fullscreen', toggleFullscreen);
  
  // Raccourcis clavier
  useKeyboardShortcuts([
    createShortcut(true, '=', changeFontSize.bind(null, 1)),
    createShortcut(true, '+', changeFontSize.bind(null, 1)),
    createShortcut(true, '-', changeFontSize.bind(null, -1)),
    createKeyShortcut('F11', toggleFullscreen),
    createShortcut(true, 'p', togglePresentationMode),
    createShortcut(true, 's', () => {
      saveState();
      showMessage('✅ État sauvegardé');
    })
  ]);
  
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  terminateWorker();
  window.removeEventListener('editor-run', handleEditorRun);
  window.removeEventListener('editor-stop', handleEditorStop);
  window.removeEventListener('editor-convert', handleEditorConvert);
  window.removeEventListener('editor-clear', handleEditorClear);
  window.removeEventListener('editor-set-code', handleEditorSetCode);
  window.removeEventListener('editor-change-font-size', handleChangeFontSize);
  window.removeEventListener('editor-toggle-presentation', togglePresentationMode);
  window.removeEventListener('editor-toggle-fullscreen', toggleFullscreen);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  window.removeEventListener('resize', updateSplitMode);
});

function scrollOutput() {
  nextTick(() => {
    if (outputContainer.value) {
      outputContainer.value.scrollTop = outputContainer.value.scrollHeight;
    }
  });
}

function parseDataInputs() {
  return dataText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

function runCode() {
  outputLines.value.splice(0);
  pythonCode.value = '';
  activeTab.value = 'output';
  setExecuting(true);
  execTime.value = null;
  try {
    const dataInputs = parseDataInputs();
    postWorkerMessage({ type: 'run', code: code.value, dataInputs });
  } catch (err) {
    outputLines.value.push({ text: `❌ ${err.message}`, type: 'error' });
    setExecTime();
    setExecuting(false);
    scrollOutput();
  }
}

function stopExecution() {
  if (executing.value) {
    try {
      postWorkerMessage({ type: 'stop', code: '' })
    } catch (err) {
      outputLines.value.push({ text: `❌ ${err.message}`, type: 'error' });
      setExecTime();
      setExecuting(false);
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

// Vue splitée
function toggleSplitView() {
  splitView.value = !splitView.value;
}

function getContainerStyle() {
  if (isHorizontalSplit.value) {
    return {
      '--editor-size': `${editorHeight.value}%`
    };
  } else {
    return {
      '--editor-size': `${editorWidth.value}%`
    };
  }
}

function startResize(e) {
  isResizing.value = true;
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
}

function resize(e) {
  if (!isResizing.value) return;
  const container = document.querySelector('.main-container');
  const containerRect = container.getBoundingClientRect();
  
  if (isHorizontalSplit.value) {
    // Split horizontal : on ajuste la hauteur
    const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    editorHeight.value = Math.min(Math.max(newHeight, 20), 80);
  } else {
    // Split vertical : on ajuste la largeur
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    editorWidth.value = Math.min(Math.max(newWidth, 20), 80);
  }
}

function stopResize() {
  isResizing.value = false;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
}

// Taille de police
function changeFontSize(delta) {
  const newSize = fontSize.value + delta;
  if (newSize >= 10 && newSize <= 24) {
    fontSize.value = newSize;
  }
}

// Mode présentation
function togglePresentationMode() {
  presentationMode.value = !presentationMode.value;
  if (presentationMode.value) {
    splitView.value = true;
    editorWidth.value = 50;
  }
}

// Mode plein écran
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      showMessage('❌ Impossible de passer en plein écran');
    });
  } else {
    document.exitFullscreen();
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

// Export TXT
function exportOutput() {
  if (outputLines.value.length === 0) {
    showMessage('⚠️ Aucune sortie à exporter');
    return;
  }
  
  const text = outputLines.value.map(line => line.text).join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sortie-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showMessage('✅ Export TXT réussi !');
}

// Export PDF (simplifié - nécessite une librairie comme jsPDF pour une vraie implémentation)
function exportPDF() {
  showMessage('⚠️ Export PDF nécessite une librairie externe (jsPDF)');
  // Pour une implémentation complète, installer jsPDF et décommenter:
  // const { jsPDF } = require('jspdf');
  // const doc = new jsPDF();
  // outputLines.value.forEach((line, i) => doc.text(line.text, 10, 10 + i * 7));
  // doc.save(`sortie-${Date.now()}.pdf`);
}

// Capture d'écran
function takeScreenshot() {
  showMessage('📷 Capture d\'écran - Utilisez l\'outil de capture de votre système (Win+Shift+S)');
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

function clearData() {
  dataText.value = '';
  showMessage('🗑 Données effacées');
}

function clearAll() {
  code.value = '';
  outputLines.value.splice(0);
  pythonCode.value = '';
  dataText.value = '';
  activeTab.value = 'output';
  localStorage.removeItem(STORAGE_KEY);
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

// Input inline handlers
function submitInlineInput() {
  const value = inputValue.value;
  showInputModal.value = false;
  inputValue.value = '';
  // Add the typed value to the data buffer for reuse
  // (the interpreter already outputs the value via addOutput)
  if (value.length > 0) {
    if (dataText.value.length > 0 && !dataText.value.endsWith('\n')) {
      dataText.value += '\n' + value;
    } else {
      dataText.value += value;
    }
  }
  if (pendingInputId.value && worker.value) {
    worker.value.postMessage({ 
      type: 'input_response', 
      id: pendingInputId.value, 
      value: value 
    });
    pendingInputId.value = null;
  }
}

function cancelInlineInput() {
  showInputModal.value = false;
  inputValue.value = '';
  const emptyValue = '';
  addOutput({ text: emptyValue + '\n' });
  if (pendingInputId.value && worker.value) {
    worker.value.postMessage({ 
      type: 'input_response', 
      id: pendingInputId.value, 
      value: emptyValue 
    });
    pendingInputId.value = null;
  }
}

// Exposer les méthodes pour App.vue
defineExpose({
  toggleSplitView,
  togglePresentationMode,
  toggleFullscreen,
  changeFontSize,
  exportOutput,
  exportPDF,
  takeScreenshot,
  getState: () => ({
    splitView: splitView.value,
    editorWidth: editorWidth.value,
    fontSize: fontSize.value,
    presentationMode: presentationMode.value,
    isFullscreen: isFullscreen.value
  })
});
</script>
