/**
 * Integration tests - comprehensive programs
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Bout de programme', () => {
    test('Déclaration et affectation chaîne', async () => {
        const code = `Var x, y: chaîne
Début
  x ← "Hello"
  Ecrire(x)
  y ← x[0]
  Ecrire(y)
  z ← 0
  Pour i de 0 à Long(x)-1 Faire
    y <- y + x[i]
    z ← z + (x[i] = x[i])
  Fin Pour
  Ecrire(y)
  Ecrire(z)
Fin`;
        const { interpreter, result } = await parseAndRun(code);
        expect(interpreter.getVars().x).toBe("Hello");
        expect(interpreter.getVars().y).toBe("HHello");
    });

    test('Affectation et concaténation chaîne', async () => {
        const code = `Var x: chaîne
Début
  x ← "Hello" + "World"
  Ecrire(x)
Fin`;
        const { interpreter, result } = await parseAndRun(code);
        expect(interpreter.getVars().x).toBe("HelloWorld");
    });

    test('Fonction verif', async () => {
        const code = `Fonction verif(ch: chaîne):booléen
Var i: entier
    test: booléen
Début
  test ← Vrai
  i ← 0
  Tant Que test et i < Long(ch) Faire
    test ← "A" ≤ ch[i] ≤ "Z"
    i ← i + 1
  Fin Tant Que
  Retourner test
Fin

Var x,y: booléen
Début
  x ← verif("Hello")
  y ← verif("HELLO")
  Ecrire(x)
  Ecrire(y)
Fin`;
        const { interpreter, result } = await parseAndRun(code);
        expect(interpreter.getVars().x).toBe(false);
        expect(interpreter.getVars().y).toBe(true);
    });

    test('Fonction verif et saisie', async () => {
        const code = `Fonction verif(ch: chaîne):booléen
Var i: entier
    test: booléen
Début
  test ← Vrai
  i ← 0
  Tant Que test et i < Long(ch) Faire
    test ← "A" ≤ ch[i] ≤ "Z"
    i ← i + 1
  Fin Tant Que
  Retourner test
Fin

Procédure SaisirCh(@ch: chaîne)
Début
  Répéter
    Ecrire("Entrez un mot : ")
    Lire(ch)
  Jusqu'à Long(ch) > 0 et verif(ch)
Fin

Var ch: chaîne
    x: booléen
Début
  SaisirCh(ch)
  x ← verif(ch)
  Ecrire(x)
Fin`;
        function fakeInput(arr) {
            return () => arr.shift();
        }

        const arr = `INFORMATION
6
IMPLICATION
RECOMMANDER
INFESTATION
AGRICULTEUR
AFFIRMATION
PROFITATION
`.split('\n');
        const { interpreter, result } = await parseAndRun(code, fakeInput(arr));
        expect(interpreter.getVars().x).toBe(true);
    });

    test('Affectation et concaténation chaîne', async () => {
        const code = `Var x: chaîne
Début
  x ← "Hello" + "World"
  Ecrire(x)
Fin`;
        const { interpreter, result } = await parseAndRun(code);
        expect(interpreter.getVars().x).toBe("HelloWorld");
    });
});

describe('Programmes complets', () => {
    const originalRandom = Math.random;

    beforeEach(() => {
        Math.random = () => 0.0; // valeur fixe
    });

    afterEach(() => {
        Math.random = originalRandom; // restauration
    });

    test('Algorithme Degré de ressemblance', async () => {
        const code = `Type tab1 = tableau de 10 chaîne
Type tab2 = tableau de 10 réel

Procédure SaisirCh(@ch: chaîne)
Début
  Répéter
    Ecrire("Entrez un mot : ")
    Lire(ch)
  Jusqu'à Long(ch) > 0 et verif(ch)
Fin

Procédure Saisir(@n: entier)
Début
  Répéter
    Ecrire("Nombre de mots : ");
    Lire(n);
  Jusqu'à 5 ≤ n ≤ 10
Fin

Procédure Remplir(ch: chaîne, @t: tab1, n: entier)
Var i: entier
Début
  Pour i de 0 à n-1 Faire
    Répéter
      Ecrire("t[", i, "] = ")
      Lire(t[i])
    Jusqu'à Long(t[i]) = Long(ch) et verif(t[i])
  Fin Pour
Fin

Fonction verif(ch: chaîne):booléen
Var i: entier
    test: booléen
Début
  test ← Vrai
  i ← 0
  Tant Que test et i < Long(ch) Faire
    test ← "A" ≤ ch[i] ≤ "Z"
    i ← i + 1
  Fin Tant Que
  Retourner test
Fin

Procédure Générer(@D: tab2, ch: chaîne, t: tab1, n: entier)
Var i: entier
Début
  Pour i de 0 à n-1 Faire
    D[i] ← DegréRess(t[i], ch)
  Fin Pour
Fin

Fonction DegréRess(ch1: chaîne, ch2: chaîne):réel
Var i, nc: entier
    r: réel
Début
  nc ← 0
  Pour i de 0 à Long(ch1)-1 Faire
    nc ← nc + (ch1[i] = ch2[i])
  Fin Pour
  Retourner nc * 100 / Long(ch1)
Fin

Fonction Max(d: tab2, n: entier):réel
Var mx: réel
  i: entier
Début
  mx ← d[0]
  Pour i de 1 à n-1 Faire
    Si d[i] > mx Alors
      mx ← d[i]
    Fin Si
  Fin Pour
  Retourner mx
Fin

Procédure Afficher(dr: réel, t: tab1, d: tab2, n: entier)
Var i: entier
Début
  Ecrire("Mots ayan le DR maximal : ", fin="")
  Pour i de 0 à n-1 Faire
    Si d[i] = dr Alors
      Ecrire(t[i], fin=", ")
    Fin Si
  Fin Pour
  Ecrire()
Fin

Algorithme Degré_Ressemblance
Var t: tab1
  d: tab2
  n: entier
  drm: réel
Début
  SaisirCh(ch)
  Saisir(n)
  Remplir(ch, t, n)
  Générer(d, ch, t, n)
  drm ← Max(d, n)
  Ecrire("DR maximal :", Arrondi(drm), "%")
  Afficher(drm, t, d, n)
Fin`;

        function fakeInput(arr) {
            return () => arr.shift();
        }

        const arr = `INFORMATION
6
IMPLICATION
RECOMMANDER
INFESTATION
AGRICULTEUR
AFFIRMATION
PROFITATION
`.split('\n');
        const { interpreter, result } = await parseAndRun(code, fakeInput(arr));
        expect(interpreter.getVars().t.slice(0, 6)).toEqual(["IMPLICATION", "RECOMMANDER", "INFESTATION", "AGRICULTEUR", "AFFIRMATION", "PROFITATION"]);
        // Degrés de ressemblance calculés pour ch="INFORMATION" (11 lettres)
        // IMPLICATION: 6/11*100, RECOMMANDER: 3/11*100, INFESTATION: 8/11*100
        // AGRICULTEUR: 1/11*100, AFFIRMATION: 8/11*100, PROFITATION: 5/11*100
        expect(interpreter.getVars().d.slice(0, 6)).toEqual([
            54.54545454545455, 27.272727272727273, 72.72727272727273,
            9.090909090909092, 72.72727272727273, 45.45454545454545
        ]);
        expect(interpreter.getVars().drm).toBeCloseTo(73, 0);
        expect(result.output[result.output.length - 3].trim()).toBe("INFESTATION,");
        expect(result.output[result.output.length - 2].trim()).toBe("AFFIRMATION,");
    });
});