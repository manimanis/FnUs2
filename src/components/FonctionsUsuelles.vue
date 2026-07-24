<template>
  <div class="layout" ref="layoutRef">
    <!-- SIDEBAR -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <div>
          <div class="sidebar-logo">Algorithmique</div>
          <div class="sidebar-title">Fonctions usuelles</div>
        </div>
      </div>
      <div class="search-bar">
        <input class="search-input" type="text" placeholder="Rechercher…" v-model="search">
      </div>
      <div class="sidebar-nav">
        <div class="nav-group" v-if="filteredGroups.chars.length">
          <div class="nav-group-label">Caractères</div>
          <div v-for="fn in filteredGroups.chars" :key="fn.id" class="nav-item cat-chars"
            :class="{ active: current === fn.id }" @click="go(fn.id)">
            <span class="nav-dot"></span>{{ fn.id }}
          </div>
        </div>
        <div class="nav-group" v-if="filteredGroups.nums.length">
          <div class="nav-group-label">Nombres</div>
          <div v-for="fn in filteredGroups.nums" :key="fn.id" class="nav-item cat-nums"
            :class="{ active: current === fn.id }" @click="go(fn.id)">
            <span class="nav-dot"></span>{{ fn.id }}
          </div>
        </div>
        <div class="nav-group" v-if="filteredGroups.strings.length">
          <div class="nav-group-label">Chaînes</div>
          <div v-for="fn in filteredGroups.strings" :key="fn.id" class="nav-item cat-strings"
            :class="{ active: current === fn.id }" @click="go(fn.id)">
            <span class="nav-dot"></span>{{ fn.id }}
          </div>
        </div>
      </div>
    </nav>

    <!-- MAIN CONTENT -->
    <main class="main">
      <div class="main-inner">

        <!-- HOME -->
        <div v-if="!current" class="home">
          <div class="home-hero">
            <div class="home-eyebrow">Référence interactive</div>
            <h1 class="home-heading">Fonctions<br><span>algorithmiques</span></h1>
            <p class="home-sub">Explorez et testez les fonctions usuelles en temps réel — caractères,
              nombres, chaînes.</p>
          </div>
          <div class="cards-grid">
            <div class="category-card" @click="go('chr')">
              <div class="card-icon icon-chars">Aa</div>
              <div class="card-name">Caractères</div>
              <div class="card-count">2 fonctions</div>
            </div>
            <div class="category-card" @click="go('arrondi')">
              <div class="card-icon icon-nums">∑</div>
              <div class="card-name">Nombres</div>
              <div class="card-count">5 fonctions</div>
            </div>
            <div class="category-card" @click="go('long')">
              <div class="card-icon icon-strings">"…"</div>
              <div class="card-name">Chaînes</div>
              <div class="card-count">9 fonctions</div>
            </div>
          </div>
          <div class="fn-list-section">
            <div class="fn-list-title">Toutes les fonctions</div>
            <div class="fn-chips">
              <span class="fn-chip" v-for="fn in allFunctions" :key="fn.id" @click="go(fn.id)">{{ fn.id
              }}</span>
            </div>
          </div>
        </div>

        <!-- FUNCTION DETAIL -->
        <div v-else class="fn-view" :key="current">

          <!-- Breadcrumb -->
          <div class="fn-breadcrumb">
            <a @click="go(null)">Accueil</a>
            <span style="color:var(--text-dim)">›</span>
            <span>{{ categoryLabel }}</span>
            <span style="color:var(--text-dim)">›</span>
            <span style="color:var(--text)">{{ current }}</span>
          </div>

          <!-- Header -->
          <div class="fn-header">
            <div class="fn-badge" :class="badgeClass">{{ categoryLabel }}</div>
            <div class="fn-name">{{ currentFn.id }}</div>
            <p class="fn-desc">{{ currentFn.description }}</p>
          </div>

          <!-- Syntax -->
          <div class="section">
            <div class="section-label">Syntaxe</div>
            <div class="syntax-grid">
              <div class="syntax-panel">
                <div class="syntax-lang"><span class="lang-dot algo-dot"></span>Algorithme</div>
                <div class="syntax-code" v-html="currentFn.algoSyntax"></div>
              </div>
              <div class="syntax-panel">
                <div class="syntax-lang"><span class="lang-dot py-dot"></span>Python</div>
                <div class="syntax-code" v-html="currentFn.pySyntax"></div>
              </div>
            </div>
          </div>

          <!-- Demo -->
          <div class="section">
            <div class="section-label">Démonstration interactive</div>
            <div class="demo-box">
              <div class="demo-header">
                <span class="demo-dot d1"></span>
                <span class="demo-dot d2"></span>
                <span class="demo-dot d3"></span>
                <span class="demo-header-title">demo.algo</span>
              </div>
              <div class="demo-body">

                <!-- CHR -->
                <template v-if="current === 'chr'">
                  <div class="control-row">
                    <span class="control-label">code ←</span>
                    <div class="range-wrap">
                      <input type="range" class="range-input" min="32" max="126" v-model="chrCode">
                      <span class="range-val">{{ chrCode }}</span>
                    </div>
                    <input type="number" class="control-input" min="32" max="126" v-model="chrCode">
                  </div>
                  <div class="result-row">
                    <span class="result-call">chr({{ chrCode }})</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value string">"{{ String.fromCharCode(chrCode) }}"</span>
                  </div>
                </template>

                <!-- ORD -->
                <template v-if="current === 'ord'">
                  <div class="control-row">
                    <span class="control-label">car ←</span>
                    <input type="text" class="control-input char-input" maxlength="1" v-model="ordCar">
                  </div>
                  <div class="result-row">
                    <span class="result-call">ord("{{ ordCar }}")</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value">{{ ordCar ? ordCar.charCodeAt(0) : '—' }}</span>
                  </div>
                </template>

                <!-- ARRONDI -->
                <template v-if="current === 'arrondi'">
                  <div class="control-row">
                    <span class="control-label">x ←</span>
                    <input type="number" class="control-input" step="0.1" v-model="arrondiX">
                    <input type="range" class="range-input" min="-5" max="5" step="0.1" v-model="arrondiX"
                      style="flex:1">
                    <span class="range-val">{{ arrondiX }}</span>
                  </div>
                  <div class="result-row">
                    <span class="result-call">arrondi({{ arrondiX }})</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value">{{ arrondi(arrondiX) }}</span>
                  </div>
                </template>

                <!-- RACINE -->
                <template v-if="current === 'racine'">
                  <div class="control-row">
                    <span class="control-label">x ←</span>
                    <input type="number" class="control-input" step="0.5" min="0" v-model="racineX">
                    <input type="range" class="range-input" min="0" max="100" step="0.5" v-model="racineX"
                      style="flex:1">
                    <span class="range-val">{{ racineX }}</span>
                  </div>
                  <div class="result-row">
                    <span class="result-call">racine({{ racineX }})</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value">{{ parseFloat(Math.sqrt(racineX).toFixed(6))
                    }}</span>
                  </div>
                </template>

                <!-- ALEA -->
                <template v-if="current === 'alea'">
                  <div class="control-row">
                    <span class="control-label">vi ←</span>
                    <input type="number" class="control-input" step="1" v-model="aleaVi">
                  </div>
                  <div class="control-row">
                    <span class="control-label">vf ←</span>
                    <input type="number" class="control-input" step="1" v-model="aleaVf">
                  </div>
                  <button class="btn-gen" @click="refreshAlea()">Générer</button>
                  <div class="result-row">
                    <span class="result-call">aléa({{ aleaVi }}, {{ aleaVf }})</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value">{{ aleaVal }}</span>
                  </div>
                </template>

                <!-- ABS -->
                <template v-if="current === 'abs'">
                  <div class="control-row">
                    <span class="control-label">x ←</span>
                    <input type="number" class="control-input" step="1" v-model="absX">
                    <input type="range" class="range-input" min="-50" max="50" step="1" v-model="absX" style="flex:1">
                    <span class="range-val">{{ absX }}</span>
                  </div>
                  <div class="result-row">
                    <span class="result-call">abs({{ absX }})</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value">{{ Math.abs(absX) }}</span>
                  </div>
                </template>

                <!-- ENT -->
                <template v-if="current === 'ent'">
                  <div class="control-row">
                    <span class="control-label">x ←</span>
                    <input type="number" class="control-input" step="0.1" v-model="entX">
                    <input type="range" class="range-input" min="-5" max="5" step="0.1" v-model="entX" style="flex:1">
                    <span class="range-val">{{ entX }}</span>
                  </div>
                  <div class="result-row">
                    <span class="result-call">ent({{ entX }})</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value">{{ Math.trunc(entX) }}</span>
                  </div>
                </template>

                <!-- CH[I] -->
                <template v-if="current === 'ch[i]'">
                  <div class="control-row">
                    <span class="control-label">ch ←</span>
                    <input type="text" class="control-input wide" v-model="indexICh" placeholder="Saisir une chaîne…">
                  </div>
                  <div class="control-row">
                    <span class="control-label">i ←</span>
                    <input type="number" class="control-input" :min="0" :max="indexICh.length - 1" step="1"
                      v-model="indexIval">
                  </div>
                  <div class="str-viz" v-if="indexICh.length">
                    <div v-for="(car, i) in indexICh" :key="i" class="str-char" :class="{ selected: +indexIval === i }"
                      @click="indexIval = i">
                      <div class="str-char-val">{{ car }}</div>
                      <div class="str-char-idx">{{ i }}</div>
                    </div>
                  </div>
                  <div class="result-row">
                    <span class="result-call">ch[{{ indexIval }}]</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value" :class="chIndexResult === 'Erreur' ? 'error' : 'string'">"{{
                      chIndexResult
                    }}"</span>
                  </div>
                </template>

                <!-- LONG -->
                <template v-if="current === 'long'">
                  <div class="control-row">
                    <span class="control-label">ch ←</span>
                    <input type="text" class="control-input wide" v-model="longCh" placeholder="Saisir une chaîne…">
                  </div>
                  <div class="str-viz" v-if="longCh.length">
                    <div v-for="(car, i) in longCh" :key="i" class="str-char highlighted">
                      <div class="str-char-val">{{ car }}</div>
                      <div class="str-char-idx">{{ i }}</div>
                    </div>
                  </div>
                  <div class="result-row">
                    <span class="result-call">long("{{ longCh }}")</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value">{{ longCh.length }}</span>
                  </div>
                </template>

                <!-- POS -->
                <template v-if="current === 'pos'">
                  <div class="control-row">
                    <span class="control-label">ch1 ←</span>
                    <input type="text" class="control-input wide" v-model="posCh1" placeholder="Motif à chercher">
                  </div>
                  <div class="control-row">
                    <span class="control-label">ch2 ←</span>
                    <input type="text" class="control-input wide" v-model="posCh2" placeholder="Chaîne source">
                  </div>
                  <div class="str-viz" v-if="posCh2.length">
                    <div v-for="(car, i) in posCh2" :key="i" class="str-char"
                      :class="{ selected: isInPosRange(posCh1, posCh2, i) }">
                      <div class="str-char-val">{{ car }}</div>
                      <div class="str-char-idx">{{ i }}</div>
                    </div>
                  </div>
                  <div class="result-row">
                    <span class="result-call">pos("{{ posCh1 }}", "{{ posCh2 }}")</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value" :class="posCh2.indexOf(posCh1) === -1 ? 'error' : ''">{{
                      posCh2.indexOf(posCh1) }}</span>
                  </div>
                </template>

                <!-- CONVCH -->
                <template v-if="current === 'ConvCh'">
                  <div class="control-row">
                    <span class="control-label">x ←</span>
                    <input type="number" class="control-input" step="0.01" v-model="convChVal">
                  </div>
                  <div class="result-row">
                    <span class="result-call">ConvCh({{ convChVal }})</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value string">"{{ '' + convChVal }}"</span>
                  </div>
                </template>

                <!-- ESTNUM -->
                <template v-if="current === 'EstNum'">
                  <div class="control-row">
                    <span class="control-label">ch ←</span>
                    <input type="text" class="control-input wide" v-model="estNumCh" placeholder="Saisir une valeur">
                  </div>
                  <div class="result-row">
                    <span class="result-call">EstNum("{{ estNumCh }}")</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value" :class="estNum(estNumCh) === 'Vrai' ? 'bool-true' : 'bool-false'">{{
                      estNum(estNumCh) }}</span>
                  </div>
                </template>

                <!-- VALEUR -->
                <template v-if="current === 'valeur'">
                  <div class="control-row">
                    <span class="control-label">ch ←</span>
                    <input type="text" class="control-input wide" v-model="valeurCh" placeholder="Ex: 42 ou 3.14">
                  </div>
                  <div class="result-row">
                    <span class="result-call">valeur("{{ valeurCh }}")</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value" :class="valeur(valeurCh) === 'Erreur' ? 'error' : ''">{{ valeur(valeurCh)
                    }}</span>
                  </div>
                </template>

                <!-- SOUS_CHAINE -->
                <template v-if="current === 'sous_chaine'">
                  <div class="control-row">
                    <span class="control-label">ch ←</span>
                    <input type="text" class="control-input wide" v-model="sousChaineCh"
                      placeholder="Saisir une chaîne…">
                  </div>
                  <div class="control-row">
                    <span class="control-label">d ←</span>
                    <input type="number" class="control-input" step="1" min="0" :max="sousChaineCh.length"
                      v-model="sousChaineD">
                  </div>
                  <div class="control-row">
                    <span class="control-label">f ←</span>
                    <input type="number" class="control-input" step="1" min="0" :max="sousChaineCh.length"
                      v-model="sousChaineF">
                  </div>
                  <div class="str-viz" v-if="sousChaineCh.length">
                    <div v-for="(car, i) in sousChaineCh" :key="i" class="str-char"
                      :class="{ selected: i >= +sousChaineD && i < +sousChaineF }">
                      <div class="str-char-val">{{ car }}</div>
                      <div class="str-char-idx">{{ i }}</div>
                    </div>
                  </div>
                  <div class="result-row">
                    <span class="result-call">sous_chaine("{{ sousChaineCh }}", {{ sousChaineD }},
                      {{ sousChaineF }})</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value string">"{{ sousChaineCh.slice(+sousChaineD,
                      +sousChaineF) }}"</span>
                  </div>
                </template>

                <!-- EFFACER -->
                <template v-if="current === 'effacer'">
                  <div class="control-row">
                    <span class="control-label">ch ←</span>
                    <input type="text" class="control-input wide" v-model="effacerCh" placeholder="Saisir une chaîne…">
                  </div>
                  <div class="control-row">
                    <span class="control-label">d ←</span>
                    <input type="number" class="control-input" step="1" min="0" :max="effacerCh.length"
                      v-model="effacerD">
                  </div>
                  <div class="control-row">
                    <span class="control-label">f ←</span>
                    <input type="number" class="control-input" step="1" min="0" :max="effacerCh.length"
                      v-model="effacerF">
                  </div>
                  <div class="str-viz" v-if="effacerCh.length">
                    <div v-for="(car, i) in effacerCh" :key="i" class="str-char"
                      :class="{ erased: i >= +effacerD && i < +effacerF }">
                      <div class="str-char-val">{{ car }}</div>
                      <div class="str-char-idx">{{ i }}</div>
                    </div>
                  </div>
                  <div class="result-row">
                    <span class="result-call">effacer("{{ effacerCh }}", {{ effacerD }}, {{ effacerF
                    }})</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value string">"{{ effacerCh.slice(0, +effacerD) +
                      effacerCh.slice(+effacerF) }}"</span>
                  </div>
                </template>

                <!-- MAJUS -->
                <template v-if="current === 'majus'">
                  <div class="control-row">
                    <span class="control-label">ch ←</span>
                    <input type="text" class="control-input wide" v-model="majusCh" placeholder="Saisir une chaîne…">
                  </div>
                  <div class="result-row">
                    <span class="result-call">majus("{{ majusCh }}")</span>
                    <span class="result-arrow">→</span>
                    <span class="result-value string">"{{ majusCh.toUpperCase() }}"</span>
                  </div>
                </template>

              </div><!-- /demo-body -->
            </div><!-- /demo-box -->
          </div>

          <!-- ASCII Table (chr / ord) -->
          <div class="ascii-table-wrap" v-if="current === 'chr' || current === 'ord'">
            <div class="ascii-table-header">Table ASCII standard (32–126)</div>
            <div class="ascii-table-scroll">
              <table class="ascii-table">
                <tbody>
                  <template v-for="row in 6" :key="row">
                    <tr>
                      <td v-for="col in 16" :key="col" class="ascii-cell ascii-code"
                        :class="{ selected: isAsciiSelected(31 + (row - 1) * 16 + col) }"
                        @click="selectAscii(31 + (row - 1) * 16 + col)">
                        {{ 31 + (row - 1) * 16 + col }}
                      </td>
                    </tr>
                    <tr>
                      <td v-for="col in 16" :key="col" class="ascii-cell ascii-char"
                        :class="{ selected: isAsciiSelected(31 + (row - 1) * 16 + col) }"
                        @click="selectAscii(31 + (row - 1) * 16 + col)">
                        {{ String.fromCharCode(31 + (row - 1) * 16 + col) }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Prev / Next nav -->
          <div class="fn-nav">
            <button class="fn-nav-btn" v-if="prevFn" @click="go(prevFn.id)">
              <span class="nav-hint">← Précédent</span>
              <span>{{ prevFn.id }}</span>
            </button>
            <div style="flex:1" v-else></div>
            <button class="fn-nav-btn next" v-if="nextFn" @click="go(nextFn.id)">
              <span class="nav-hint">Suivant →</span>
              <span>{{ nextFn.id }}</span>
            </button>
          </div>

        </div><!-- /fn-view -->
      </div><!-- /main-inner -->
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const FUNCTIONS = [
  {
    id: 'chr', cat: 'chars',
    description: 'Retourne le caractère dont le code ASCII est donné.',
    algoSyntax: '<span class="kw">car</span> ← <span class="fn-c">chr</span>(<span class="num-c">code</span>)',
    pySyntax: '<span class="kw">car</span> = <span class="fn-c">chr</span>(<span class="num-c">code</span>)',
  },
  {
    id: 'ord', cat: 'chars',
    description: 'Retourne le code ASCII d\'un caractère.',
    algoSyntax: '<span class="kw">code</span> ← <span class="fn-c">ord</span>(<span class="str-c">car</span>)',
    pySyntax: '<span class="kw">code</span> = <span class="fn-c">ord</span>(<span class="str-c">car</span>)',
  },
  {
    id: 'arrondi', cat: 'nums',
    description: 'Retourne l\'entier le plus proche de x (arrondi à la moitié paire si x.5).',
    algoSyntax: '<span class="kw">ep</span> ← <span class="fn-c">arrondi</span>(<span class="num-c">x</span>)',
    pySyntax: '<span class="kw">ep</span> = <span class="fn-c">round</span>(<span class="num-c">x</span>)',
  },
  {
    id: 'racine', cat: 'nums',
    description: 'Retourne la racine carrée de x (x ≥ 0).',
    algoSyntax: '<span class="kw">rac</span> ← <span class="fn-c">racine</span>(<span class="num-c">x</span>)',
    pySyntax: '<span class="cmt">from math import sqrt</span>\n<span class="kw">rac</span> = <span class="fn-c">sqrt</span>(<span class="num-c">x</span>)',
  },
  {
    id: 'alea', cat: 'nums',
    description: 'Retourne un entier aléatoire dans l\'intervalle [vi, vf].',
    algoSyntax: '<span class="kw">na</span> ← <span class="fn-c">aléa</span>(<span class="num-c">vi</span>, <span class="num-c">vf</span>)',
    pySyntax: '<span class="cmt">from random import randint</span>\n<span class="kw">na</span> = <span class="fn-c">randint</span>(<span class="num-c">vi</span>, <span class="num-c">vf</span>)',
  },
  {
    id: 'graine', cat: 'nums',
    description: 'Initialise la graine (seed) du générateur de nombres aléatoires.',
    algoSyntax: '<span class="fn-c">graine</span>(<span class="num-c">val</span>)',
    pySyntax: '<span class="cmt">from random import seed</span>\n<span class="fn-c">seed</span>(<span class="num-c">val</span>)',
  },
  {
    id: 'abs', cat: 'nums',
    description: 'Retourne la valeur absolue de x.',
    algoSyntax: '<span class="kw">va</span> ← <span class="fn-c">abs</span>(<span class="num-c">x</span>)',
    pySyntax: '<span class="kw">va</span> = <span class="fn-c">abs</span>(<span class="num-c">x</span>)',
  },
  {
    id: 'ent', cat: 'nums',
    description: 'Supprime la partie décimale et retourne l\'entier tronqué.',
    algoSyntax: '<span class="kw">ve</span> ← <span class="fn-c">ent</span>(<span class="num-c">x</span>)',
    pySyntax: '<span class="kw">ve</span> = <span class="fn-c">int</span>(<span class="num-c">x</span>)',
  },
  {
    id: 'ch[i]', cat: 'strings',
    description: 'Retourne le caractère à l\'indice i dans la chaîne ch.',
    algoSyntax: '<span class="kw">car</span> ← <span class="str-c">ch</span>[<span class="num-c">i</span>]',
    pySyntax: '<span class="kw">car</span> = <span class="str-c">ch</span>[<span class="num-c">i</span>]',
  },
  {
    id: 'long', cat: 'strings',
    description: 'Retourne le nombre de caractères de la chaîne ch.',
    algoSyntax: '<span class="kw">l</span> ← <span class="fn-c">long</span>(<span class="str-c">ch</span>)',
    pySyntax: '<span class="kw">l</span> = <span class="fn-c">len</span>(<span class="str-c">ch</span>)',
  },
  {
    id: 'pos', cat: 'strings',
    description: 'Retourne la première position de ch1 dans ch2, ou -1 si introuvable.',
    algoSyntax: '<span class="kw">p</span> ← <span class="fn-c">pos</span>(<span class="str-c">ch1</span>, <span class="str-c">ch2</span>)',
    pySyntax: '<span class="kw">p</span> = <span class="str-c">ch2</span>.<span class="fn-c">find</span>(<span class="str-c">ch1</span>)',
  },
  {
    id: 'ConvCh', cat: 'strings',
    description: 'Convertit un nombre (entier ou réel) en chaîne de caractères.',
    algoSyntax: '<span class="kw">xch</span> ← <span class="fn-c">ConvCh</span>(<span class="num-c">x</span>)',
    pySyntax: '<span class="kw">xch</span> = <span class="fn-c">str</span>(<span class="num-c">x</span>)',
  },
  {
    id: 'EstNum', cat: 'strings',
    description: 'Retourne Vrai si ch représente un nombre, Faux sinon.',
    algoSyntax: '<span class="kw">b</span> ← <span class="fn-c">EstNum</span>(<span class="str-c">ch</span>)',
    pySyntax: '<span class="kw">b</span> = <span class="str-c">ch</span>.<span class="fn-c">isdecimal</span>()',
  },
  {
    id: 'valeur', cat: 'strings',
    description: 'Convertit une chaîne numérique en valeur, ou erreur si non convertible.',
    algoSyntax: '<span class="kw">n</span> ← <span class="fn-c">valeur</span>(<span class="str-c">ch</span>)',
    pySyntax: '<span class="kw">n</span> = <span class="fn-c">int</span>(<span class="str-c">ch</span>)  <span class="cmt"># ou float()</span>',
  },
  {
    id: 'sous_chaine', cat: 'strings',
    description: 'Retourne le fragment de ch entre la position d (incluse) et f (exclue).',
    algoSyntax: '<span class="kw">sch</span> ← <span class="fn-c">sous_chaine</span>(<span class="str-c">ch</span>, <span class="num-c">d</span>, <span class="num-c">f</span>)',
    pySyntax: '<span class="kw">sch</span> = <span class="str-c">ch</span>[<span class="num-c">d</span>:<span class="num-c">f</span>]',
  },
  {
    id: 'effacer', cat: 'strings',
    description: 'Supprime le fragment de ch situé entre la position d (incluse) et f (exclue).',
    algoSyntax: '<span class="kw">sch</span> ← <span class="fn-c">effacer</span>(<span class="str-c">ch</span>, <span class="num-c">d</span>, <span class="num-c">f</span>)',
    pySyntax: '<span class="kw">sch</span> = <span class="str-c">ch</span>[:<span class="num-c">d</span>] + <span class="str-c">ch</span>[<span class="num-c">f</span>:]',
  },
  {
    id: 'majus', cat: 'strings',
    description: 'Convertit tous les caractères d\'une chaîne en majuscules.',
    algoSyntax: '<span class="kw">chm</span> ← <span class="fn-c">majus</span>(<span class="str-c">ch</span>)',
    pySyntax: '<span class="kw">chm</span> = <span class="str-c">ch</span>.<span class="fn-c">upper</span>()',
  },
];

const current = ref(null);
const search = ref('');
const isLight = ref(false);
const layoutRef = ref(null);
function toggleTheme() {
  isLight.value = !isLight.value;
  if (layoutRef.value) {
    layoutRef.value.classList.toggle('light-mode', isLight.value);
  }
}

// States
const chrCode = ref(65);
const ordCar = ref('a');
const arrondiX = ref(2.5);
const racineX = ref(16);
const aleaVi = ref(1);
const aleaVf = ref(6);
const aleaVal = ref(3);
const absX = ref(-7);
const entX = ref(3.9);
const indexICh = ref('Bonjour');
const indexIval = ref(0);
const longCh = ref('Hello');
const posCh1 = ref('on');
const posCh2 = ref('Bonjour');
const convChVal = ref(42);
const estNumCh = ref('123');
const valeurCh = ref('42');
const sousChaineCh = ref('Wallet');
const sousChaineD = ref(1);
const sousChaineF = ref(4);
const effacerCh = ref('Bateaux');
const effacerD = ref(1);
const effacerF = ref(3);
const majusCh = ref('BoNjOuR');

const allFunctions = computed(() => FUNCTIONS);

const filteredGroups = computed(() => {
  const q = search.value.toLowerCase();
  const filter = fn => fn.id.toLowerCase().includes(q);
  return {
    chars: FUNCTIONS.filter(f => f.cat === 'chars').filter(filter),
    nums: FUNCTIONS.filter(f => f.cat === 'nums').filter(filter),
    strings: FUNCTIONS.filter(f => f.cat === 'strings').filter(filter),
  };
});

const currentFn = computed(() => FUNCTIONS.find(f => f.id === current.value) || null);

const categoryLabel = computed(() => {
  if (!currentFn.value) return '';
  return { chars: 'Caractères', nums: 'Nombres', strings: 'Chaînes' }[currentFn.value.cat];
});

const badgeClass = computed(() => {
  if (!currentFn.value) return '';
  return { chars: 'badge-chars', nums: 'badge-nums', strings: 'badge-strings' }[currentFn.value.cat];
});

const currentIndex = computed(() => FUNCTIONS.findIndex(f => f.id === current.value));
const prevFn = computed(() => currentIndex.value > 0 ? FUNCTIONS[currentIndex.value - 1] : null);
const nextFn = computed(() => currentIndex.value < FUNCTIONS.length - 1 ? FUNCTIONS[currentIndex.value + 1] : null);

function go(id) {
  current.value = id;
  window.scrollTo(0, 0);
}

// Logic functions
function arrondi(x) {
  const ix = Math.floor(x);
  if (x - ix === 0.5) {
    return ix % 2 === 0 ? ix : ix + 1;
  }
  return Math.round(x);
}
function estNum(ch) { return /^-?\d+(\.\d+)?$/.test(ch.trim()) ? 'Vrai' : 'Faux'; }
function valeur(ch) {
  const n = Number(ch);
  return isNaN(n) || ch.trim() === '' ? 'Erreur' : n;
}
function refreshAlea() {
  const a = Math.min(+aleaVi.value, +aleaVf.value);
  const b = Math.max(+aleaVi.value, +aleaVf.value);
  aleaVal.value = Math.floor(Math.random() * (b - a + 1)) + a;
}
function isInPosRange(ch1, ch2, i) {
  const idx = ch2.indexOf(ch1);
  return idx !== -1 && i >= idx && i < idx + ch1.length;
}
function isAsciiSelected(code) {
  if (current.value === 'chr') return +chrCode.value === code;
  if (current.value === 'ord') return ordCar.value && ordCar.value.charCodeAt(0) === code;
  return false;
}
function selectAscii(code) {
  if (current.value === 'chr') chrCode.value = code;
  if (current.value === 'ord') ordCar.value = String.fromCharCode(code);
}
const chIndexResult = computed(() => {
  const i = +indexIval.value;
  if (i < 0 || i >= indexICh.value.length) return 'Erreur';
  return indexICh.value[i];
});
</script>

<style>
/* ===== RESET & BASE ===== */
:root {
  --bg: #1e1e2e;
  --bg-sidebar: #16162a;
  --bg-card: #27273a;
  --bg-hover: #2d2d45;
  --bg-code: #1a1a2e;
  --text: #e0e0e0;
  --text-dim: #7a7a9a;
  --text-muted: #5a5a7a;
  --accent: #7c4dff;
  --accent2: #9f7aea;
  --accent3: #68d391;
  --accent4: #f6ad55;
  --accent5: #fc8181;
  --accent-hover: #9c7cff;
  --border: #3d3d5c;
  --keyword: #bb86fc;
  --string: #c3e88d;
  --number: #f78c6c;
  --function: #82aaff;
  --comment: #6d6d8a;
  --type: #4fc3f7;
  --cat-chars: #4fc3f7;
  --cat-nums: #ffb74d;
  --cat-strings: #81c784;
  --badge-chars-bg: rgba(79, 195, 247, 0.15);
  --badge-nums-bg: rgba(255, 183, 77, 0.15);
  --badge-strings-bg: rgba(129, 199, 132, 0.15);
}

/* Light mode variables */
.light-mode {
  --bg: #f5f5f7;
  --bg-sidebar: #ffffff;
  --bg-card: #ffffff;
  --bg-hover: #f0f0f5;
  --bg-code: #f8f8fa;
  --text: #1d1d1f;
  --text-dim: #6e6e73;
  --text-muted: #86868b;
  --accent: #7c4dff;
  --accent-hover: #6a3fe0;
  --border: #d2d2d7;
  --keyword: #af52de;
  --string: #1a7f37;
  --number: #d4380d;
  --function: #0052cc;
  --comment: #6e6e73;
  --type: #0070c0;
  --cat-chars: #0070c0;
  --cat-nums: #d4380d;
  --cat-strings: #1a7f37;
  --badge-chars-bg: rgba(0, 112, 192, 0.1);
  --badge-nums-bg: rgba(212, 56, 13, 0.1);
  --badge-strings-bg: rgba(26, 127, 55, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

a {
  color: var(--accent);
  cursor: pointer;
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
}

.layout {
  display: flex;
  min-height: 100vh;
}

@media (max-width: 900px) {
  .layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100% !important;
    max-height: 40vh;
  }

  .sidebar-nav {
    max-height: 20vh;
  }
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 24px 20px 12px;
  border-bottom: 1px solid var(--border);
}

.sidebar-logo {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-dim);
  margin-bottom: 4px;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.theme-toggle {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--text-dim);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  color: var(--text);
  border-color: var(--accent);
}

.search-bar {
  padding: 12px 16px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.search-input:focus {
  border-color: var(--accent);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0 20px;
}

.nav-group {
  margin-bottom: 4px;
}

.nav-group-label {
  padding: 8px 20px 4px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
}

.nav-item {
  padding: 7px 20px 7px 28px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-dim);
  transition: all 0.15s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  color: var(--text);
  background: var(--bg-hover);
}

.nav-item.active {
  color: var(--text);
  background: rgba(124, 77, 255, 0.1);
  border-left-color: var(--accent);
}

.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.nav-item.cat-chars .nav-dot {
  background: var(--accent2);
}

.nav-item.cat-nums .nav-dot {
  background: var(--accent4);
}

.nav-item.cat-strings .nav-dot {
  background: var(--accent5);
}

/* ===== MAIN ===== */
.main {
  width: 100%;
  min-width: 0;
  padding: 40px;
  overflow-y: auto;
  max-height: calc(100vh - 60px);
}

.main-inner {
  max-width: 900px;
  margin: 0 auto;
}

/* ===== HOME ===== */
.home-hero {
  margin-bottom: 40px;
}

.home-eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--accent);
  margin-bottom: 12px;
}

