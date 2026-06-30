import { ref, onMounted, onUnmounted } from 'vue';

export function useWorker(workerPath) {
  const worker = ref(null);
  const executing = ref(false);
  const execTime = ref(null);
  let startTime = 0;

  const init = () => {
    worker.value = new Worker(new URL(workerPath, import.meta.url), { type: 'module' });
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