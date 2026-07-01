/**
 * Tests for optional 'var' keyword in variable declarations
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Optional var keyword', () => {
  test('Variable declaration without var keyword - single variable', async () => {
    const { interpreter, result } = await parseAndRun(`x : entier
Début
  x ← 5
  Ecrire(x)
Fin`);
    expect(interpreter.globalEnv['x']).toBe(5);
    expect(result.output[0].trim()).toBe('5');
  });

  test('Variable declaration without var keyword - multiple variables same type', async () => {
    const { interpreter, result } = await parseAndRun(`x, y : entier
Début
  x ← 10
  y ← 20
  Ecrire(x, y)
Fin`);
    expect(interpreter.globalEnv['x']).toBe(10);
    expect(interpreter.globalEnv['y']).toBe(20);
    expect(result.output[0].trim()).toBe('10 20');
  });

  test('Variable declaration without var keyword - multiple lines', async () => {
    const { interpreter, result } = await parseAndRun(`x : entier
    y : reel
    z : chaine
Début
  x ← 1
  y ← 2.5
  z ← "test"
  Ecrire(x, y, z)
Fin`);
    expect(interpreter.globalEnv['x']).toBe(1);
    expect(interpreter.globalEnv['y']).toBe(2.5);
    expect(interpreter.globalEnv['z']).toBe('test');
    expect(result.output[0].trim()).toBe('1 2.5 test');
  });

  test('Variable declaration without var keyword - boolean', async () => {
    const { interpreter, result } = await parseAndRun(`flag : booleen
Début
  flag ← Vrai
  Ecrire(flag)
Fin`);
    expect(interpreter.globalEnv['flag']).toBe(true);
    expect(result.output[0].trim()).toBe('Vrai');
  });

  test('Mixed declarations with and without var', async () => {
    const { interpreter, result } = await parseAndRun(`Var a : entier
b : reel
Début
  a ← 5
  b ← 3.14
  Ecrire(a, b)
Fin`);
    expect(interpreter.globalEnv['a']).toBe(5);
    expect(interpreter.globalEnv['b']).toBe(3.14);
    expect(result.output[0].trim()).toBe('5 3.14');
  });
});