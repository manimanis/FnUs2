/**
 * Integration tests - comprehensive programs
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Programmes complets', async () => {
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
});