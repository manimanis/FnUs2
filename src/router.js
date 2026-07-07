import { createRouter, createWebHistory } from 'vue-router';
import EditorView from './views/EditorView.vue';
import FonctionsView from './views/FonctionsView.vue';
import AsciiView from './views/AsciiView.vue';

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
  {
    path: '/ascii',
    name: 'ascii',
    component: AsciiView,
  },
];

const router = createRouter({
  history: createWebHistory('/MesProjets/FnUs2/'),
  routes,
});

export default router;