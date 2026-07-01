<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>📝 Templates d'algorithmes</h2>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="templates-grid">
          <div v-for="template in templates" :key="template.id" class="template-card"
            @click="selectTemplate(template)">
            <div class="template-icon">{{ template.icon }}</div>
            <div class="template-info">
              <div class="template-name">{{ template.name }}</div>
              <div class="template-description">{{ template.description }}</div>
            </div>
            <div class="template-actions" @click.stop>
              <button class="btn-icon-small" @click="duplicateTemplate(template.id)" title="Dupliquer">📋</button>
              <button v-if="!isDefault(template.id)" class="btn-icon-small btn-danger" @click="deleteTemplate(template.id)" title="Supprimer">🗑</button>
            </div>
          </div>
        </div>

        <div class="add-template-section">
          <button class="btn-add-template" @click="showAddForm = !showAddForm">
            ➕ Nouveau template personnalisé
          </button>

          <div v-if="showAddForm" class="add-template-form">
            <input v-model="newTemplate.name" placeholder="Nom du template" class="input-field" />
            <input v-model="newTemplate.icon" placeholder="Emoji (ex: 🎯)" class="input-field" maxlength="2" />
            <textarea v-model="newTemplate.description" placeholder="Description" class="textarea-field"></textarea>
            <textarea v-model="newTemplate.code" placeholder="Code ALGO++" class="textarea-field code-field"></textarea>
            <div class="form-actions">
              <button class="btn-primary" @click="addNewTemplate">Créer</button>
              <button class="btn-secondary" @click="showAddForm = false">Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTemplates } from '../composables/useTemplates.js';

const emit = defineEmits(['close', 'select']);

const {
  templates,
  addTemplate,
  deleteTemplate,
  duplicateTemplate
} = useTemplates();

const showAddForm = ref(false);
const newTemplate = ref({
  name: '',
  icon: '📝',
  description: '',
  code: ''
});

function isDefault(id) {
  return !id.startsWith('custom-');
}

function selectTemplate(template) {
  emit('select', template);
  emit('close');
}

function addNewTemplate() {
  if (newTemplate.value.name && newTemplate.value.code) {
    addTemplate(newTemplate.value);
    newTemplate.value = {
      name: '',
      icon: '📝',
      description: '',
      code: ''
    };
    showAddForm.value = false;
  }
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
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-card, #27273a);
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border, #3d3d5c);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border, #3d3d5c);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--text, #e0e0e0);
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-dim, #7a7a9a);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--bg-hover, #2d2d45);
  color: var(--text, #e0e0e0);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.template-card {
  background: var(--bg-code, #1a1a2e);
  border: 1px solid var(--border, #3d3d5c);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-card:hover {
  border-color: var(--accent, #7c4dff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.template-icon {
  font-size: 2rem;
}

.template-info {
  flex: 1;
}

.template-name {
  font-weight: 600;
  color: var(--text, #e0e0e0);
  margin-bottom: 4px;
}

.template-description {
  font-size: 0.85rem;
  color: var(--text-dim, #7a7a9a);
  line-height: 1.4;
}

.template-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.btn-icon-small {
  background: var(--bg-card, #27273a);
  border: 1px solid var(--border, #3d3d5c);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-icon-small:hover {
  background: var(--bg-hover, #2d2d45);
  border-color: var(--accent, #7c4dff);
}

.btn-icon-small.btn-danger:hover {
  border-color: #f44336;
  color: #f44336;
}

.add-template-section {
  border-top: 1px solid var(--border, #3d3d5c);
  padding-top: 20px;
}

.btn-add-template {
  width: 100%;
  padding: 12px;
  background: var(--accent, #7c4dff);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-add-template:hover {
  background: var(--accent-hover, #9c7cff);
}

.add-template-form {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-code, #1a1a2e);
  border: 1px solid var(--border, #3d3d5c);
  border-radius: 6px;
  color: var(--text, #e0e0e0);
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus,
.textarea-field:focus {
  border-color: var(--accent, #7c4dff);
}

.textarea-field {
  min-height: 80px;
  resize: vertical;
  font-family: 'JetBrains Mono', monospace;
}

.textarea-field.code-field {
  min-height: 200px;
  font-size: 0.85rem;
  line-height: 1.6;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--accent, #7c4dff);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover, #9c7cff);
}

.btn-secondary {
  background: var(--bg-hover, #2d2d45);
  color: var(--text, #e0e0e0);
  border: 1px solid var(--border, #3d3d5c);
}

.btn-secondary:hover {
  background: var(--border, #3d3d5c);
}

@media (max-width: 640px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-height: 95vh;
  }
}
</style>