# 🔷 ALGO++

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Vue](https://img.shields.io/badge/Vue-3.5-green)
![License](https://img.shields.io/badge/license-Educational-lightgrey)

**Interpréteur et Convertisseur d'algorithmes pédagogiques**

[Demo](https://manimanis.github.io/FnUs2) • [Report Bug](https://github.com/manimanis/FnUs2/issues) • [Request Feature](https://github.com/manimanis/FnUs2/issues)

---

## 📋 Table des matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🧠 Langage algorithmique](#-langage-algorithmique)
- [🚀 Utilisation](#-utilisation)
- [💡 Cas d'usage](#-cas-dusage)
- [🛠️ Développement](#️-développement)
- [🏗️ Structure du projet](#️-structure-du-projet)
- [🧪 Tests](#-tests)
- [🧰 Stack technique](#-stack-technique)
- [📖 Pages du projet](#-pages-du-projet)
- [🤝 Contribuer](#-contribuer)
- [⚠️ Limitations connues](#️-limitations-connues)
- [🗺️ Feuille de route](#️-feuille-de-route)
- [📄 Licence](#-licence)

---

## ✨ Fonctionnalités

### 🎯 Fonctionnalités principales

- **🔤 Insensibilité à la casse** : Les noms de variables, procédures et fonctions ne font aucune distinction entre majuscules et minuscules (`x` = `X`)
- **📝 Éditeur de code** avec coloration syntaxique (CodeMirror 6)
- **▶️ Exécution d'algorithmes** via un interpréteur intégré (Web Worker)
- **🐍 Conversion en Python** d'un algorithme vers du code Python fonctionnel
- **📦 12 exemples modulaires** : Fibonacci, PGCD/PPCM, tri par sélection, tri à bulles, recherche dichotomique, statistiques, nombres premiers, manipulation de chaînes, exponentiation rapide, suite arithmétique, jeu de devinette, calculatrice

### 💾 Gestion de l'historique et sauvegarde

- **💾 Sauvegarde automatique** avec historique complet (undo/redo)
- **↩️ Annuler/Rétablir** (Ctrl+Z / Ctrl+Y) jusqu'à 50 modifications
- **📜 Historique persistant** dans localStorage
- **🔄 Navigation dans l'historique** avec boutons dédiés

### 📚 Documentation interactive

- **💡 Tooltips contextuels** pour tous les mots-clés ALGO++
- **⚡ Aide intégrée** sur les fonctions (Ent, Racine, aléa, long, etc.)
- **🔍 Exemples d'utilisation** dans les tooltips
- **📖 Documentation à la volée** pendant l'écriture du code

### 📝 Templates personnalisés

- **📋 8 templates par défaut** : Structure de base, Fonction, Procédure, Boucles, Conditions, Tableaux, Entrée/Sortie
- **➕ Création de templates personnalisés** avec nom, icône et description
- **📝 Éditeur de templates** intégré
- **🗂 Gestion complète** : créer, modifier, dupliquer, supprimer
- **💾 Sauvegarde** des templates personnalisés dans localStorage

### 📱 Interface responsive

- **📱 Mobile-first design** adapté à tous les écrans
- **📲 Breakpoints optimisés** : Mobile (<640px), Tablette (641-1024px), Desktop (>1024px)
- **👆 Touch-friendly** : zones tactiles agrandies (44px minimum)
- **🔄 Orientation adaptative** : portrait et landscape
- **♿ Accessibilité** : focus visible, reduced motion, skip links

### 🎨 Interface et expérience utilisateur

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

| Type        | Description          |
|-------------|----------------------|
| `entier`    | Nombre entier        |
| `reel`      | Nombre à virgule     |
| `chaine`    | Chaîne de caractères |
| `caractere` | Caractère unique     |
| `booleen`   | Booléen (`Vrai`/`Faux`) |
| `tableau`   | Tableau typé         |

### Insensibilité à la casse

Le langage ALGO++ ne fait **aucune distinction entre majuscules et minuscules** pour les identifiants (noms de variables, de procédures et de fonctions). Cela signifie que :

- `x` et `X` réfèrent à la **même variable**
- `Ecrire(x)`, `ECRIRE(X)` et `ecrire(X)` sont équivalents
- Les paramètres de fonctions/procédures sont également insensibles à la casse
- Les boucles `Pour` gèrent correctement les variables de boucle quel que soit leur casse

**Exemple :**
```
Var x : entier
Début
    X <- 10        ← fonctionne (même variable que x)
    Ecrire(x)      ← affiche 10
Fin
```

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
- **Logiques** : `Et`, `Ou`, `Non`

> **Évaluation court-circuitée** : Les opérateurs logiques `Et` et `Ou` utilisent l'évaluation court-circuitée :
> - `A Et B` : Si `A` vaut `Faux`, `B` n'est pas évaluée
> - `A Ou B` : Si `A` vaut `Vrai`, `B` n'est pas évaluée
> - Cela permet d'écrire des conditions comme `i ≥ 0 Et tableau[i] > 0` sans risque d'erreur

- **Fonctions intégrées** : `Ent()`, `Racine()`, `aléa()`, `long()`, `sous_chaine()`, `pos()`, `valeur()`, `convch()`, `majus()`, `chr()`, `ord()`, `abs()`, `sin()`, `cos()`, `tan()`, `arrondi()`

---

## 🚀 Utilisation

### Démarrage rapide

1. **Écrivez** votre algorithme dans l'éditeur (ou chargez un exemple depuis le menu **📦 Modulaire**)
2. **Utilisez les tooltips** : survolez les mots-clés ALGO++ dans l'éditeur pour voir l'aide contextuelle (ex: `Var`, `Si`, `Tant Que`, `Ent()`, `Racine()`, etc.)
3. **Consultez la référence** : visitez la page **📖 Fonctions** pour des exemples interactifs de toutes les fonctions
4. **Exécutez** avec le bouton **▶ Exécuter** ou le raccourci `Ctrl+Enter`
5. Consultez les résultats dans le panneau de **🖥 Sortie**
6. Basculez vers l'onglet **🐍 Python** pour voir et copier le code Python généré
7. **Gérez votre historique** avec les boutons **↩️ Annuler** et **↪️ Rétablir** (Ctrl+Z / Ctrl+Y)
8. **Créez des templates** depuis le menu **📝 Templates** pour réutiliser vos structures favorites

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

### Raccourcis clavier

| Raccourci           | Action                        |
|---------------------|-------------------------------|
| `Ctrl + Enter`      | Exécuter l'algorithme         |
| `Ctrl + P`          | Mode présentation             |
| `F11`               | Plein écran                   |
| `Ctrl + Plus`       | Augmenter la taille de police |
| `Ctrl + Moins`      | Diminuer la taille de police  |
| `Ctrl + Z`          | Annuler (undo)                |
| `Ctrl + Y`          | Rétablir (redo)               |
| `Ctrl + S`          | Sauvegarder l'état            |
| `Ctrl + Shift + Backspace` | Tout effacer          |

---

## 💡 Cas d'usage

ALGO++ est particulièrement adapté pour :

- **📚 Enseignement de l'algorithmique** : Apprentissage des concepts fondamentaux (boucles, conditions, fonctions) sans se soucier de la syntaxe d'un langage spécifique
- **🎓 Cours d'informatique** : Démonstrations en classe avec le mode présentation
- **✍️ Rédaction d'algorithmes** : Écriture et test rapide d'algorithmes avant implémentation
- **🔄 Conversion vers Python** : Génération automatique de code Python à partir de pseudo-code
- **🧪 Tests et validation** : Vérification rapide de la logique algorithmique
- **📖 Auto-formation** : Apprentissage autonome avec les 12 exemples modulaires

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

| Commande              | Description                              |
|-----------------------|------------------------------------------|
| `npm run dev`         | Lance le serveur de développement        |
| `npm run build`       | Construit l'application pour la production |
| `npm run preview`     | Prévisualise le build de production      |
| `npm test`            | Exécute les tests (vitest)               |
| `npm run test:watch`  | Exécute les tests en mode watch          |

### Build de production

```bash
# Construire l'application
npm run build

# Les fichiers seront générés dans le dossier dist/
# Prévisualiser le build
npm run preview
```

---

## 🏗️ Structure du projet

```
FnUs2/
├── index.html                      # Point d'entrée HTML
├── package.json                    # Configuration npm et dépendances
├── vite.config.js                  # Configuration Vite
├── .gitignore                      # Fichiers ignorés par Git
├── css/
│   └── style.css                   # Styles de l'application
├── js/
│   ├── lexer.js                    # Analyseur lexical (tokenisation)
│   ├── parser.js                   # Analyseur syntaxique (AST)
│   ├── interpreter.js              # Interpréteur de l'AST
│   ├── converter.js                # Convertisseur AST → Python
│   └── worker.js                   # Web Worker pour l'exécution
├── src/
│   ├── main.js                     # Point d'entrée Vue 3
│   ├── App.vue                     # Composant principal (header, router)
│   ├── router.js                   # Configuration du routeur Vue
│   ├── codemirror/
│   │   └── snippets.js             # Snippets CodeMirror pour auto-complétion
│   ├── components/
│   │   ├── CodeMirrorEditor.vue    # Éditeur de code CodeMirror 6
│   │   ├── PythonHighlight.vue     # Mise en évidence syntaxique Python
│   │   └── InputModal.vue          # Modal de saisie pour Lire()
│   ├── composables/
│   │   ├── useStorage.js           # Gestion localStorage/sessionStorage réactive
│   │   ├── useWorker.js            # Gestion des Web Workers
│   │   └── useKeyboardShortcuts.js # Raccourcis clavier déclaratifs
│   ├── data/
│   │   └── modularExamples.js      # 12 exemples d'algorithmes modulaires
│   └── views/
│       └── EditorView.vue          # Vue principale (éditeur, sortie, Python)
├── fonctions-usuelles/
│   └── index.html                  # Référence interactive des fonctions usuelles
└── test/
    ├── arrays.test.js              # Tests tableaux
    ├── basics.test.js              # Tests de base
    ├── control-flow.test.js        # Tests structures de contrôle
    ├── converter.test.js           # Tests conversion Python
    ├── expressions.test.js         # Tests expressions
    ├── helpers.js                  # Utilitaires de test
    ├── input.test.js               # Tests entrée/sortie
    ├── integration.test.js         # Tests d'intégration
    ├── integration2.test.js
    ├── output.test.js              # Tests sortie
    ├── procedures.test.js          # Tests procédures/fonctions
    └── robustness.test.js          # Tests robustesse
```

### Architecture

Le projet suit une architecture modulaire en 4 couches :

1. **Lexer** (`js/lexer.js`) : Tokenisation du code source
2. **Parser** (`js/parser.js`) : Construction de l'AST (Arbre Syntaxique Abstrait)
3. **Interpreter** (`js/interpreter.js`) : Exécution de l'AST
4. **Converter** (`js/converter.js`) : Génération de code Python

L'interface utilisateur est développée avec **Vue 3** en Composition API, avec une séparation claire entre la logique métier (composables) et les composants d'interface.

---

## 🧪 Tests

Les tests utilisent [Vitest](https://vitest.dev/) et couvrent :

- ✅ L'analyse lexicale (lexer)
- ✅ L'analyse syntaxique (parser)
- ✅ L'interprétation d'algorithmes complets
- ✅ La conversion vers Python
- ✅ Les cas limites (entrées utilisateur, erreurs, etc.)

### Exécuter les tests

```bash
# Exécuter tous les tests
npm test

# Mode watch pour le développement
npm run test:watch
```

### Couverture des tests

- **Tests unitaires** : Lexer, parser, interpreter, converter
- **Tests d'intégration** : Algorithmes complets avec entrées/sorties
- **Tests de robustesse** : Gestion des erreurs et cas limites

---

## 🧰 Stack technique

| Technologie               | Rôle                              | Version  |
|---------------------------|-----------------------------------|----------|
| [Vue 3](https://vuejs.org/) (Composition API) | Framework frontend | 3.5+ |
| [Vue Router](https://router.vuejs.org/) | Routage entre pages | 4.6+ |
| [Vite](https://vitejs.dev/) | Bundler et serveur de développement | 8.1+ |
| [CodeMirror 6](https://codemirror.net/) | Éditeur de code | 6.0+ |
| [Prism.js](https://prismjs.com/) | Coloration syntaxique Python | 1.30+ |
| [Vitest](https://vitest.dev/) | Framework de test | 4.1+ |
| Web Workers | Exécution isolée des algorithmes | Natif |

---

## 📖 Pages du projet

| Page | Description |
|------|-------------|
| [`/`](index.html) | Interpréteur et convertisseur ALGO++ (application principale) |
| [`/fonctions`](fonctions-usuelles/index.html) | Référence interactive des fonctions usuelles (caractères, nombres, chaînes) |

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment participer :

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans [les issues](https://github.com/manimanis/FnUs2/issues)
2. Créez une nouvelle issue avec :
   - Un titre descriptif
   - Une description du problème
   - Les étapes pour reproduire
   - Le comportement attendu vs observé

### Proposer une amélioration

1. Ouvrez une issue pour discuter de votre idée
2. Attendez les retours de l'équipe
3. Soumettez une Pull Request avec vos modifications

### Développer

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Committez vos changements (`git commit -m 'Ajout de X'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

### Style de code

- Utilisez l'ESLint/Prettier configuré dans le projet
- Écrivez des tests pour les nouvelles fonctionnalités
- Documentez votre code avec des commentaires clairs
- Respectez la structure modulaire existante

---

## ⚠️ Limitations connues

- **Insensibilité à la casse** : Les noms de variables sont insensibles à la casse (conformément à la spécification du langage)
- **Portée des variables** : La portée des variables dans les fonctions/procédures pourrait être améliorée
- **Gestion des erreurs** : Les messages d'erreur pourraient être plus détaillés avec la position exacte dans le code
- **Tableaux multidimensionnels** : Support limité aux tableaux à une dimension
- **Types avancés** : Pas de support pour les types composés (structures, enregistrements)
- **Récursion** : La récursion est supportée mais pourrait manquer d'optimisations (tail-call)
- **Bibliothèque standard** : Limitée aux fonctions intégrées de base

---

## 🗺️ Feuille de route

### Version 1.1 (à venir)
- [ ] Amélioration des messages d'erreur avec position précise
- [ ] Support des tableaux multidimensionnels
- [ ] Nouvelles fonctions intégrées (tri, recherche avancée)
- [ ] Export en PDF des algorithmes

### Version 1.2 (future)
- [ ] Support de structures de données personnalisées
- [ ] Mode collaboratif en temps réel
- [ ] Sauvegarde et partage d'algorithmes
- [ ] Thèmes personnalisables

### Version 2.0 (long terme)
- [ ] Support d'autres langages cibles (JavaScript, C, Java)
- [ ] Débogueur visuel pas-à-pas
- [ ] Visualisation graphique des algorithmes
- [ ] API REST pour intégration dans d'autres plateformes

---

## 📄 Licence

Ce projet est à titre éducatif, développé dans le cadre de l'enseignement de l'algorithmique.

**Développé avec ❤️ pour l'éducation**

---

## 🙏 Remerciements

- Inspiré par les pseudo-codes utilisés dans l'enseignement de l'algorithmique en Tunisie
- Construit avec des outils open-source exceptionnels : Vue.js, Vite, CodeMirror, Vitest
- Merci à tous les contributeurs qui améliorent ce projet

---

## 📞 Contact

Pour toute question ou suggestion :

- **GitHub Issues** : [manimanis/FnUs2/issues](https://github.com/manimanis/FnUs2/issues)
- **Repository** : [github.com/manimanis/FnUs2](https://github.com/manimanis/FnUs2)

---

**⭐ Si ce projet vous est utile, n'hésitez pas à lui donner une étoile sur GitHub !**