<template>
  <div v-if="visible" class="modal-overlay" @click.self="cancel">
    <div class="modal-content">
      <h3>📝 Saisie requise</h3>
      <p class="modal-message">{{ message }}</p>
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        @keyup.enter="submit"
        @keyup.esc="cancel"
        placeholder="Entrez votre valeur..."
        autofocus
      />
      <div class="modal-actions">
        <button class="btn btn-primary" @click="submit">Valider</button>
        <button class="btn btn-secondary" @click="cancel">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Entrez une valeur:'
  }
});

const emit = defineEmits(['submit', 'cancel']);

const inputRef = ref(null);
const inputValue = ref('');

watch(() => props.visible, (newVal) => {
  if (newVal) {
    inputValue.value = '';
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus();
      }
    });
  }
});

function submit() {
  emit('submit', inputValue.value);
}

function cancel() {
  emit('cancel');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

.modal-content h3 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.modal-message {
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.modal-content input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.modal-content input:focus {
  border-color: var(--accent);
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
</style>