.home-heading {
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 12px;
}

.home-heading span {
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.home-sub {
  color: var(--text-dim);
  font-size: 1.05rem;
  line-height: 1.6;
  max-width: 600px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}

@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

.category-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.icon-chars {
  background: rgba(79, 195, 247, 0.15);
  color: var(--cat-chars);
}

.icon-nums {
  background: rgba(255, 183, 77, 0.15);
  color: var(--cat-nums);
}

.icon-strings {
  background: rgba(129, 199, 132, 0.15);
  color: var(--cat-strings);
}

.card-name {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-count {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.fn-list-section {
  margin-top: 8px;
}

.fn-list-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.fn-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fn-chip {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'JetBrains Mono', monospace;
}

.fn-chip:hover {
  border-color: var(--accent);
  color: var(--text);
  background: rgba(124, 77, 255, 0.1);
}

/* ===== FUNCTION VIEW ===== */
.fn-breadcrumb {
  font-size: 0.8rem;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.fn-breadcrumb a:hover {
  color: var(--accent-hover);
}

.fn-header {
  margin-bottom: 28px;
}

.fn-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
}

.badge-chars {
  background: var(--badge-chars-bg);
  color: var(--cat-chars);
}

.badge-nums {
  background: var(--badge-nums-bg);
  color: var(--cat-nums);
}

.badge-strings {
  background: var(--badge-strings-bg);
  color: var(--cat-strings);
}

.fn-name {
  font-size: 2.2rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 8px;
}

.fn-desc {
  color: var(--text-dim);
  font-size: 1rem;
  line-height: 1.6;
}

.section {
  margin-bottom: 32px;
}

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

/* ===== SYNTAX ===== */
.syntax-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 640px) {
  .syntax-grid {
    grid-template-columns: 1fr;
  }
}

.syntax-panel {
  background: var(--bg-code);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.syntax-lang {
  padding: 8px 14px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.algo-dot {
  background: var(--accent);
}

.py-dot {
  background: #ffd54f;
}

.syntax-code {
  padding: 14px;
  font-family: 'JetBrains Mono', 'Cascadia Code', monospace;
  font-size: 0.85rem;
  line-height: 1.7;
  white-space: pre-wrap;
}

.syntax-code .kw {
  color: var(--keyword);
  font-weight: 600;
}

.syntax-code .fn-c {
  color: var(--function);
}

.syntax-code .num-c {
  color: var(--number);
}

.syntax-code .str-c {
  color: var(--string);
}

.syntax-code .cmt {
  color: var(--comment);
  font-style: italic;
}

/* ===== DEMO BOX ===== */
.demo-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.demo-header {
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--border);
}

.demo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.d1 {
  background: #ff5f57;
}

.d2 {
  background: #ffbd2e;
}

.d3 {
  background: #28c840;
}

.demo-header-title {
  margin-left: 8px;
  font-size: 0.78rem;
  color: var(--text-dim);
  font-family: 'JetBrains Mono', monospace;
}

.demo-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--keyword);
  font-weight: 600;
  min-width: 60px;
}

.control-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-code);
  color: var(--text);
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', monospace;
  outline: none;
  width: 100px;
  transition: border-color 0.2s;
}

