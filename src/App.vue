<template>
  <div id="app">
    <header>
      <h1>🔷 ALGO++</h1>
      <span class="subtitle">Interpréteur & Convertisseur d'algorithmes pédagogiques</span>
      <button class="btn btn-primary" @click="runCode" title="Exécuter (Ctrl+Enter)">▶ Exécuter</button>
      <button class="btn btn-warning" @click="stopExecution" title="Arrêter">⏹ Arrêter</button>
      <button class="btn btn-success" @click="convertCode" title="Convertir en Python">🐍 Convertir</button>
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
      <button class="btn btn-danger" @click="clearAll" title="Tout effacer">🗑 Effacer</button>
    </header>

    <div class="main-container">
      <div class="editor-panel">
        <div class="panel-header">
          <span>📝 Éditeur d'algorithme</span>
          <span style="font-size:0.7rem;color:var(--comment);">Ctrl+Enter: Exécuter</span>
        </div>
        <div class="editor-wrapper">
          <CodeMirrorEditor v-model="code" placeholder="Écrivez votre algorithme ici..." />
        </div>
      </div>

      <div class="output-panel">
        <div class="output-section" v-if="activeTab === 'output'">
          <div class="panel-header">
            <span>🖥 Sortie d'exécution</span>
            <span v-if="executing" style="color:var(--warning)">⏳ Exécution...</span>
            <span v-if="execTime" style="font-size:0.7rem;color:var(--comment)">{{ execTime }}ms</span>
          </div>
          <div class="output-content" ref="outputContainer">
            <div v-for="(line, i) in outputLines" :key="i"
              :class="['output-line', line.type ? line.type + '-line' : '']">
              {{ line.text }}
            </div>
            <div v-if="outputLines.length === 0 && !executing" style="color:var(--comment);font-style:italic;">
              ▶ Exécuter pour voir les résultats...
            </div>
          </div>
        </div>

        <div class="output-section" v-if="activeTab === 'python'">
          <div class="panel-header">
            <span>🐍 Code Python généré</span>
            <button class="btn btn-outline" @click="copyPython" style="font-size:0.7rem;padding:4px 10px;">📋
              Copier</button>
          </div>
          <div class="output-content">
            <PythonHighlight v-if="pythonCode" ref="pythonElement" :code="pythonCode" />
            <div v-else style="color:var(--comment);font-style:italic;">🐍 Convertir pour générer le code Python...
            </div>
          </div>
        </div>

        <div class="tabs">
          <div class="tab" :class="{ active: activeTab === 'output' }" @click="activeTab = 'output'">🖥 Sortie</div>
          <div class="tab" :class="{ active: activeTab === 'python' }" @click="activeTab = 'python'">🐍 Python</div>
        </div>
      </div>
    </div>

    <div class="snackbar" :class="{ show: showSnackbar }">{{ snackbarMessage }}</div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { Lexer } from '../js/lexer.js';
import { Parser } from '../js/parser.js';
import { PythonConverter } from '../js/converter.js';
import CodeMirrorEditor from './components/CodeMirrorEditor.vue';
import PythonHighlight from './components/PythonHighlight.vue';

const activeTab = ref('output');
const outputLines = ref([]);
const pythonCode = ref('');
const pythonElement = ref(null);
const executing = ref(false);
const execTime = ref(null);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const outputContainer = ref(null);
let snackbarTimer = null;
let worker = null;

const code = ref(`Var n, s: entier

Début
  s ← 0
  n ← 1
  Tant Que n <= 10 Faire
    s ← s + n
    n ← n + 1
  Fin Tant Que
  Ecrire("La somme est:", s)
Fin`);

const showModularMenu = ref(false);

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
  // 1. Fibonacci récursif
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
  // 2. PGCD par algorithme d'Euclide
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
  // 3. Procédure de tri par sélection
  `Type tab = tableau de 10 entier

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
    temp ← t[i]
    t[i] ← t[min]
    t[min] ← temp
  Fin Pour
Fin

Var arr: tab; i: entier
Début
  arr[0] ← 7; arr[1] ← 3; arr[2] ← 9
  arr[3] ← 1; arr[4] ← 6; arr[5] ← 4
  arr[6] ← 8; arr[7] ← 2; arr[8] ← 5
  arr[9] ← 0
  Ecrire("Avant tri:")
  Pour i de 0 à 9 Faire
    Ecrire(arr[i])
  Fin Pour
  trierTableau(arr, 10)
  Ecrire("Après tri:")
  Pour i de 0 à 9 Faire
    Ecrire(arr[i])
  Fin Pour
Fin`,
  // 4. Recherche dichotomique
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
  // 5. Statistiques sur tableau (fonctions multiples)
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
  // 6. Vérification nombre premier et décomposition
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
  // 7. Manipulation de chaînes avec fonctions
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
  // 8. Exponentiation rapide (récursive)
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

const STORAGE_KEY = 'algo-plus-plus-state';

function saveState() {
  const state = {
    code: code.value,
    outputLines: outputLines.value,
    pythonCode: pythonCode.value,
    activeTab: activeTab.value,
    execTime: execTime.value
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Stockage indisponible ou plein
  }
}

function loadState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      if (state.code !== undefined) code.value = state.code;
      if (state.outputLines !== undefined) outputLines.value = state.outputLines;
      if (state.pythonCode !== undefined) pythonCode.value = state.pythonCode;
      if (state.activeTab !== undefined) activeTab.value = state.activeTab;
      if (state.execTime !== undefined) execTime.value = state.execTime;
    }
  } catch (e) {
    // État corrompu, on ignore
  }
}

watch([code, outputLines, pythonCode, activeTab, execTime], () => {
  saveState();
});

