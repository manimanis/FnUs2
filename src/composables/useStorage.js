import { ref, watch } from 'vue';

export function useStorage(key, defaultValue, storage = localStorage) {
  const value = ref(defaultValue);

  const load = () => {
    try {
      const saved = storage.getItem(key);
      if (saved !== null) {
        value.value = JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`Failed to load storage key "${key}":`, e);
    }
  };

  const save = (val) => {
    try {
      storage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(`Failed to save storage key "${key}":`, e);
    }
  };

  const remove = () => {
    try {
      storage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove storage key "${key}":`, e);
    }
  };

  watch(value, (newValue) => {
    save(newValue);
  }, { deep: true });

  return {
    value,
    load,
    save,
    remove
  };
}