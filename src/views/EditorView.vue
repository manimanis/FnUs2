<template>
  <div class="main-container"
    :class="{ 'split-view': splitView, 'presentation-mode': presentationMode, 'fullscreen': isFullscreen }"
    :style="splitView ? getContainerStyle() : {}">
    <div class="editor-panel">
      <div class="panel-header">
        <span>📝 Éditeur d'algorithme</span>
        <div class="header-actions">
          <span style="font-size:0.7rem;color:var(--comment);">Ctrl+Enter: Exécuter</span>
          <button class="btn-icon" @click="copyPseudoCode" title="Copier le pseudo-code">📋</button>
          <button class="btn-icon" @click="toggleSplitView" :title="splitView ? 'Vue unifiée' : 'Vue splitée'">
            {{ splitView ? '◀' : '▶' }}
          </button>
        </div>
      </div>
      <!-- Editor Tabs -->
      <div class="editor-tabs-bar">
        <div v-for="tab in tabs" :key="tab.id" class="editor-tab" :class="{ active: tab.id === activeTabId }"
          @click="switchTab(tab.id)" @dblclick="startRenameTab(tab.id)">
          <input v-if="renamingTabId === tab.id" v-model="renamingTabValue" class="editor-tab-rename-input"
            @blur="finishRenameTab" @keyup.enter="finishRenameTab" @keyup.esc="cancelRenameTab" @click.stop
            ref="renameInputRef" />
          <span v-else class="editor-tab-name">{{ tab.name }}</span>
          <button v-if="tabs.length > 1" class="editor-tab-close" @click.stop="closeTab(tab.id)"
            title="Fermer l'onglet">×</button>
        </div>
        <button class="editor-tab-add" @click="addTab" title="Nouvel onglet">+</button>
      </div>
      <div class="editor-wrapper">
        <CodeMirrorEditor v-for="tab in tabs" :key="tab.id" :ref="el => setEditorRef(tab.id, el)"
          v-show="tab.id === activeTabId" v-model="tab.code" @update:modelValue="onEditorUpdate"
          placeholder="Écrivez votre algorithme ici..." :dark="darkMode" :fontSize="fontSize" />
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
          <div v-for="(line, i) in outputLines" :key="i" :class="['output-line', line.type ? line.type + '-line' : '']">
            {{ line.text }}
          </div>
          <div v-if="showInputModal" class="input-line">
            <span class="input-prompt-text">{{ inputModalMessage }}</span>
            <input ref="inlineInputRef" v-model="inputValue" type="text" @keyup.enter="submitInlineInput"
              @keyup.esc="cancelInlineInput" class="inline-input" />
          </div>
          <div v-if="executing && outputLines.length > 0 && execTime === null" class="executing-indicator">
            <span class="executing-spinner"></span>
            <span>Exécution en cours...</span>
          </div>
          <div v-if="outputLines.length === 0 && !executing && !showInputModal"
            style="color:var(--comment);font-style:italic;">
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
          <textarea v-model="dataText" class="data-textarea" placeholder="12&#10;42&#10;Bonjour&#10;3.14"
            spellcheck="false"></textarea>
        </div>
      </div>

      <div class="output-section" v-if="activeTab === 'python'">
        <div class="panel-header">
          <span>🐍 Code Python généré</span>
          <div class="header-actions">
            <button class="btn btn-outline" @click="copyPython" style="font-size:0.7rem;padding:4px 10px;">📋
              Copier</button>
            <button class="btn-icon" @click="takeScreenshot" title="Capture d'écran">📷</button>
          </div>
        </div>
        <div class="output-content" ref="pythonContainer">
          <PythonHighlight v-if="pythonCode" ref="pythonElement" :code="pythonCode" :dark="darkMode" />
          <div v-else style="color:var(--comment);font-style:italic;">🐍 Convertir pour générer le code Python...
          </div>
        </div>
      </div>

      <div class="output-section" v-if="activeTab === 'variables'">
        <div class="panel-header">
          <span>📊 État des variables</span>
          <div class="header-actions">
            <button class="btn-icon" @click="clearVariables" title="Effacer les variables">🗑</button>
          </div>
        </div>
        <div class="output-content variables-content">
          <div v-if="Object.keys(variables).length === 0" style="color:var(--comment);font-style:italic;">
            Aucune variable à afficher. Exécutez le programme pour voir l'état des variables.
          </div>
          <table v-else class="variables-table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Valeur</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(value, name) in variables" :key="name">
                <td class="var-name">{{ name }}</td>
                <td class="var-value">{{ formatValue(value) }}</td>
                <td class="var-type">{{ getType(value) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="tabs">
        <div class="tab" :class="{ active: activeTab === 'output' }" @click="activeTab = 'output'">🖥 Sortie</div>
        <div class="tab" :class="{ active: activeTab === 'data' }" @click="activeTab = 'data'">📊 Données</div>
        <div class="tab" :class="{ active: activeTab === 'variables' }" @click="activeTab = 'variables'">🔢 Variables
        </div>
        <div class="tab" :class="{ active: activeTab === 'python' }" @click="activeTab = 'python'">🐍 Python</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted, triggerRef, computed } from 'vue';
import { Lexer } from '../../js/lexer.js';
import { Parser } from '../../js/parser.js';
import { PythonConverter } from '../../js/converter.js';
import CodeMirrorEditor from '../components/CodeMirrorEditor.vue';
import PythonHighlight from '../components/PythonHighlight.vue';
import { useStorage } from '../composables/useStorage.js';
import { useWorker } from '../composables/useWorker.js';
import { useKeyboardShortcuts, createShortcut, createKeyShortcut } from '../composables/useKeyboardShortcuts.js';
import { useAutoSave } from '../composables/useAutoSave.js';
import { useMobile } from '../composables/useMobile.js';

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['message']);

