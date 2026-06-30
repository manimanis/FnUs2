/**
 * Tests for arithmetic and logical expressions
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Arithmetic operators', () => {
  test('Addition', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    x ← 5 + 3
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('8');
    expect(interpreter.globalEnv['x']).toBe(8);
  });

  test('Subtraction', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    x ← 10 - 4
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('6');
    expect(interpreter.globalEnv['x']).toBe(6);
  });

  test('Multiplication', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    x ← 6 * 7
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('42');
    expect(interpreter.globalEnv['x']).toBe(42);
  });

  test('Division', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : réel
Début
    x ← 10 / 4
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('2.5');
    expect(interpreter.globalEnv['x']).toBe(2.5);
  });

  test('Integer division (div)', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    x ← 10 div 3
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('3');
    expect(interpreter.globalEnv['x']).toBe(3);
  });

  test('Modulo (mod)', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    x ← 10 mod 3
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('1');
    expect(interpreter.globalEnv['x']).toBe(1);
  });

  test('Unary minus', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    x ← -5
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('-5');
    expect(interpreter.globalEnv['x']).toBe(-5);
  });
});

describe('Comparison operators', () => {
  test('Equality comparison', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : booléen
Début
    x ← 5 = 5
    y ← 5 = 3
    Ecrire(x)
    Ecrire(y)
Fin`);
    expect(result.output[0].trim()).toBe('Vrai');
    expect(result.output[1].trim()).toBe('Faux');
    expect(interpreter.globalEnv['x']).toBe(true);
    expect(interpreter.globalEnv['y']).toBe(false);
  });

  test('Inequality comparison', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : booléen
Début
    x ← 5 ≠ 3
    y ← 5 ≠ 5
    Ecrire(x)
    Ecrire(y)
Fin`);
    expect(result.output[0].trim()).toBe('Vrai');
    expect(result.output[1].trim()).toBe('Faux');
    expect(interpreter.globalEnv['x']).toBe(true);
    expect(interpreter.globalEnv['y']).toBe(false);
  });

  test('Less than comparison', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : booléen
Début
    x ← 3 < 5
    y ← 5 < 3
    Ecrire(x)
    Ecrire(y)
Fin`);
    expect(result.output[0].trim()).toBe('Vrai');
    expect(result.output[1].trim()).toBe('Faux');
    expect(interpreter.globalEnv['x']).toBe(true);
    expect(interpreter.globalEnv['y']).toBe(false);
  });

  test('Greater than comparison', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : booléen
Début
    x ← 7 > 5
    y ← 7 > 15
    Ecrire(x)
    Ecrire(y)
Fin`);
    expect(result.output[0].trim()).toBe('Vrai');
    expect(result.output[1].trim()).toBe('Faux');
    expect(interpreter.globalEnv['x']).toBe(true);
    expect(interpreter.globalEnv['y']).toBe(false);
  });

  test('Appartenance avec ∈', async () => {
    const { result } = await parseAndRun(`Var n, s: entier
Début
  n ← 3
  Si n ∈ {1, 3, 5} Alors
    s ← 5
  Sinon
    s ← 10
  Fin Si
  Ecrire(s)
Fin`);
    expect(result.output[0].trim()).toBe('5');
  });
});

describe('Logical operators', () => {
  test('Logical AND (Et)', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : booléen
Début
    a ← Vrai Et Vrai
    b ← Vrai Et Faux
    c ← Faux Et Vrai
    d ← Faux Et Faux
    Ecrire(a)
    Ecrire(b)
    Ecrire(c)
    Ecrire(d)
Fin`);
    expect(result.output[0].trim()).toBe('Vrai');
    expect(result.output[1].trim()).toBe('Faux');
    expect(result.output[2].trim()).toBe('Faux');
    expect(result.output[3].trim()).toBe('Faux');
    expect(interpreter.globalEnv['a']).toBe(true);
    expect(interpreter.globalEnv['b']).toBe(false);
    expect(interpreter.globalEnv['c']).toBe(false);
    expect(interpreter.globalEnv['d']).toBe(false);
  });

  test('Logical OR (Ou)', async () => {
    const { interpreter, result } = await parseAndRun(`Var a, b, c, d : booléen
Début
    a ← Faux Ou Vrai
    b ← Faux Ou Faux
    c ← Vrai Ou Faux
    d ← Vrai Ou Vrai
    Ecrire(a)
    Ecrire(b)
    Ecrire(c)
    Ecrire(d)
Fin`);
    expect(result.output[0].trim()).toBe('Vrai');
    expect(result.output[1].trim()).toBe('Faux');
    expect(result.output[2].trim()).toBe('Vrai');
    expect(result.output[3].trim()).toBe('Vrai');
    expect(interpreter.globalEnv['a']).toBe(true);
    expect(interpreter.globalEnv['b']).toBe(false);
    expect(interpreter.globalEnv['c']).toBe(true);
    expect(interpreter.globalEnv['d']).toBe(true);
  });

  test('Logical NOT (Non)', async () => {
    const { interpreter, result } = await parseAndRun(`Var a, b : booléen
Début
    a ← Non Vrai
    b ← Non Faux
    Ecrire(a)
    Ecrire(b)
Fin`);
    expect(result.output[0].trim()).toBe('Faux');
    expect(result.output[1].trim()).toBe('Vrai');
    expect(interpreter.globalEnv['a']).toBe(false);
    expect(interpreter.globalEnv['b']).toBe(true);
  });
});