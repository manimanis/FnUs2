import { ref, onMounted, onUnmounted } from 'vue';

export function useWorker(workerPath) {
  const worker = ref(null);
  const executing = ref(false);
  const execTime = ref(null);
  let startTime = 0;

  const init = () => {
    let url;
    if (workerPath instanceof URL) {
      url = workerPath;
    } else if (typeof workerPath === 'string' && (workerPath.startsWith('http://') || workerPath.startsWith('https://'))) {
      url = workerPath;
    } else {
      const cleanPath = typeof workerPath === 'string'
        ? workerPath.replace(/^(\.\.\/|\.\/|\/)+/, '')
        : workerPath;
      const baseUrl = import.meta.env.BASE_URL || '/';
      const fullBase = new URL(baseUrl, window.location.origin).href;
      url = new URL(cleanPath, fullBase);
    }

    worker.value = new Worker(url, { type: 'module' });
    return worker.value;
  };

  const terminate = () => {
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
  };

  const postMessage = (data) => {
    if (worker.value) {
      worker.value.postMessage(data);
    }
  };

  const setExecuting = (value) => {
    executing.value = value;
    if (value) {
      startTime = performance.now();
    }
  };

  const setExecTime = () => {
    execTime.value = Math.round(performance.now() - startTime);
  };

  return {
    worker,
    executing,
    execTime,
    init,
    terminate,
    postMessage,
    setExecuting,
    setExecTime
  };
}