// Split mode detection (must be defined before lifecycle hooks)
function updateSplitMode() {
  isHorizontalSplit.value = window.innerWidth < 1024;
}

// Storage composables
const { value: activeTab, load: loadTab, save: saveTab } = useStorage('algo-plus-plus-active-tab', 'output', sessionStorage);
const { value: outputLines, load: loadOutput, save: saveOutput } = useStorage('algo-plus-plus-output', [], sessionStorage);
const { value: pythonCode, load: loadPython, save: savePython } = useStorage('algo-plus-plus-python', '', sessionStorage);
const { value: dataText, load: loadData, save: saveData } = useStorage('algo-plus-plus-data', '', localStorage);
const { value: fontSize, load: loadFontSize } = useStorage('algo-plus-plus-font-size', 13);
const variables = ref({});
const { value: splitView, load: loadSplitView } = useStorage('algo-plus-plus-split-view', true);
const { value: editorWidth, load: loadEditorWidth } = useStorage('algo-plus-plus-editor-width', 50);
const { value: editorHeight, load: loadEditorHeight } = useStorage('algo-plus-plus-editor-height', 50);

// Mobile detection
const { isMobile, isTablet, isDesktop } = useMobile();

// Refs
const pythonElement = ref(null);
const outputContainer = ref(null);
const pythonContainer = ref(null);
const isResizing = ref(false);
const presentationMode = ref(false);
const isFullscreen = ref(false);
const isHorizontalSplit = ref(false);
const renameInputRef = ref(null);

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
} = useWorker('js/worker.js');

const STORAGE_KEY = 'algo-plus-plus-state';
const TABS_STORAGE_KEY = 'algo-plus-plus-tabs';

// --- Editor Tabs ---
let nextTabId = 1;

const defaultCode = `Var n, s: entier

Début
  s ← 0
  n ← 1
  Tant Que n <= 10 Faire
    s ← s + n
    n ← n + 1
  Fin Tant Que
  Ecrire("La somme est:", s)
Fin`;

