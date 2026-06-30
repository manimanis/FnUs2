<template>
  <div id="app">
    <!-- Header visible on all pages, adapts per view -->
    <header v-if="$route.name === 'editor'">
      <h1>🔷 ALGO++</h1>
      <span class="subtitle">Interpréteur & Convertisseur d'algorithmes pédagogiques</span>
      <button class="btn btn-primary" @click="runCode" title="Exécuter (Ctrl+Enter)">▶ Exécuter</button>
      <button class="btn btn-warning" @click="stopExecution" title="Arrêter">⏹ Arrêter</button>
      <button class="btn btn-success" @click="convertCode" title="Convertir en Python">🐍 Convertir</button>
      <button class="btn btn-info" @click="toggleTheme" :title="darkMode ? 'Mode clair' : 'Mode sombre'">
        {{ darkMode ? '☀️' : '🌙' }}
      </button>
      <div class="dropdown">
        <button class="btn btn-info dropdown-toggle" @click="showModularMenu = !showModularMenu"
          title="Charger un exemple modulaire">📦 Modulaire ▾</button>
        <div class="dropdown-menu" :class="{ 'dropdown-menu--show': showModularMenu }"
          @mouseleave="showModularMenu = false">
          <div class="dropdown-header">Programmes modulaires</div>
          <div v-for="(ex, i) in modularExamples" :key="i" class="dropdown-item" @click="selectModularExample(i)">
            <span class="dropdown-icon">{{ modularIcons[i] }}</span>
            <span>{{ modularTitles[i] }}</span>
          </div>
        </div>
      </div>
      <router-link to="/fonctions" class="nav-link" title="Référence des fonctions usuelles">📖 Fonctions</router-link>
      <button class="btn btn-danger" @click="clearAll" title="Tout effacer">🗑 Effacer</button>
    </header>

    <!-- Header for the fonctions page -->
    <header v-else>
      <h1>🔷 ALGO++</h1>
      <span class="subtitle">Fonctions usuelles — Référence interactive</span>
      <router-link to="/" class="nav-link" title="Retour à l'éditeur">← Éditeur</router-link>
      <button class="btn btn-info" @click="toggleTheme" :title="darkMode ? 'Mode clair' : 'Mode sombre'">
        {{ darkMode ? '☀️' : '🌙' }}
      </button>
    </header>

    <router-view
      :darkMode="darkMode"
      @message="showMessage"
    />

    <div class="snackbar" :class="{ show: showSnackbar }">{{ snackbarMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Lexer } from '../js/lexer.js';
import { Parser } from '../js/parser.js';
import { PythonConverter } from '../js/converter.js';

const router = useRouter();

const showSnackbar = ref(false);
const snackbarMessage = ref('');
let snackbarTimer = null;

const darkMode = ref(true);
const showModularMenu = ref(false);
const THEME_STORAGE_KEY = 'algo-plus-plus-theme';

const modularTitles = [
  'Fibonacci (récursif)',
  'PGCD & PPCM (Euclide)',
  'Tri par sélection',
  'Recherche dichotomique',
  'Statistiques sur tableau',
  'Nombres premiers',
  'Manipulation de chaînes',
  'Exponentiation rapide'
];

const modularIcons = [
  '🌀', '🔢', '📊', '🔍', '📈', '🔬', '📝', '⚡'
];

const modularExamples = [
  `Fonction fib(n: entier): entier
Début
  Si n <= 1 Alors
    Retourner n
  Sinon
    Retourner fib(n-1) + fib(n-2)
  Fin Si
Fin

Var i: entier
Début
  Ecrire("Suite de Fibonacci (récursif):")
  Pour i de 0 à 10 Faire
    Ecrire("fib(", i, ") =", fib(i))
  Fin Pour
Fin`,
  `Fonction pgcd(a, b: entier): entier
Var r: entier
Début
  Tant Que b != 0 Faire
    r ← a mod b
    a ← b
    b ← r
  Fin Tant Que
  Retourner a
Fin

Fonction ppcm(a, b: entier): entier
Début
  Retourner (a * b) / pgcd(a, b)
Fin

Var x, y: entier
Début
  x ← 48; y ← 36
  Ecrire("PGCD(", x, ",", y, ") =", pgcd(x, y))
  Ecrire("PPCM(", x, ",", y, ") =", ppcm(x, y))
Fin`,
  `Type tab = tableau de 10 entier

Procédure Remplir(@t: tab, n: entier)
Var i : entier
Début
  Pour i de 0 à n-1 Faire
    t[i] ← aléa(10, 99)
  Fin Pour
Fin

Procédure Afficher(t: tab, n: entier)
Var i : entier
Début
  Pour i de 0 à n-1 Faire
    Ecrire(t[i])
  Fin Pour
Fin

Procédure Permuter(@a: entier, @b: entier)
Début
  tmp ← a ; a ← b ; b ← tmp
Fin

Procédure trierTableau(t: tab; n: entier)
Var i, j, min, temp: entier
Début
  Pour i de 0 à n-2 Faire
    min ← i
    Pour j de i+1 à n-1 Faire
      Si t[j] < t[min] Alors
        min ← j
      Fin Si
    Fin Pour
    Permuter(t[i], t[min])
  Fin Pour
Fin

Var arr: tab; i: entier
Début
  Remplir(arr, 10)
  Ecrire("Avant tri:")
  Afficher(arr, 10)
  trierTableau(arr, 10)
  Ecrire("Après tri:")
  Afficher(arr, 10)
Fin`,
  `Type tab = tableau de 10 entier

Fonction rechercher(t: tab, val: entier): entier
Var d, f, milieu: entier
Début
  d ← 0; f ← 9
  Tant Que d <= f Faire
    milieu ← (d + f) div 2
    Si t[milieu] = val Alors
      Retourner milieu
    Sinon Si t[milieu] < val Alors
      d ← milieu + 1
    Sinon
      f ← milieu - 1
    Fin Si
  Fin Tant Que
  Retourner -1
Fin

Var tab: tab; i, pos: entier
Début
  Pour i de 0 à 9 Faire
    tab[i] ← i * 3
  Fin Pour
  Ecrire("Tableau trié:")
  Pour i de 0 à 9 Faire
    Ecrire("tab[", i, "] =", tab[i])
  Fin Pour
  pos ← rechercher(tab, 15)
  Si pos >= 0 Alors
    Ecrire("Valeur 15 trouvée à l'indice", pos)
  Sinon
    Ecrire("Valeur 15 non trouvée")
  Fin Si
Fin`,
  `Type tab = tableau de 10 entier

Fonction sommeTab(t: tab): entier
Var i, s: entier
Début
  s ← 0
  Pour i de 0 à 9 Faire
    s ← s + t[i]
  Fin Pour
  Retourner s
Fin

Fonction minTab(t: tab): entier
Var i, m: entier
Début
  m ← t[0]
  Pour i de 1 à 9 Faire
    Si t[i] < m Alors
      m ← t[i]
    Fin Si
  Fin Pour
  Retourner m
Fin

Fonction maxTab(t: tab): entier
Var i, m: entier
Début
  m ← t[0]
  Pour i de 1 à 9 Faire
    Si t[i] > m Alors
      m ← t[i]
    Fin Si
  Fin Pour
  Retourner m
Fin

Var tab: tab; i: entier
Début
  Pour i de 0 à 9 Faire
    tab[i] ← (i * 7 + 3) % 20
  Fin Pour
  Ecrire("Tableau:")
  Pour i de 0 à 9 Faire
    Ecrire("tab[", i, "] =", tab[i])
  Fin Pour
  Ecrire("Somme:", sommeTab(tab))
  Ecrire("Min:", minTab(tab))
  Ecrire("Max:", maxTab(tab))
Fin`,
  `Fonction estPremier(n: entier): booleen
Var i, mx: entier
    test: booleen
Début
  Si n < 2 Alors
    test ← Faux
  Sinon Si n = 2 ou n = 3 Alors
    test ← Vrai
  Sinon Si n mod 2 = 0 ou n mod 3 = 0 Alors
    test ← Faux
  Sinon
    test ← Vrai
  Fin Si
  i ← 5
  mx ← Ent(Racine(n) + 1) 
  Tant Que test et i <= mx  Faire
    test ← n mod i != 0
    i ← i + 2
  Fin Tant Que
  Retourner test
Fin

Procédure afficherPremiers(limite: entier)
Var i: entier
Début
  Ecrire("Nombres premiers jusqu'à", limite, ":")
  Pour i de 2 à limite Faire
    Si estPremier(i) Alors
      Ecrire(i)
    Fin Si
  Fin Pour
Fin

Var nombre: entier
Début
  nombre ← 37
  Si estPremier(nombre) Alors
    Ecrire(nombre, "est premier")
  Sinon
    Ecrire(nombre, "n'est pas premier")
  Fin Si
  afficherPremiers(150)
Fin`,
  `Fonction compterVoyelles(ch: chaine): entier
Var i, cpt: entier; car: caractere
Début
  cpt ← 0
  Pour i de 0 à long(ch)-1 Faire
    car ← ch[i]
    Si car = "a" Ou car = "e" Ou car = "i"
       Ou car = "o" Ou car = "u" Ou car = "y"
       Ou car = "A" Ou car = "E" Ou car = "I"
       Ou car = "O" Ou car = "U" Ou car = "Y" Alors
      cpt ← cpt + 1
    Fin Si
  Fin Pour
  Retourner cpt
Fin

Fonction inverserChaine(ch: chaine): chaine
Var i: entier; res: chaine
Début
  res ← ""
  Pour i de long(ch)-1 à 0 Pas -1 Faire
    res ← res + ch[i]
  Fin Pour
  Retourner res
Fin

Var texte: chaine
Début
  texte ← "Algorithmique"
  Ecrire("Texte:", texte)
  Ecrire("Longueur:", long(texte))
  Ecrire("Nombre de voyelles:", compterVoyelles(texte))
  Ecrire("Inversé:", inverserChaine(texte))
Fin`,
  `Fonction puissance(base, exp: entier): entier
Début
  Si exp = 0 Alors
    Retourner 1
  Sinon Si exp % 2 = 0 Alors
    Retourner puissance(base * base, exp / 2)
  Sinon
    Retourner base * puissance(base, exp - 1)
  Fin Si
Fin

Fonction sommePuissances(n, max: entier): entier
Var i, s: entier
Début
  s ← 0
  Pour i de 0 à max Faire
    s ← s + puissance(n, i)
  Fin Pour
  Retourner s
Fin

Var resultat: entier
Début
  resultat ← puissance(2, 10)
  Ecrire("2^10 =", resultat)
  Ecrire("Somme 2^0 +2^1 + 2^2 + ... + 2^5 =", sommePuissances(2, 5))
Fin`
];

// Ref for the editor view instance to call methods
const editorRef = ref(null);

function runCode() {
  // The editor view will receive this via router-view ref
  const el = document.querySelector('.main-container');
  if (el) {
    const event = new CustomEvent('editor-run');
    window.dispatchEvent(event);
  }
}

function stopExecution() {
  window.dispatchEvent(new CustomEvent('editor-stop'));
}

function convertCode() {
  window.dispatchEvent(new CustomEvent('editor-convert'));
}

function clearAll() {
  window.dispatchEvent(new CustomEvent('editor-clear'));
}

function showMessage(msg) {
  snackbarMessage.value = msg;
  showSnackbar.value = true;
  if (snackbarTimer) clearTimeout(snackbarTimer);
  snackbarTimer = setTimeout(() => { showSnackbar.value = false; }, 2500);
}

const modularExampleIndex = ref(0);

function selectModularExample(index) {
  modularExampleIndex.value = index;
  // Write the code through the event system
  window.dispatchEvent(new CustomEvent('editor-set-code', { detail: { code: modularExamples[index] } }));
  showModularMenu.value = false;
  showMessage(`📦 ${modularTitles[index]} chargé !`);
}

function toggleTheme() {
  darkMode.value = !darkMode.value;
  document.documentElement.classList.toggle('light-mode', !darkMode.value);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, darkMode.value ? 'dark' : 'light');
  } catch (e) { /* ignore */ }
}

function handleClickOutside(e) {
  if (showModularMenu.value && !e.target.closest('.dropdown')) {
    showModularMenu.value = false;
  }
}

onMounted(() => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light') {
      darkMode.value = false;
      document.documentElement.classList.add('light-mode');
    }
  } catch (e) { /* ignore */ }

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
/* Nav link style for router-link */
.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  transition: all 0.2s;
  white-space: nowrap;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.nav-link:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(124, 77, 255, 0.1);
}
.router-link-active.nav-link {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(124, 77, 255, 0.15);
}
</style>