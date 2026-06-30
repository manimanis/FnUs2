<template>
  <div class="python-highlight" :class="{ 'python-highlight--light': !dark }">
    <pre ref="preElement" class="language-python"><code>{{ props.code }}</code></pre>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import Prism from 'prismjs';

// Importer le langage Python
import 'prismjs/components/prism-python';

const props = defineProps({
  code: {
    type: String,
    default: ''
  },
  dark: {
    type: Boolean,
    default: true
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

watch(() => props.dark, () => {
  nextTick(() => {
    if (preElement.value) {
      preElement.value.removeAttribute('data-token');
      const codeEl = preElement.value.querySelector('code');
      if (codeEl) {
        codeEl.innerHTML = Prism.util.encode(props.code);
      }
      highlight();
    }
  });
});

onMounted(() => {
  Prism.highlightAll();
});

defineExpose({ preElement });
</script>

<style>
.python-highlight {
  background: #2d2d2d;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  /* font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace; */
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

/* === DARK MODE TOKEN COLORS (default) === */
.python-highlight .token.comment,
.python-highlight .token.prolog,
.python-highlight .token.doctype,
.python-highlight .token.cdata { color: #6d6d8a; }

.python-highlight .token.punctuation { color: #e0e0e0; }

.python-highlight .token.property,
.python-highlight .token.tag,
.python-highlight .token.boolean,
.python-highlight .token.number,
.python-highlight .token.constant,
.python-highlight .token.symbol,
.python-highlight .token.deleted { color: #f78c6c; }

.python-highlight .token.selector,
.python-highlight .token.attr-name,
.python-highlight .token.string,
.python-highlight .token.char,
.python-highlight .token.builtin,
.python-highlight .token.inserted { color: #c3e88d; }

.python-highlight .token.operator,
.python-highlight .token.entity,
.python-highlight .token.url,
.python-highlight .language-css .token.string,
.python-highlight .style .token.string { color: #89ddff; }

.python-highlight .token.atrule,
.python-highlight .token.attr-value,
.python-highlight .token.keyword { color: #bb86fc; }

.python-highlight .token.function,
.python-highlight .token.class-name { color: #82aaff; }

.python-highlight .token.regex,
.python-highlight .token.important,
.python-highlight .token.variable { color: #f07178; }

/* === LIGHT MODE === */
.python-highlight--light {
  background: #f5f5f8;
}

.python-highlight--light pre {
  background: #f5f5f8 !important;
}

.python-highlight--light code {
  background: #f5f5f8 !important;
}

.python-highlight--light .token.comment,
.python-highlight--light .token.prolog,
.python-highlight--light .token.doctype,
.python-highlight--light .token.cdata { color: #9e9e9e; }

.python-highlight--light .token.punctuation { color: #2d2d3a; }

.python-highlight--light .token.property,
.python-highlight--light .token.tag,
.python-highlight--light .token.boolean,
.python-highlight--light .token.number,
.python-highlight--light .token.constant,
.python-highlight--light .token.symbol,
.python-highlight--light .token.deleted { color: #e65100; }

.python-highlight--light .token.selector,
.python-highlight--light .token.attr-name,
.python-highlight--light .token.string,
.python-highlight--light .token.char,
.python-highlight--light .token.builtin,
.python-highlight--light .token.inserted { color: #2e7d32; }

.python-highlight--light .token.operator,
.python-highlight--light .token.entity,
.python-highlight--light .token.url,
.python-highlight--light .language-css .token.string,
.python-highlight--light .style .token.string { color: #00695c; }

.python-highlight--light .token.atrule,
.python-highlight--light .token.attr-value,
.python-highlight--light .token.keyword { color: #7b1fa2; }

.python-highlight--light .token.function,
.python-highlight--light .token.class-name { color: #1565c0; }

.python-highlight--light .token.regex,
.python-highlight--light .token.important,
.python-highlight--light .token.variable { color: #c62828; }
</style>