function createTab(name, code) {
  return {
    id: nextTabId++,
    name: name || `Algorithme ${nextTabId - 1}`,
    code: code || defaultCode
  };
}

const tabs = ref([createTab('Algorithme 1', defaultCode)]);
const activeTabId = ref(tabs.value[0].id);
const renamingTabId = ref(null);
const renamingTabValue = ref('');

// Store refs to CodeMirrorEditor instances per tab
const editorRefs = {};

function setEditorRef(tabId, el) {
  if (el) {
    editorRefs[tabId] = el;
  }
}

// Computed property to get the current tab's code
const code = computed({
  get() {
    const tab = tabs.value.find(t => t.id === activeTabId.value);
    return tab ? tab.code : '';
  },
  set(newVal) {
    const tab = tabs.value.find(t => t.id === activeTabId.value);
    if (tab) {
      tab.code = newVal;
    }
  }
});

function addTab() {
  const newTab = createTab(`Algorithme ${tabs.value.length + 1}`, '');
  tabs.value.push(newTab);
  activeTabId.value = newTab.id;
  saveTabsState();
  nextTick(() => {
    // Focus the new editor
    const editor = editorRefs[newTab.id];
    if (editor && editor.setContent) {
      editor.setContent('');
    }
  });
}

function closeTab(tabId) {
  if (tabs.value.length <= 1) return;
  const idx = tabs.value.findIndex(t => t.id === tabId);
  if (idx === -1) return;
  tabs.value.splice(idx, 1);
  if (activeTabId.value === tabId) {
    // Switch to the nearest tab
    const newIdx = Math.min(idx, tabs.value.length - 1);
    activeTabId.value = tabs.value[newIdx].id;
  }
  delete editorRefs[tabId];
  saveTabsState();
}

function switchTab(tabId) {
  if (tabId === activeTabId.value) return;
  activeTabId.value = tabId;
}

function startRenameTab(tabId) {
  const tab = tabs.value.find(t => t.id === tabId);
  if (!tab) return;
  renamingTabId.value = tabId;
  renamingTabValue.value = tab.name;
  nextTick(() => {
    if (renameInputRef.value) {
      renameInputRef.value.focus();
      renameInputRef.value.select();
    }
  });
}

function finishRenameTab() {
  if (renamingTabId.value !== null) {
    const tab = tabs.value.find(t => t.id === renamingTabId.value);
    if (tab && renamingTabValue.value.trim()) {
      tab.name = renamingTabValue.value.trim();
      saveTabsState();
    }
  }
  renamingTabId.value = null;
  renamingTabValue.value = '';
}

function cancelRenameTab() {
  renamingTabId.value = null;
  renamingTabValue.value = '';
}

function saveTabsState() {
  try {
    const state = tabs.value.map(t => ({ id: t.id, name: t.name, code: t.code }));
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify({ tabs: state, activeTabId: activeTabId.value, nextTabId }));
  } catch (e) { /* ignore */ }
}

function loadTabsState() {
  try {
    const saved = localStorage.getItem(TABS_STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      if (state.tabs && state.tabs.length > 0) {
        tabs.value = state.tabs;
        activeTabId.value = state.activeTabId || tabs.value[0].id;
        nextTabId = state.nextTabId || tabs.value.length + 1;
        // Ensure activeTabId is valid
        if (!tabs.value.find(t => t.id === activeTabId.value)) {
          activeTabId.value = tabs.value[0].id;
        }
        return true;
      }
    }
  } catch (e) { /* ignore */ }
  return false;
}

// --- End Editor Tabs ---

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

