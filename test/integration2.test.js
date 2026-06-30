/**
 * Integration tests - comprehensive programs
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Programmes complets', async () => {
  test('Calcul du PGCD et PPCM', async () => {
    const { interpreter, result } = await parseAndRun(`Fonction pgcd(a, b: entier): entier
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
Fin`);
    expect(result.output[0].trim()).toBe('PGCD( 48 , 36 ) = 12');
    expect(result.output[1].trim()).toBe('PPCM( 48 , 36 ) = 144');
    expect(interpreter.globalEnv['x']).toBe(48);
    expect(interpreter.globalEnv['y']).toBe(36);
  });

  test('Fonctions sur les Chaines', async () => {
    const { interpreter, result } = await parseAndRun(`Fonction compterVoyelles(ch: chaine): entier
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
Fin`);
    expect(result.output[0].trim()).toBe('Texte: Algorithmique');
    expect(result.output[1].trim()).toBe('Longueur: 13');
    expect(result.output[2].trim()).toBe('Nombre de voyelles: 6');
    expect(result.output[3].trim()).toBe('Inversé: euqimhtiroglA');
  });

  test('Recherche dichotomique', async () => {
    const { interpreter, result } = await parseAndRun(`Type tab = tableau de 10 entier

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

  pos ← rechercher(tab, 15)
  Si pos >= 0 Alors
    Ecrire("Valeur 15 trouvée à l'indice", pos)
  Sinon
    Ecrire("Valeur 15 non trouvée")
  Fin Si

  pos ← rechercher(tab, 24)
  Si pos >= 0 Alors
    Ecrire("Valeur 24 trouvée à l'indice", pos)
  Sinon
    Ecrire("Valeur 24 non trouvée")
  Fin Si

  pos ← rechercher(tab, 25)
  Si pos >= 0 Alors
    Ecrire("Valeur 25 trouvée à l'indice", pos)
  Sinon
    Ecrire("Valeur 25 non trouvée")
  Fin Si
Fin`);
    expect(result.output[0].trim()).toBe('Valeur 15 trouvée à l\'indice 5');
    expect(result.output[1].trim()).toBe('Valeur 24 trouvée à l\'indice 8');
    expect(result.output[2].trim()).toBe('Valeur 25 non trouvée');
  });

  test('Programme de cryptage', async () => {
    function fakeInput(text) {
      let index = 0;
      return () => text[index++];
    }

    const { interpreter, result } = await parseAndRun(`Type tab = tableau de 20 chaîne

Procédure Saisir(@ch: chaîne)
Début
  Répéter
    Ecrire("Entrez une chaîne: ")
    Lire(ch)
  Jusqu'à verif(ch)
Fin

Fonction verif(ch: chaîne): booléen
Var test: booléen
  i, nm: entier
Début
  test ← Long(ch) ≥ 0 et ch[0] ≠ " " et ch[Long(ch)-1] ≠ " " et Pos("  ", ch) = -1
  i ← 0
  nm ← 0
  Tant que i < Long(ch) et test faire
    test ← "A" ≤ majus(ch[i]) ≤ "Z" ou ch[i] = " "
    Si ch[i] = " " alors
      nm ← nm + 1
    Fin Si
    i ← i + 1
  Fin Tant que
  Retourner test et nm ≤ 20
Fin

Procédure Découper(@t: tab, @n:entier, ch: chaîne)
Var p: entier
  mot: chaine
Début
  ch ← ch + " "
  n ← 0
  Tant que ch ≠ "" faire
    p ← Pos(" ", ch)
    mot ← sous_chaine(ch, 0, p)
    t[n] ← mot
    n ← n + 1
    ch ← effacer(ch, 0, p + 1)
  Fin Tant que
Fin

Procédure Crypter(@t: tab, n: entier)
Var i, p: entier
Début
  Pour i de 0 à n-1 Faire
    Si (i+1) mod 2 = 0 Alors
      p ← i+1
    Sinon
      p ← -(i+1)
    Fin Si
    t[i] ← CrypterMot(t[i], p)
  Fin Pour
Fin

Fonction CrypterMot(mot: chaîne, p: entier): chaîne
Var c, ref: caractère
   i: entier
   res: chaîne
Début
  res ← ""
  Pour i de 0 à Long(mot)-1 Faire
    c ← mot[i]
    Si "A" ≤ c ≤ "Z" Alors
      ref ← "A"
    Sinon
      ref ← "a"
    Fin Si
    c ← chr((ord(c) - ord(ref) + p) mod 26 + ord(ref))
    res ← res + c
  Fin Pour
  Retourner res
Fin


Procédure Trier(@t: tab, n: entier)
Var i, j, min: entier
   tmp: chaîne
Début
  // Tri par sélection
  Pour i de 0 à n-2 Faire
    min ← i
    Pour j de i+1 à n-1 Faire
      Si Long(t[j]) < Long(t[min]) Alors
        min ← j
      Fin Si
    Fin Pour
    Si min ≠ i Alors
      tmp ← t[i]
      t[i] ← t[min]
      t[min] ← tmp
    Fin Si
  Fin Pour
Fin

Procédure Afficher(t: tab, n: entier)
Var i: entier
Début
  Pour i de 0 à n-1 Faire
    Ecrire(t[i])
  Fin Pour
Fin

// Programme principal
var t: tab
  n: entier
  ch: chaîne
Début  
  Saisir(ch)
  Découper(t, n, ch)
  Crypter(t, n)
  Trier(t, n)
  Afficher(t, n)
Fin`, fakeInput(['Epreuve Theorique En Informatique']));
    expect(interpreter.globalEnv['ch']).toBe('Epreuve Theorique En Informatique');
    expect(interpreter.globalEnv['t'].slice(0, 4)).toEqual(['Bk', 'Doqdtud', 'Vjgqtkswg', 'Mrjsvqexmuyi']);
  });
});