/**
 * Integration tests - comprehensive programs
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Programmes complets', () => {
  const originalRandom = Math.random;

  beforeEach(() => {
    Math.random = () => 0.0; // valeur fixe
  });

  afterEach(() => {
    Math.random = originalRandom; // restauration
  });

  test('Algorithme Drones', async () => {
    const code = `Type tab1 = tableau de 11 chaîne
Type tab2 = tableau de 11 entier

Procédure Remplir(@td: tab1, @te: tab2, n: entier)
Var i, dp: entier
  p: réel
Début
  Pour i de 1 à n Faire
    Ecrire("Drone n°", i)
    Répéter
      Ecrire("Nom ? ")
      Lire(td[i])
    Jusqu'à distinct(td[i], td, i) et verif_nom(td[i])

    dp ← aléa(10, 1000)
    Répéter
      Ecrire("Puissance ? ")
      Lire(p)
    Jusqu'à p ≥ 0
    te[i] ← dp * p
  Fin Pour
Fin

Fonction distinct(ch: chaine, t: tab1, n: entier):booléen
var i: entier
  test: booléen
Début
  test ← Vrai
  i ← 0
  Tant Que test et i < n Faire
    test ← ch ≠ t[i]
    i ← i + 1
  Fin Tant Que
  Retourner test
Fin

Fonction verif_nom(ch: chaîne):booléen
Début
  Retourner (9 ≤ Long(ch) ≤ 11) et Sous_chaine(ch, 0, 6) = "DRONE-" et EstNum(Sous_chaine(ch, 6, Long(ch)))
Fin

Procédure Supprimer(@td: tab1, @te: tab2, @n: entier)
Var i, j: entier
Début
  i ← 1
  Pour j de 1 à n Faire
    Si te[j] ≠ 0 Alors
      te[i] ← te[j]
      td[i] ← td[j]
      i ← i + 1
    Fin Si
  Fin Pour
  n ← i - 1
Fin

Procédure Trier(@td: tab1, @te: tab2, n: entier)
Var i: entier
  trié: booléen
  aux1: réel
  aux2: chaîne
Début
  Répéter
    trié ← Vrai
    Pour i de 1 à n-1 Faire
      Si (te[i] < te[i+1]) ou (te[i] = te[i+1] et td[i] > td[i+1]) Alors
        aux1 ← te[i] ; te[i] ← te[i+1] ; te[i+1] ← aux1
        aux2 ← td[i] ; td[i] ← td[i+1] ; td[i+1] ← aux2
        trié ← Faux
      Fin Si
    Fin Pour
  Jusqu'à trié
Fin

Procédure Afficher(td: tab1, te: tab2, n: entier)
Début
  Pour i de 1 à n Faire
    Ecrire(td[i], ":", te[i])
  Fin Pour
Fin

Procédure Saisir(@n: entier)
Début
  Répéter
    Ecrire("n ? ")
    Lire(n)
  Jusqu'à 2 ≤ n ≤ 10
Fin

Var n: entier
    td: tab1
    te: tab2
Début
  Saisir(n)
  Remplir(td, te, n)
  Supprimer(td, te, n)
  Trier(td, te, n)
  Afficher(td, te, n)
Fin`;

    function fakeInput(arr) {
      let idx = 0;
      return () => {
        return arr[idx++];
      };
    }
    const arr = [
      7,
      'DRONE-315', '0.0',
      'DRONE-120', '35.05',
      'DRONE-842', '12.00',
      'DRONE-501', '0.0',
      'DRONE-220', '60.00',
      'DRONE-740', '94.07',
      'DRONE-100', '12.00',
    ];
    const { interpreter, result } = await parseAndRun(code, fakeInput(arr));

    const tef = [940.7, 600.0, 350.5, 120.0, 120.0];
    // console.log(interpreter.globalEnv);
    expect(interpreter.globalEnv['n']).toBe(5);
    expect(interpreter.globalEnv['td'].slice(1, 6)).toEqual(['DRONE-740', 'DRONE-220', 'DRONE-120', 'DRONE-100', 'DRONE-842']);
    tef.forEach((value, index) => {
      expect(interpreter.globalEnv['te'][index + 1]).toBeCloseTo(value, 1);
    });
  });

  test('Algorithme de révision', async () => {
    const code = `Type tab = Tableau de 10 Chaine

Procédure Saisir(@n: entier)
Début
  Répéter
    Ecrire("Entrez un entier : ");
    Lire(n);
  Jusqu'à 4 ≤ n ≤ 10
Fin

Procédure Remplir(@indices: tab, n: entier)
Var i: entier
Début
  Pour i de 0 à n-1 Faire
    Ecrire("Indice n°", i)
    indices[i] ← SaisieIndice(indices, i)
  Fin Pour
Fin

Fonction SaisieIndice(indices: tab, n: entier):chaîne
Var indice, ordch: chaine
  nv, ordre, code: entier
Début
  indice ← ""
  Répéter
    Ecrire("Nombre de valeurs ? ")
    Lire(nv)
  Jusqu'à nv ≥ 1

  Pour i de 1 à nv Faire
    Répéter
      Ecrire("Code n°", i, " ? ")
      Lire(code)
    Jusqu'à (33 ≤ code ≤ 127) et (Premier(code) ou SemiPremier(code))
    indice ← indice + ConvCh(code) + " "
  Fin Pour

  Répéter
    Ecrire("Ordre ? ")
    Lire(ordre)
    ordch ← Convch(ordre div 10) + Convch(ordre mod 10)
  Jusqu'à (1 ≤ ordre ≤ 99) et Rechercher(indice + ordch, indices, n) = -1
  
  Retourner indice + ordch
Fin

Fonction Rechercher(ch: chaine, t: tab, n: entier): entier
Var i, p: entier
    test: booléen
Début
  p ← -1
  i ← 0
  Tant Que i < n Et p = -1 Faire
    Si t[i] = ch Alors
      p ← i
    Fin Si
    i ← i + 1
  Fin Tant Que
  Retourner p
Fin

Fonction Premier(n: entier): booléen
Var i: entier
    test: booléen
Début
  test ← n >= 2
  i ← 2
  Tant Que i * i ≤ n Et test Faire
    test ← n mod i ≠ 0
    i ← i + 1
  Fin Tant Que
  Retourner test
Fin

Fonction SemiPremier(n: entier): booléen
Var i: entier
    test: booléen
Début
  test ← Faux
  i ← 2
  Tant Que i * i ≤ n Et non test Faire
    test ← n mod i = 0 et Premier(i) et Premier(n div i)
    i ← i + 1
  Fin Tant Que
  Retourner test
Fin
  
Procédure Décrypter(indices: tab, @mots: tab, n: entier)
Début
  Pour i de 0 à n-1 Faire
    mots[i] ← DécrypterIndice(indices[i])
  Fin Pour
Fin

Fonction DécrypterIndice(indice: chaîne):chaine
Var
    p : Entier
    ch: chaine
    car: caractere 
Début
    ch ← ""
    Tant Que Long(indice) > 2 Faire
      p ← Pos(" ", indice)
      car ← chr(Valeur(Sous_chaine(indice, 0, p)))
      ch ← ch + car
      indice ← Sous_chaine(indice, p+1, Long(indice))
    Fin Tant Que
    Retourner ch + indice
Fin

Procédure Classer(@mots: tab, n: Entier)
Var
    i, l1, l2 : Entier
    c1, c2, aux : Chaine
    trié: booleen
Début
  Répéter
    trié ← Vrai
    Pour i de 0 à n-2 Faire
      l1 ← Long(mots[i])
      l2 ← Long(mots[i+1])
      c1 ← mots[i][l1-2] + mots[i][l1-1]
      c2 ← mots[i+1][l2-2] + mots[i+1][l2-1]
      Si c1 > c2 Alors
        aux ← mots[i]
        mots[i] ← mots[i+1]
        mots[i+1] ← aux
        trié ← Faux
      Fin Si
    Fin Pour
  Jusqu'à trié
Fin

Fonction Reconstituer(@mots: tab, n: entier):chaine
Début
  ph ← ""
  Pour i de 0 à n-1 Faire
    ph ← ph + Sous_chaine(mots[i], 0, Long(mots[i]) - 2) + " "
  Fin Pour
  Retourner Sous_Chaine(ph, 0, Long(ph)-1)
Fin


Var
  indices, mots : Tab
  N : Entier
Début
  Saisir(N)
  Remplir(indices, N)
  Décrypter(indices, mots, N)
  Classer(MOTS, N)
  Ecrire(Reconstituer(mots, N))
Fin`;

    function fakeInput(arr) {
      return () => arr.shift();
    }

    const arr = `4
1
33
6
5
77
65
71
73
67
3
4
87
65
86
69
2
3
74
79
89
1`.split('\n').map(Number);
    const { interpreter, result } = await parseAndRun(code, fakeInput(arr));
    expect(result.output[result.output.length - 1].trim()).toBe("JOY WAVE MAGIC !");
    expect(interpreter.getVars()["mots"].splice(0, 4)).toEqual(["JOY01", "WAVE02", "MAGIC03", "!06"]);
  });

  test('Tri d\'un tableau', async () => {
    const code = `Type tab = tableau de 20 entier

Procédure Saisir(@n: entier)
Début
  Répéter
    Ecrire("Entrez un entier : ");
    Lire(n);
  Jusqu'à 0 < n ≤ 20
Fin

Procédure Remplir(@t: tab, n: entier)
Var i: entier
Début
  Pour i de 0 à n-1 Faire
    Ecrire("t[", i, "] = ");
    Lire(t[i]);
  Fin Pour
Fin

Procédure Copier(@t2: tab, t1: tab, n: entier)
Var i: entier
Début
  Pour i de 0 à n-1 Faire
    t2[i] ← t1[i]
  Fin Pour
Fin


Procédure Afficher(t: tab, n: entier)
Var i: entier
Début
  Pour i de 0 à n-1 Faire
    Ecrire(t[i], fin=" ");
  Fin Pour
  Ecrire()
Fin

Procédure TriSelection(@t: tab, n: entier)
Var i, j, min, temp: entier
Début
  Pour i de 0 à n-2 Faire
    min ← i
    Pour j de i+1 à n-1 Faire
      Si t[j] < t[min] Alors
        min ← j
      Fin Si
    Fin Pour
    Si min ≠ i Alors
      temp ← t[i]
      t[i] ← t[min]
      t[min] ← temp
    Fin Si
  Fin Pour
Fin

Procédure TriInsertion(@t: tab, n: entier)
Var i, j, temp: entier
    trié: booléen
Début
  Pour i de 1 à n-1 Faire
    temp ← t[i]
    j ← i - 1
    Tant Que j >= 0 Et t[j] > temp Faire
      t[j+1] ← t[j]
      j ← j - 1
    Fin Tant Que
    t[j+1] ← temp
  Fin Pour
Fin

Procédure TriBulles(@t: tab, n: entier)
Var i, j, temp: entier
    trié: booléen
Début
  Répéter
    trié ← Vrai
    Pour i de 0 à n-2 Faire
      Si t[i] > t[i+1] Alors
        temp ← t[i]
        t[i] ← t[i+1]
        t[i+1] ← temp
        trié ← Faux
      Fin Si
    Fin Pour
  Jusqu'à trié
Fin

Var t1, t2, t3, t4: tab
  n: entier
Début
  Saisir(n)
  Remplir(t1, n)
  Copier(t2, t1, n)
  Copier(t3, t1, n)
  Copier(t4, t1, n)
  
  TriBulles(t2, n)
  TriSelection(t3, n)
  TriInsertion(t4, n)
  
  Afficher(t2, n)
  Afficher(t3, n)
  Afficher(t4, n)
Fin`;

    function fakeInput(arr) {
      return () => arr.shift();
    }

    const arr = `13
2026
3
18
2
8
25
3
12
25
35
14
25
5
`.split('\n').map(Number);
    const { interpreter, result } = await parseAndRun(code, fakeInput(arr));
    expect(interpreter.getVars().t2.slice(0, 13)).toEqual([2, 3, 3, 5, 8, 12, 14, 18, 25, 25, 25, 35, 2026]);
  });
});