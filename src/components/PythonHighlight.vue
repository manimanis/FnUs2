<template>
  <div class="python-highlight">
    <pre ref="preElement" class="language-python"><code>{{ props.code }}</code></pre>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import Prism from 'prismjs';

// Importer le langage Python
import 'prismjs/components/prism-python';

// Importer le thème
import 'prismjs/themes/prism-tomorrow.css';


const props = defineProps({
  code: {
    type: String,
    default: ''
  }
});

const preElement = ref(null);

function highlight() {
  if (preElement.value) {
    Prism.highlightElement(preElement.value);
  }
}

watch(() => props.code, () => {
  nextTick(() => {
    highlight();
  });
});

onMounted(() => {
  Prism.highlightAll();
});


// ✅ exposer au parent
defineExpose({ preElement });
</script>

<style>
.python-highlight {
  background: #2d2d2d;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.python-highlight pre {
  margin: 0;
  padding: 0;
  background: #2d2d2d !important;
}

.python-highlight code {
  font-family: inherit;
  background: #2d2d2d !important;
  padding: 0;
}

/* Style pour les numéros de ligne */
.python-highlight .line-numbers .line-numbers-rows {
  border-right: 1px solid #3e4451;
}

.python-highlight .line-numbers-rows>span:before {
  color: #5c6370;
}
</style>