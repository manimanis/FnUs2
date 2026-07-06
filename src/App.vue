<template>
  <div id="app">
    <!-- Header visible on all pages, adapts per view -->
    <header v-if="$route.name === 'editor'">
      <h1>🔷 ALGO++</h1>
      <span class="subtitle">Interpréteur d'algorithmes pédagogique</span>
      
      <div class="header-group">
        <button class="btn btn-primary" @click="runCode" title="Exécuter (Ctrl+Enter)">▶ <span class="btn-text">Exécuter</span></button>
        <button class="btn btn-warning" @click="stopExecution" title="Arrêter">⏹ <span class="btn-text">Arrêter</span></button>
        <button class="btn btn-success" @click="convertCode" title="Convertir en Python">🐍 <span class="btn-text">Convertir</span></button>
      </div>
      
      <div class="header-group">
        <button class="btn btn-info" @click="toggleTheme" :title="darkMode ? 'Mode clair' : 'Mode sombre'">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
        <div class="dropdown">
          <button class="btn btn-info dropdown-toggle" @click="showSettingsMenu = !showSettingsMenu"
            title="Paramètres">⚙️ ▾</button>
          <div class="dropdown-menu" :class="{ 'dropdown-menu--show': showSettingsMenu }"
            @mouseleave="showSettingsMenu = false">
            <div class="dropdown-header">Affichage</div>
            <div class="dropdown-item" @click="changeFontSize(1)">
              <span class="dropdown-icon">🔍</span>
              <span>Augmenter la police</span>
            </div>
            <div class="dropdown-item" @click="changeFontSize(-1)">
              <span class="dropdown-icon">🔍</span>
              <span>Réduire la police</span>
            </div>
            <div class="dropdown-header" style="margin-top: 8px;">Modes</div>
            <div class="dropdown-item" @click="togglePresentationMode">
              <span class="dropdown-icon">📽</span>
              <span>Mode présentation (Ctrl+P)</span>
            </div>
            <div class="dropdown-item" @click="toggleFullscreen">
              <span class="dropdown-icon">⛶</span>
              <span>Plein écran (F11)</span>
            </div>
          </div>
        </div>
        <div class="dropdown">
          <button class="btn btn-info dropdown-toggle" @click="showModularMenu = !showModularMenu"
            title="Charger un exemple modulaire">📦 <span class="btn-text">Modulaire</span> ▾</button>
        <div class="dropdown-menu" :class="{ 'dropdown-menu--show': showModularMenu }"
          @mouseleave="showModularMenu = false">
            <div class="dropdown-header">Programmes modulaires</div>
            <div v-for="(example, i) in modularExamples" :key="i" class="dropdown-item" @click="selectModularExample(i)">
              <span class="dropdown-icon">{{ example.icon }}</span>
              <span>{{ example.name }}</span>
            </div>
            <div class="dropdown-header" style="margin-top: 8px;">Templates</div>
            <div class="dropdown-item" @click="showTemplatesModal = true">
              <span class="dropdown-icon">📝</span>
              <span>Gérer les templates</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="header-group header-group-left">
        <router-link to="/fonctions" class="nav-link" title="Référence des fonctions usuelles">📖 Fonctions</router-link>
        <router-link to="/ascii" class="nav-link" title="Table ASCII">🔤 ASCII</router-link>
        <button class="btn btn-danger" @click="clearAll" title="Tout effacer">🗑 <span class="btn-text">Effacer</span></button>
      </div>
    </header>

    <!-- Header for other pages (fonctions, ascii) -->
    <header v-else>
      <h1>🔷 ALGO++</h1>
      <span class="subtitle">{{ $route.name === 'fonctions' ? 'Fonctions usuelles — Référence interactive' : 'Table ASCII — Codes et caractères' }}</span>
      
      <div class="header-group header-group-left">
        <router-link to="/" class="nav-link" title="Retour à l'éditeur">← Éditeur</router-link>
        <router-link to="/ascii" class="nav-link" title="Table ASCII">🔤 ASCII</router-link>
        <button class="btn btn-info" @click="toggleTheme" :title="darkMode ? 'Mode clair' : 'Mode sombre'">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <router-view
      ref="editorViewRef"
      :darkMode="darkMode"
      @message="showMessage"
    />

    <!-- Modal Templates -->
    <TemplatesModal v-if="showTemplatesModal" @close="showTemplatesModal = false" @select="loadTemplate" />

    <div class="snackbar" :class="{ show: showSnackbar }">{{ snackbarMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useStorage } from './composables/useStorage.js';
import { modularExamples } from './data/modularExamples.js';
import TemplatesModal from './components/TemplatesModal.vue';

const router = useRouter();

const editorViewRef = ref(null);

const showSnackbar = ref(false);
const snackbarMessage = ref('');
let snackbarTimer = null;
const snackbarQueue = ref([]);

// Storage composables
const { value: darkMode, load: loadTheme } = useStorage('algo-plus-plus-theme', true);
const showModularMenu = ref(false);
const showSettingsMenu = ref(false);
const showTemplatesModal = ref(false);

function runCode() {
  const el = document.querySelector('.main-container');
  if (el) {
    const event = new CustomEvent('editor-run');
    window.dispatchEvent(event);
  }
}

function stopExecution() {
  window.dispatchEvent(new CustomEvent('editor-stop'));
}

function convertCode() {
  window.dispatchEvent(new CustomEvent('editor-convert'));
}

function clearAll() {
  window.dispatchEvent(new CustomEvent('editor-clear'));
}

function showMessage(msg) {
  snackbarQueue.value.push(msg);
  if (!showSnackbar.value) {
    processSnackbarQueue();
  }
}

function processSnackbarQueue() {
  if (snackbarQueue.value.length === 0) {
    showSnackbar.value = false;
    return;
  }
  snackbarMessage.value = snackbarQueue.value.shift();
  showSnackbar.value = true;
  if (snackbarTimer) clearTimeout(snackbarTimer);
  snackbarTimer = setTimeout(() => {
    showSnackbar.value = false;
    setTimeout(processSnackbarQueue, 200);
  }, 2500);
}

const modularExampleIndex = ref(0);

function selectModularExample(index) {
  modularExampleIndex.value = index;
  const example = modularExamples[index];
  window.dispatchEvent(new CustomEvent('editor-set-code', { detail: { code: example.code } }));
  showModularMenu.value = false;
  showMessage(`📦 ${example.name} chargé !`);
}

function toggleTheme() {
  darkMode.value = !darkMode.value;
  document.documentElement.classList.toggle('light-mode', !darkMode.value);
}

function handleClickOutside(e) {
  if (showModularMenu.value && !e.target.closest('.dropdown')) {
    showModularMenu.value = false;
  }
  if (showSettingsMenu.value && !e.target.closest('.dropdown')) {
    showSettingsMenu.value = false;
  }
}

function changeFontSize(delta) {
  window.dispatchEvent(new CustomEvent('editor-change-font-size', { detail: { delta } }));
  showSettingsMenu.value = false;
}

function togglePresentationMode() {
  window.dispatchEvent(new CustomEvent('editor-toggle-presentation'));
  showSettingsMenu.value = false;
}

function toggleFullscreen() {
  window.dispatchEvent(new CustomEvent('editor-toggle-fullscreen'));
  showSettingsMenu.value = false;
}

function loadTemplate(template) {
  if (editorViewRef.value) {
    const event = new CustomEvent('editor-set-code', { detail: { code: template.code } });
    window.dispatchEvent(event);
    showMessage(`📝 Template "${template.name}" chargé !`);
  }
}

onMounted(() => {
  // Apply theme class based on darkMode value
  document.documentElement.classList.toggle('light-mode', !darkMode.value);
  
  document.addEventListener('click', handleClickOutside);
  
  // Raccourci clavier global: Ctrl+Shift+Backspace pour tout effacer
  document.addEventListener('keydown', handleGlobalShortcuts);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleGlobalShortcuts);
});

function handleGlobalShortcuts(e) {
  // Ctrl+Shift+Backspace: tout effacer
  if (e.ctrlKey && e.shiftKey && e.key === 'Backspace') {
    e.preventDefault();
    clearAll();
  }
}
</script>

<style>
/* Nav link style for router-link */
.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  transition: all 0.2s;
  white-space: nowrap;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.nav-link:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(124, 77, 255, 0.1);
}
.router-link-active.nav-link {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(124, 77, 255, 0.15);
}
</style>