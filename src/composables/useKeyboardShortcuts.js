import { onMounted, onUnmounted } from 'vue';

export function useKeyboardShortcuts(handlers) {
  const handleKeydown = (e) => {
    for (const handler of handlers) {
      if (handler.shouldHandle(e)) {
        e.preventDefault();
        handler.execute();
        return;
      }
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  return {
    handleKeydown
  };
}

export function createShortcut(ctrlKey, key, action) {
  return {
    shouldHandle: (e) => {
      return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === key.toLowerCase();
    },
    execute: action
  };
}

export function createKeyShortcut(key, action) {
  return {
    shouldHandle: (e) => e.key === key,
    execute: action
  };
}