/**
 * Integration tests - comprehensive programs
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Programme Simple 1', async () => {
  test('Arithmetic and operator precedence', async () => {
    const { interpreter, result } = await parseAndRun(`Var A, B, C, D, E : entier
Début
    A ← 5
    B ← (A + 1) * A div 2
    C ← B mod 10
    D ← B div 10
    E ← C * 1100 + D * 11 
    Ecrire(A)
    Ecrire(B)
    Ecrire(C)
    Ecrire(D)
    Ecrire(E)
Fin`);
    expect(result.output[0].trim()).toBe('5');
    expect(result.output[1].trim()).toBe('15');
    expect(result.output[2].trim()).toBe('5');
    expect(result.output[3].trim()).toBe('1');
    expect(result.output[4].trim()).toBe('5511');
    expect(interpreter.globalEnv['a']).toBe(5);
    expect(interpreter.globalEnv['b']).toBe(15);
    expect(interpreter.globalEnv['c']).toBe(5);
    expect(interpreter.globalEnv['d']).toBe(1);
    expect(interpreter.globalEnv['e']).toBe(5511);
  });
});

describe('Programme Simple 2', async () => {
  test('String and built-in functions', async () => {
    const { interpreter, result } = await parseAndRun(`Var a, b, c, d, e, f, g, h, i, j, k, l, m : entier
Début
    a ← "La vie est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre"
    b ← long(a)	
    c ← b mod 16
    d ← pos("ne", a)
    e ← pos("il", a)
    f ← pos("pour", a)
    g ← sous_chaine(a, f, b) + 
        sous_chaine(a, e - 1, f)
    h ← racine(f)
    i ← Long(ConvCh(f)) = 1
    j ← Valeur(ConvCh(c) + ConvCh(d) +
            "." + ConvCh(b + c))
    k ← Arrondi(j * 10)
    l ← Effacer(a, 31, b)
    m ← Effacer(l, 3, 21)
Fin`);
    expect(interpreter.globalEnv['a']).toBe("La vie est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre");
    expect(interpreter.globalEnv['b']).toBe(79);
    expect(interpreter.globalEnv['c']).toBe(15);
    expect(interpreter.globalEnv['d']).toBe(18);
    expect(interpreter.globalEnv['e']).toBe(33);
    expect(interpreter.globalEnv['f']).toBe(49);
    expect(interpreter.globalEnv['g']).toBe("pour ne pas perdre l'équilibre il faut avancer ");
    expect(interpreter.globalEnv['h']).toBe(7.0);
    expect(interpreter.globalEnv['i']).toBe(false);
    expect(interpreter.globalEnv['j']).toBe(1518.94);
    expect(interpreter.globalEnv['k']).toBe(15189);
    expect(interpreter.globalEnv['l']).toBe("La vie est comme une bicyclette");
    expect(interpreter.globalEnv['m']).toBe("La bicyclette");
  });
});

describe('Programme Simple 3', async () => {
  test('Integer vs real division', async () => {
    const { interpreter, result } = await parseAndRun(`Var A, B, C, D, E : entier
Début
    A ← 5
    B ← A + A div 2
    C ← A + A / 2
    D ← B - C
    E ← (B * 3) mod 4
    Ecrire(A)
    Ecrire(B)
    Ecrire(C)
    Ecrire(D)
    Ecrire(E)
Fin`);
    expect(result.output[0].trim()).toBe('5');
    expect(result.output[1].trim()).toBe('7');
    expect(result.output[2].trim()).toBe('7.5');
    expect(result.output[3].trim()).toBe('-0.5');
    expect(result.output[4].trim()).toBe('1');
    expect(interpreter.globalEnv['a']).toBe(5);
    expect(interpreter.globalEnv['b']).toBe(7);
    expect(interpreter.globalEnv['c']).toBe(7.5);
    expect(interpreter.globalEnv['d']).toBe(-0.5);
    expect(interpreter.globalEnv['e']).toBe(1);
  });
});

describe('Programme Simple 4', async () => {
  test('Binary conversion and Gray code', async () => {
    const { interpreter, result } = await parseAndRun(`Var n, n2, r, i : entier
Var cb, cg : chaine
Début
  Répéter
    Ecrire("Donner n ? ")
    Lire(n)
  Jusqu'à 0 <= n <= 63

  n2 ← n
  cb ← ""
  Pour i de 1 à 6 Faire
    r ← n2 mod 2
    cb ← convch(r) + cb
    n2 ← n2 div 2
  Fin Pour

  cg ← cb[0]
  Pour i de 1 à long(cb) - 1 Faire
    cg ← cg + convch(abs(valeur(cb[i]) - valeur(cb[i-1])))
  Fin Pour

  Ecrire(n, "(10) =", cb, "(2)")
  Ecrire(cb, "(2) =", cg, "(gray)")
Fin`, () => '25');
    expect(interpreter.globalEnv['n']).toBe(25);
    expect(interpreter.globalEnv['n2']).toBe(0);
    expect(interpreter.globalEnv['cb']).toBe("011001");
    expect(interpreter.globalEnv['cg']).toBe("010101");
  });
});

describe('Programme Simple 5', async () => {
  test('Array sorting with procedures', async () => {
    function fakePrompt(values) {
      let count = 0;
      return () => {
        return values[count++];
      };
    }
    const { interpreter, result } = await parseAndRun(`type tab = tableau de 20 entier

Procédure Saisir(@n: entier)
Début
  Répéter
    Ecrire("Donner n ? ")
    Lire(n)
  Jusqu'à 5 <= n <= 20
Fin

Procédure Remplir(@t: tab, n:entier)
Var i : entier
Début
  Pour i de 0 à n-1 Faire
    Lire(t[i])
  Fin Pour
Fin

Procédure Trier(@t: tab, n:entier)
Var i, j: entier
Début
  Pour i de 0 à n-2 Faire
    Pour j de i+1 à n-1 Faire
      Si t[i] > t[j] Alors
        Echanger(t[i], t[j])
      Fin Si
    Fin Pour
  Fin Pour
Fin

Procedure Echanger(@a: entier, @b: entier)
Var tmp: entier
Début
  tmp ← a
  a ← b
  b ← tmp
Fin

Var n, s: entier
    t: tab

Début
  Saisir(n)
  Remplir(t, n)
  Trier(t, n)
  Ecrire(n)
Fin`, fakePrompt(['27', '1', '5', '17', '12', '31', '24', '42']));
    expect(interpreter.globalEnv['n']).toBe(5);
    expect(interpreter.globalEnv['t'].slice(0, 5)).toEqual([12, 17, 24, 31, 42]);
  });
});