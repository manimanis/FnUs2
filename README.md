# 🔷 ALGO++

**Interpréteur et Convertisseur d'algorithmes pédagogiques**

ALGO++ est un environnement web interactif permettant d'écrire, d'exécuter et de convertir en Python des algorithmes dans un langage algorithmique simple, inspiré des pseudo-codes utilisés dans l'enseignement de l'algorithmique.

L'application fonctionne entièrement côté client (navigation), sans nécessité de serveur backend.

---

## ✨ Fonctionnalités

- **📝 Éditeur de code** avec coloration syntaxique (CodeMirror 6)
- **▶️ Exécution d'algorithmes** via un interpréteur intégré (Web Worker)
- **🐍 Conversion en Python** d'un algorithme vers du code Python fonctionnel
- **📦 12 exemples modulaires** : Fibonacci, PGCD/PPCM, tri par sélection, tri à bulles, recherche dichotomique, statistiques, nombres premiers, manipulation de chaînes, exponentiation rapide, suite arithmétique, jeu de devinette, calculatrice
- **🌙 Thème sombre/clair** (préférence sauvegardée dans localStorage)
- **📋 Copie du code Python généré** (avec mise en forme)
- **⏹ Arrêt** de l'exécution en cours
- **🗑 Effacement** rapide de l'éditeur et des sorties
- **🎚️ Vue splitée redimensionnable** entre l'éditeur et la sortie
- **🔍 Contrôle de la taille de police** (raccourcis Ctrl+Plus/Ctrl+Moins)
- **📽️ Mode présentation** (Ctrl+P)
- **⛶ Plein écran** (F11)
- **📥 Export TXT** des résultats d'exécution
- **📝 Saisie utilisateur inline** dans la fenêtre de sortie pour `Lire()`
- **📖 Référence des fonctions usuelles** (page dédiée avec catégories : caractères, nombres, chaînes)

---

## 🧠 Langage algorithmique

ALGO++ utilise un langage de type pseudo-code français, pédagogique et simple, avec les constructions suivantes :

### Types de données

| Type      | Description         |
|-----------|---------------------|
| `entier`  | Nombre entier       |
| `reel`    | Nombre à virgule    |
| `chaine`  | Chaîne de caractères|
| `caractere` | Caractère unique  |
| `booleen` | Booléen (`Vrai`/`Faux`) |
| `tableau` | Tableau typé        |

### Instructions

- **Affectation** : `variable ← expression`
- **Entrée/Sortie** : `Ecrire(...)`, `Lire(variable)`
- **Condition** : `Si condition Alors ... Sinon ... Fin Si`
- **Boucle Tant Que** : `Tant Que condition Faire ... Fin Tant Que`
- **Boucle Pour** : `Pour i de début à fin [Pas pas] Faire ... Fin Pour`
- **Boucle Répéter** : `Répéter ... Jusqu'à condition`
- **Fonctions** : `Fonction nom(params): type ... Fin`
- **Procédures** : `Procédure nom(params) ... Fin`
- **Retour** : `Retourner expression`

### Opérateurs

- **Arithmétiques** : `+`, `-`, `*`, `/`, `div`, `mod`
- **Comparaison** : `=`, `!=`, `≠`, `<`, `>`, `<=`, `≥`, `≤`, `>=`
- **Logiques** : `et`, `ou`, `non`
- **Fonctions intégrées** : `Ent()`, `Racine()`, `aléa()`, `long()`, `sous_chaine()`, `pos()`, `valeur()`, `convch()`, `majus()`, `chr()`, `ord()`, `abs()`, `sin()`, `cos()`, `tan()`, `arrondi()`

---

## 🚀 Utilisation

1. **Écrivez** votre algorithme dans l'éditeur (ou chargez un exemple depuis le menu **📦 Modulaire**)
2. **Exécutez** avec le bouton **▶ Exécuter** ou le raccourci `Ctrl+Enter`
3. Consultez les résultats dans le panneau de **🖥 Sortie**
4. Basculez vers l'onglet **🐍 Python** pour voir et copier le code Python généré

### Exemple

```
Var n, s: entier

Début
  s ← 0
  n ← 1
  Tant Que n <= 10 Faire
    s ← s + n
    n ← n + 1
  Fin Tant Que
  Ecrire("La somme est:", s)
Fin
```

---

## 🛠️ Développement

### Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- npm

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/manimanis/FnUs2.git
cd FnUs2

# Installer les dépendances
npm install
```

### Scripts disponibles

| Commande              | Description                          |
|-----------------------|--------------------------------------|
| `npm run dev`         | Lance le serveur de développement    |
| `npm run build`       | Construit l'application pour la production |
| `npm run preview`     | Prévisualise le build de production  |
| `npm test`            | Exécute les tests (vitest)           |
| `npm run test:watch`  | Exécute les tests en mode watch      |

---

## 🏗️ Structure du projet

```
FnUs2/
├── index.html              # Point d'entrée HTML
├── package.json            # Configuration npm et dépendances
├── vite.config.js          # Configuration Vite
├── css/
│   └── style.css           # Styles de l'application
├── js/
│   ├── lexer.js            # Analyseur lexical (tokenisation)
│   ├── parser.js           # Analyseur syntaxique (AST)
│   ├── interpreter.js      # Interpréteur de l'AST
│   ├── converter.js        # Convertisseur AST → Python
│   └── worker.js           # Web Worker pour l'exécution
├── src/
│   ├── main.js             # Point d'entrée Vue 3
│   ├── App.vue             # Composant principal (header, router)
│   ├── router.js           # Configuration du routeur Vue
│   ├── codemirror/
│   │   └── snippets.js     # Snippets CodeMirror pour auto-complétion
│   ├── components/
│   │   ├── CodeMirrorEditor.vue  # Éditeur de code CodeMirror 6
│   │   ├── PythonHighlight.vue   # Mise en évidence syntaxique Python
│   │   └── InputModal.vue        # Modal de saisie pour Lire()
│   ├── composables/
│   │   ├── useStorage.js         # Gestion localStorage/sessionStorage réactive
│   │   ├── useWorker.js          # Gestion des Web Workers
│   │   └── useKeyboardShortcuts.js # Raccourcis clavier déclaratifs
│   ├── data/
│   │   └── modularExamples.js    # 12 exemples d'algorithmes modulaires
│   └── views/
│       └── EditorView.vue        # Vue principale (éditeur, sortie, Python)
├── fonctions-usuelles/
│   └── index.html         # Référence interactive des fonctions usuelles
└── test/
    ├── arrays.test.js      # Tests tableaux
    ├── basics.test.js      # Tests de base
    ├── control-flow.test.js # Tests structures de contrôle
    ├── converter.test.js   # Tests conversion Python
    ├── expressions.test.js # Tests expressions
    ├── helpers.js          # Utilitaires de test
    ├── input.test.js       # Tests entrée/sortie
    ├── integration.test.js # Tests d'intégration
    ├── integration2.test.js
    ├── output.test.js      # Tests sortie
    ├── procedures.test.js  # Tests procédures/fonctions
    └── robustness.test.js  # Tests robustesse
```

---

## 🧪 Tests

Les tests utilisent [Vitest](https://vitest.dev/) et couvrent :

- L'analyse lexicale (lexer)
- L'analyse syntaxique (parser)
- L'interprétation d'algorithmes complets
- La conversion vers Python
- Les cas limites (entrées utilisateur, erreurs, etc.)

```bash
npm test
```

---

## 🧰 Stack technique

| Technologie               | Rôle                              |
|---------------------------|-----------------------------------|
| [Vue 3](https://vuejs.org/) (Composition API) | Framework frontend |
| [Vue Router](https://router.vuejs.org/) | Routage entre pages |
| [Vite](https://vitejs.dev/) | Bundler et serveur de développement |
| [CodeMirror 6](https://codemirror.net/) | Éditeur de code |
| [Prism.js](https://prismjs.com/) | Coloration syntaxique Python |
| [Vitest](https://vitest.dev/) | Framework de test |
| [Composables](https://vuejs.org/guide/reusability/composables.html) | Logique métier réutilisable |
| Web Workers                | Exécution isolée des algorithmes |

---

## 📖 Pages du projet

| Page | Description |
|------|-------------|
| [`/`](index.html) | Interpréteur et convertisseur ALGO++ (application principale) |
| [`/fonctions`](fonctions-usuelles/index.html) | Référence interactive des fonctions usuelles (caractères, nombres, chaînes) |

---

## 📄 Licence

Ce projet est à titre éducatif, développé dans le cadre de l'enseignement de l'algorithmique.