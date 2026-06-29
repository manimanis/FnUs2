/**
 * Tests for procedures and functions
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Procedures', () => {
  test('Procedure call', async () => {
    const { result } = await parseAndRun(`Procédure afficherBonjour()
Début
    Ecrire("Bonjour")
Fin

Début
    afficherBonjour()
Fin`);
    expect(result.output[0]).toBe('Bonjour');
  });

  test('Procedure with parameters', async () => {
    const { result } = await parseAndRun(`Procédure additionner(a : entier, b : entier)
Début
    Ecrire(a + b)
Fin

Début
    additionner(10, 20)
Fin`);
    expect(result.output[0]).toBe('30');
  });

  test.todo('Procedure with local variables (pass-by-reference @ not fully implemented)');
});

describe('Functions', () => {
  test('Function call', async () => {
    const { result } = await parseAndRun(`Fonction carre(x : entier) : entier
Début
    Retourner x * x
Fin

Début
    Ecrire(carre(5))
Fin`);
    expect(result.output[0]).toBe('25');
  });

  test('Function with local variables', async () => {
    const { result } = await parseAndRun(`Fonction factorielle(n : entier) : entier
Var resultat, i : entier
Début
    resultat ← 1
    Pour i De 2 À n Faire
        resultat ← resultat * i
    Fin Pour
    Retourner resultat
Fin

Début
    Ecrire(factorielle(5))
Fin`);
    expect(result.output[0]).toBe('120');
  });
});

describe('Built-in functions', () => {
  test('chr function', async () => {
    const { result } = await parseAndRun(`Début
    Ecrire(chr(65))
Fin`);
    expect(result.output[0]).toBe('A');
  });

  test('ord function', async () => {
    const { result } = await parseAndRun(`Début
    Ecrire(ord("A"))
Fin`);
    expect(result.output[0]).toBe('65');
  });

  test('Long function', async () => {
    const { result } = await parseAndRun(`Début
    Ecrire(Long("Bonjour"))
Fin`);
    expect(result.output[0]).toBe('7');
  });

  test('Racine function', async () => {
    const { result } = await parseAndRun(`Début
    Ecrire(Racine(16))
Fin`);
    expect(result.output[0]).toBe('4');
  });

  test('Ent function', async () => {
    const { result } = await parseAndRun(`Début
    Ecrire(Ent(3.7))
Fin`);
    expect(result.output[0]).toBe('3');
  });
});