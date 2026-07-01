import { ref, watch, onMounted } from 'vue';
import { useStorage } from './useStorage.js';

const MAX_HISTORY = 50;
const AUTO_SAVE_DELAY = 2000; // 2 secondes

export function useAutoSave(key, defaultValue) {
  const { value: currentValue, save: saveCurrent } = useStorage(key, defaultValue, localStorage);
  const history = ref([]);
  const historyIndex = ref(-1);
  const lastSaveTime = ref(null);
  let saveTimeout = null;

  // Charger l'historique depuis localStorage
  onMounted(() => {
    try {
      const savedHistory = localStorage.getItem(`${key}-history`);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        history.value = parsed.items || [];
        historyIndex.value = parsed.index || -1;
      }
    } catch (e) {
      // Ignore
    }
  });

  // Sauvegarder l'historique
  function saveHistory() {
    try {
      localStorage.setItem(`${key}-history`, JSON.stringify({
        items: history.value,
        index: historyIndex.value
      }));
    } catch (e) {
      // Ignore
    }
  }

  // Ajouter à l'historique
  function addToHistory(value) {
    // Supprimer les entrées futures si on a navigué dans l'historique
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }

    // Ajouter la nouvelle entrée
    history.value.push({
      value: JSON.stringify(value),
      timestamp: Date.now()
    });

    // Limiter la taille de l'historique
    if (history.value.length > MAX_HISTORY) {
      history.value.shift();
    } else {
      historyIndex.value++;
    }

    saveHistory();
  }

  // Annuler (undo)
  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const entry = history.value[historyIndex.value];
      currentValue.value = JSON.parse(entry.value);
      saveCurrent();
      return true;
    }
    return false;
  }

  // Rétablir (redo)
  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      const entry = history.value[historyIndex.value];
      currentValue.value = JSON.parse(entry.value);
      saveCurrent();
      return true;
    }
    return false;
  }

  // Sauvegarde automatique avec debounce
  function autoSave(newValue) {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      saveCurrent();
      addToHistory(newValue);
      lastSaveTime.value = Date.now();
    }, AUTO_SAVE_DELAY);
  }

  // Watcher pour la sauvegarde automatique
  watch(currentValue, (newValue) => {
    autoSave(newValue);
  }, { deep: true });

  // Nettoyage
  function clearHistory() {
    history.value = [];
    historyIndex.value = -1;
    saveHistory();
  }

  return {
    currentValue,
    saveCurrent,
    undo,
    redo,
    autoSave,
    clearHistory,
    canUndo: () => historyIndex.value > 0,
    canRedo: () => historyIndex.value < history.value.length - 1,
    historyLength: () => history.value.length,
    lastSaveTime
  };
}