function selectModularExample(index) {
  code.value = modularExamples[index];
  outputLines.value.splice(0);
  pythonCode.value = '';
  showModularMenu.value = false;
  showMessage(`📦 ${modularTitles[index]} chargé !`);
}

function handleClickOutside(e) {
  if (showModularMenu.value && !e.target.closest('.dropdown')) {
    showModularMenu.value = false;
  }
}

onMounted(() => {
  loadState();
  worker = new Worker(new URL('../js/worker.js', import.meta.url), { type: 'module' });

  worker.onmessage = (e) => {
    const data = e.data;
    if (data.type === 'output') {
      if (typeof data.text === 'object' && data.text.type === 'error') {
        outputLines.value.push({ text: data.text.text, type: 'error' });
      } else {
        outputLines.value.push({ text: String(data.text) });
      }
      scrollOutput();
    } else if (data.type === 'input_request') {
      const val = window.prompt(data.prompt);
      outputLines.value.push({ text: val });
      scrollOutput();
      worker.postMessage({ type: 'input_response', id: data.id, value: val });
    } else if (data.type === 'done') {
      if (outputLines.value.length === 0) {
        outputLines.value.push({ text: '✅ Programme exécuté avec succès.', type: 'success' });
      } else {
        outputLines.value.push({ text: `✅ Terminé (${data.execTime}ms)`, type: 'success' });
      }
      execTime.value = data.execTime;
      executing.value = false;
      scrollOutput();
    } else if (data.type === 'stopped') {
      outputLines.value.push({ text: '⛔ Exécution arrêtée par l\'utilisateur.', type: 'warning' });
      execTime.value = Math.round(performance.now() - startTime);
      executing.value = false;
      scrollOutput();
    } else if (data.type === 'error') {
      outputLines.value.push({ text: `❌ ${data.text}`, type: 'error' });
      execTime.value = Math.round(performance.now() - startTime);
      executing.value = false;
      scrollOutput();
    }
  };

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (worker) worker.terminate();
  document.removeEventListener('click', handleClickOutside);
});

function showMessage(msg) {
  snackbarMessage.value = msg;
  showSnackbar.value = true;
  if (snackbarTimer) clearTimeout(snackbarTimer);
  snackbarTimer = setTimeout(() => { showSnackbar.value = false; }, 2500);
}

function scrollOutput() {
  nextTick(() => {
    if (outputContainer.value) {
      outputContainer.value.scrollTop = outputContainer.value.scrollHeight;
    }
  });
}

let startTime = 0;

function runCode() {
  outputLines.value.splice(0);
  pythonCode.value = '';
  activeTab.value = 'output';
  executing.value = true;
  execTime.value = null;
  startTime = performance.now();

  try {
    worker.postMessage({ type: 'run', code: code.value });
  } catch (err) {
    outputLines.value.push({ text: `❌ ${err.message}`, type: 'error' });
    execTime.value = Math.round(performance.now() - startTime);
    executing.value = false;
    scrollOutput();
  }
}

function stopExecution() {
  if (executing.value) {
    try {
      worker.postMessage({ type: 'stop', code: '' })
    } catch (err) {
      outputLines.value.push({ text: `❌ ${err.message}`, type: 'error' });
      execTime.value = Math.round(performance.now() - startTime);
      executing.value = false;
      scrollOutput();
    }
  }
}

function convertCode() {
  pythonCode.value = '';
  activeTab.value = 'python';
  try {
    const lexer = new Lexer(code.value);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const converter = new PythonConverter();
    pythonCode.value = converter.convert(ast);
    showMessage('✅ Conversion Python réussie !');
  } catch (err) {
    pythonCode.value = `# ERREUR: ${err.message}`;
    showMessage('❌ Erreur de conversion');
  }
}

function copyPython() {
  if (pythonCode.value) {
    new Promise(
      (resolve, reject) => {
        try {
          copy();
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    )
      .then(() => {
        showMessage('✅ Copié !');
      })
      .catch((e) => showMessage('❌ Copie échouée' + e));
  }
}

function clearAll() {
  code.value = '';
  outputLines.value.splice(0);
  pythonCode.value = '';
  activeTab.value = 'output';
  sessionStorage.removeItem(STORAGE_KEY);
  showMessage('🗑 Tout effacé');
}

function cloneWithInlineStyles(element) {
  // Cloner le noeud
  const clone = element.cloneNode(true);

  // Fonction pour copier les styles calculés
  function applyInlineStyles(source, target) {
    const computedStyle = window.getComputedStyle(source);

    // Liste des propriétés liées aux couleurs
    const colorProperties = [
      "color",
      "background-color",
      "border-color",
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
      "outline-color",
      "text-decoration-color",
      "box-shadow"
    ];

    // Appliquer uniquement les styles de couleur
    colorProperties.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== "rgba(0, 0, 0, 0)") {
        target.style.setProperty(prop, value);
      }
    });

    // Supprimer toutes les classes
    target.removeAttribute("class");
  }

  // Parcourir tous les éléments (original + clone)
  const sourceElements = [element, ...element.querySelectorAll("*")];
  const targetElements = [clone, ...clone.querySelectorAll("*")];

  sourceElements.forEach((srcEl, index) => {
    const targetEl = targetElements[index];
    applyInlineStyles(srcEl, targetEl);
  });

  return clone;
}

function copy() {
  const el = cloneWithInlineStyles(pythonElement.value?.preElement);

  el.innerHTML = "<p>" + el.innerHTML
    .replaceAll('\n', '</p><p>')
    .replaceAll('    ', '&nbsp;&nbsp;&nbsp;&nbsp;')
    + "</p>";
  navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([el.innerHTML], { type: "text/html" }),
      "text/plain": new Blob([el.innerText], { type: "text/plain" })
    })
  ]);
}
</script>