// Sauvegarde manuelle seulement (pas de watcher automatique pour ne pas interférer avec CodeMirror undo/redo)
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
      if (state.code !== undefined) {
        // Apply to current active tab
        const tab = tabs.value.find(t => t.id === activeTabId.value);
        if (tab) tab.code = state.code;
      }
      if (state.outputLines !== undefined) outputLines.value = state.outputLines;
      if (state.pythonCode !== undefined) pythonCode.value = state.pythonCode;
      if (state.activeTab !== undefined) activeTab.value = state.activeTab;
      if (state.execTime !== undefined) execTime.value = state.execTime;
    }
  } catch (e) { /* ignore */ }
}

// Load preferences BEFORE mounting editor
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
function onEditorUpdate(newValue) {
  // Mettre à jour le code seulement si ce n'est pas un undo/redo
  // (évite les boucles de synchronisation)
  const tab = tabs.value.find(t => t.id === activeTabId.value);
  if (tab && newValue !== tab.code) {
    tab.code = newValue;
  }
}

function handleEditorSetCode(e) {
  // Mettre à jour directement l'éditeur via la méthode exposée
  const tab = tabs.value.find(t => t.id === activeTabId.value);
  if (tab) {
    tab.code = e.detail.code;
    if (editorRefs[tab.id] && editorRefs[tab.id].setContent) {
      editorRefs[tab.id].setContent(e.detail.code);
    }
  }
  outputLines.value.splice(0);
  pythonCode.value = '';
}

function handleChangeFontSize(e) {
  if (e.detail && e.detail.delta) {
    changeFontSize(e.detail.delta);
  }
}

// Auto-save le code quand il change (avec debounce pour éviter trop de sauvegardes)
let saveTimeout;
watch(code, (newCode) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveState();
    saveTabsState();
  }, 500); // Sauvegarder 500ms après la dernière frappe
});

// Also save tabs state when switching tabs
watch(activeTabId, () => {
  saveTabsState();
});

// Raccourcis clavier - appel UNIQUE (dans le setup, via onMounted interne à useKeyboardShortcuts)
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

onMounted(() => {
  // Load tabs state first
  loadTabsState();

  // Load saved state AFTER editor is built, then set content
  loadState();

  nextTick(() => {
    // Set content for all tabs that have code
    tabs.value.forEach(tab => {
      const editor = editorRefs[tab.id];
      if (editor && editor.setContent && tab.code) {
        editor.setContent(tab.code);
      }
    });
  });

  initWorker();

  // Détecter le mode de split selon la taille de la fenêtre
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
    } else if (data.type === 'variables') {
      variables.value = data.vars || {};
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

  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  saveState();
  saveTabsState();

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
}

// Capture d'écran
function takeScreenshot() {
  showMessage('📷 Capture d\'écran - Utilisez l\'outil de capture de votre système (Win+Shift+S)');
}

function copyPseudoCode() {
  const codeSelector = document.querySelector('.editor-panel .codemirror-wrapper:not([style*="display: none"]) .cm-content');

  new Promise((resolve, reject) => {
    try { copy(codeSelector); resolve(); } catch (e) { reject(e); }
  })
    .then(() => showMessage('✅ Pseudo-code copié !'))
    .catch((e) => showMessage('❌ Échec de la copie ' + e));
}

function copyPython() {
  if (pythonCode.value) {
    new Promise((resolve, reject) => {
      try { copy(pythonElement.value?.preElement); resolve(); } catch (e) { reject(e); }
    })
      .then(() => showMessage('✅ Copié !'))
      .catch((e) => showMessage('❌ Copie échouée' + e));
  }
}

function clearData() {
  dataText.value = '';
  showMessage('🗑 Données effacées');
}

function clearVariables() {
  variables.value = {};
  showMessage('🗑 Variables effacées');
}

function formatValue(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `[${value.join(', ')}]`;
  if (typeof value === 'boolean') return value ? 'Vrai' : 'Faux';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'tableau';
  if (typeof value === 'boolean') return 'booléen';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'entier' : 'réel';
  }
  if (typeof value === 'string') return 'chaîne';
  return typeof value;
}