.control-input:focus {
  border-color: var(--accent);
}

.control-input.wide {
  width: 240px;
  max-width: 100%;
}

.control-input.char-input {
  width: 70px;
  text-align: center;
}

.range-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.range-input {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: var(--border);
  outline: none;
  cursor: pointer;
  min-width: 80px;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--bg-card);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.range-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--bg-card);
}

.range-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--number);
  font-weight: 600;
  min-width: 36px;
  text-align: center;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-code);
  border-radius: 8px;
  border: 1px solid var(--border);
  flex-wrap: wrap;
}

.result-call {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: var(--function);
}

.result-arrow {
  color: var(--text-dim);
  font-size: 1rem;
}

.result-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--number);
}

.result-value.string {
  color: var(--string);
}

.result-value.error {
  color: #f44336;
}

.result-value.bool-true {
  color: var(--string);
}

.result-value.bool-false {
  color: #f44336;
}

.btn-gen {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.btn-gen:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-gen:active {
  transform: translateY(0);
}

/* ===== STRING VISUALIZER ===== */
.str-viz {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.str-char {
  width: 40px;
  height: 48px;
  border: 1px solid var(--border);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bg-code);
}

.str-char:hover {
  border-color: var(--accent);
}

.str-char.selected {
  border-color: var(--accent);
  background: rgba(124, 77, 255, 0.15);
}

.str-char.erased {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  opacity: 0.4;
}

.str-char.highlighted {
  border-color: var(--cat-strings);
}

.str-char-val {
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.str-char-idx {
  font-size: 0.6rem;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

/* ===== ASCII TABLE ===== */
.ascii-table-wrap {
  margin-bottom: 32px;
}

.ascii-table-header {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.ascii-table-scroll {
  overflow-x: auto;
}

.ascii-table {
  border-collapse: collapse;
  width: 100%;
}

.ascii-cell {
  padding: 6px 4px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.1s;
}

.ascii-cell.ascii-code {
  color: var(--text-dim);
  font-size: 0.7rem;
}

.ascii-cell.ascii-char {
  font-size: 1rem;
  font-weight: 600;
}

.ascii-cell:hover {
  background: var(--bg-hover);
}

.ascii-cell.selected {
  background: rgba(124, 77, 255, 0.2);
  border-color: var(--accent);
}

/* ===== PREV/NEXT NAV ===== */
.fn-nav {
  display: flex;
  gap: 12px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.fn-nav-btn {
  padding: 12px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  font-family: inherit;
  color: var(--text);
  flex: 1;
}

.fn-nav-btn:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
}

.fn-nav-btn.next {
  text-align: right;
}

.nav-hint {
  display: block;
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* ===== SCROLLBAR ===== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #5a5a7a;
}
</style>