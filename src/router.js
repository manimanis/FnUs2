import { createRouter, createWebHistory } from 'vue-router';
import EditorView from './views/EditorView.vue';
import FonctionsView from './views/FonctionsView.vue';

const routes = [
  {
    path: '/',
    name: 'editor',
    component: EditorView,
  },
  {
    path: '/fonctions',
    name: 'fonctions',
    component: FonctionsView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;