function clearAll() {
  // Clear all tabs
  tabs.value = [createTab('Algorithme 1', '')];
  activeTabId.value = tabs.value[0].id;
  nextTabId = 2;
  // Clear editor refs
  Object.keys(editorRefs).forEach(key => delete editorRefs[key]);

  outputLines.value.splice(0);
  pythonCode.value = '';
  dataText.value = '';
  activeTab.value = 'output';
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TABS_STORAGE_KEY);
  showMessage('🗑 Tout effacé');
}

function cloneWithInlineStyles(element) {
  const clone = element.cloneNode(true);

  function applyInlineStyles(source, target) {
    const computedStyle = window.getComputedStyle(source);
    const colorProperties = [
      "font-family", "font-size", "color", "font-weight", "font-style", "line-height", "margin"
    ];
    const defaultProperties = {
      "font-family": "Consolas",
      "line-height": "1.0"
    };
    colorProperties.forEach(prop => {
      let value = computedStyle.getPropertyValue(prop);
      if (defaultProperties[prop]) {
        value = defaultProperties[prop];
      }
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

function copy(htmlElement) {
  const el = cloneWithInlineStyles(htmlElement);
  // el.innerHTML = el.innerHTML.replace(/\n([ \t]+)/g, (match, indent) => {
  //   return '\n' + indent
  //     .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
  //     .replace(/ /g, '&nbsp;');
  // });

  el.innerHTML = "<p>" + el.innerHTML
    .replaceAll('  ', '&nbsp;&nbsp;')
    .replaceAll('\n', '</p><p>')
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

<style scoped>
.variables-content {
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.variables-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.variables-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
}

.variables-table th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.variables-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
  background: var(--bg-primary);
}

.variables-table tbody tr:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  transform: translateX(4px);
}

.variables-table tbody tr:last-child {
  border-bottom: none;
}

.variables-table td {
  padding: 12px 16px;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.var-name {
  font-weight: 700;
  color: #667eea;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.var-value {
  color: var(--text-primary);
  font-weight: 500;
  background: rgba(102, 126, 234, 0.05);
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  min-width: 100px;
}

.var-type {
  color: #764ba2;
  font-style: italic;
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.8;
}

/* Animation d'apparition */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.variables-table tbody tr {
  animation: fadeIn 0.3s ease-out;
}

/* Scrollbar personnalisée */
.variables-content::-webkit-scrollbar {
  width: 10px;
}

.variables-content::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 10px;
}

.variables-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.variables-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
}

/* === Editor Tabs === */
.editor-tabs-bar {
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  padding: 0 4px;
  min-height: 32px;
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 0;
}

.editor-tabs-bar::-webkit-scrollbar {
  height: 3px;
}

.editor-tabs-bar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.editor-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 0.78rem;
  color: var(--text-secondary);
  cursor: pointer;
  border-right: 1px solid var(--border);
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  white-space: nowrap;
  user-select: none;
  min-width: 0;
  flex-shrink: 0;
}

.editor-tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.editor-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: var(--bg-primary);
}

.editor-tab-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor-tab-close {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  padding: 0 2px;
  border-radius: 3px;
  transition: all 0.15s;
  opacity: 0.6;
  flex-shrink: 0;
}

.editor-tab-close:hover {
  opacity: 1;
  color: var(--error);
  background: rgba(244, 67, 54, 0.1);
}

.editor-tab-add {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s;
  flex-shrink: 0;
  margin-left: 2px;
}

.editor-tab-add:hover {
  color: var(--accent);
  background: var(--bg-tertiary);
}

.editor-tab-rename-input {
  background: var(--bg-primary);
  border: 1px solid var(--accent);
  color: var(--text-primary);
  font-size: 0.78rem;
  padding: 1px 4px;
  border-radius: 3px;
  outline: none;
  width: 120px;
  font-family: inherit;
}
</style>