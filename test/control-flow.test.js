/**
 * Tests for control flow statements
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('If statements', () => {
  test('If statement - true condition', async () => {
    const { interpreter, result } = await parseAndRun(`Var x, ax : entier
Début
    x ← -5
    ax ← x
    Si x < 0 Alors
        ax ← -x
    Fin Si
    Ecrire(ax)
Fin`);
    expect(result.output[0]).toBe('5');
    expect(interpreter.globalEnv['ax']).toBe(5);
  });

  test('If statement - false condition', async () => {
    const { interpreter, result } = await parseAndRun(`Var x, ax : entier
Début
    x ← 10
    ax ← x
    Si x < 0 Alors
        ax ← -x
    Fin Si
    Ecrire(ax)
Fin`);
    expect(result.output[0]).toBe('10');
    expect(interpreter.globalEnv['ax']).toBe(10);
  });

  test('If-else statement', async () => {
    const { interpreter, result } = await parseAndRun(`Var a, b, m : entier
Début
    a ← 3
    b ← 5
    Si a > b Alors
        m ← a
    Sinon
        m ← b
    Fin Si
    Ecrire(m)
Fin`);
    expect(result.output[0]).toBe('5');
    expect(interpreter.globalEnv['m']).toBe(5);
  });
});

describe('For loops', () => {
  test('For loop - ascending', async () => {
    const { interpreter, result } = await parseAndRun(`Var i, somme : entier
Début
    somme ← 0
    Pour i De 1 À 5 Faire
        somme ← somme + i
    Fin Pour
    Ecrire(somme)
Fin`);
    expect(result.output[0]).toBe('15');
    expect(interpreter.globalEnv['somme']).toBe(15);
  });

  test('For loop - descending', async () => {
    const { interpreter, result } = await parseAndRun(`Var i, somme : entier
Début
    somme ← 0
    Pour i De 5 À 1 Faire
        somme ← somme + i
    Fin Pour
    Ecrire(somme)
Fin`);
    expect(result.output[0]).toBe('0');
    expect(interpreter.globalEnv['somme']).toBe(0);
  });

  test('For loop - with step', async () => {
    const { interpreter, result } = await parseAndRun(`Var i, somme : entier
Début
    somme ← 0
    Pour i De 1 À 10 Pas 2 Faire
        somme ← somme + i
    Fin Pour
    Ecrire(somme)
Fin`);
    expect(result.output[0]).toBe('25');
    expect(interpreter.globalEnv['somme']).toBe(25);
  });

  test('For loop - with negative step', async () => {
    const { interpreter, result } = await parseAndRun(`Var i, somme : entier
Début
    somme ← 0
    Pour i De 10 À 1 Pas -2 Faire
        somme ← somme + i
    Fin Pour
    Ecrire(somme)
Fin`);
    expect(result.output[0]).toBe('30');
    expect(interpreter.globalEnv['somme']).toBe(30);
  });
});

describe('While loops', () => {
  test('While loop', async () => {
    const { interpreter, result } = await parseAndRun(`Var i, somme : entier
Début
    i ← 1
    somme ← 0
    Tant Que i <= 5 Faire
        somme ← somme + i
        i ← i + 1
    Fin Tant Que
    Ecrire(somme)
Fin`);
    expect(result.output[0]).toBe('15');
    expect(interpreter.globalEnv['somme']).toBe(15);
  });
});

describe('Repeat loops', () => {
  test('Repeat loop', async () => {
    const { interpreter, result } = await parseAndRun(`Var i, somme : entier
Début
    i ← 0
    somme ← 0
    Répéter
        i ← i + 1
        somme ← somme + i
    Jusqu'à i = 5
    Ecrire(somme)
Fin`);
    expect(result.output[0]).toBe('15');
    expect(interpreter.globalEnv['somme']).toBe(15);
  });
});