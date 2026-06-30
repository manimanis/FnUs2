/**
 * Tests for basic interpreter functionality
 */
import { describe, test, expect } from 'vitest';
import { Interpreter } from '../js/interpreter.js';
import { parseAndRun } from './helpers.js';

describe('Interpreter basics', () => {
  test('Interpreter initialization', async () => {
    const interpreter = new Interpreter();
    expect(interpreter.output).toHaveLength(0);
    expect(Object.keys(interpreter.globalEnv)).toHaveLength(0);
  });

  test('Empty program execution', async () => {
    const { result } = await parseAndRun('Début Fin');
    expect(result.output).toHaveLength(0);
  });

  test('Variable declaration - integer', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
  x ← 5
  Ecrire(x)
Fin`);
    expect(interpreter.globalEnv['x']).toBe(5);
    expect(result.output[0].trim()).toBe('5');
  });

  test('Variable declaration - real', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : réel
Début
    x ← 3.14
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('3.14');
    expect(interpreter.globalEnv['x']).toBe(3.14);
  });

  test('Variable declaration - boolean', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : booléen
Début
    x ← Vrai
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('Vrai');
    expect(interpreter.globalEnv['x']).toBe(true);
  });

  test('Variable declaration - string', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : chaîne
Début
    x ← "Bonjour"
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('Bonjour');
    expect(interpreter.globalEnv['x']).toBe('Bonjour');
  });

  test('Multiple writes', async () => {
    const { result } = await parseAndRun(`Début
    Ecrire("Hello")
    Ecrire("World")
Fin`);
    expect(result.output[0].trim()).toBe('Hello');
    expect(result.output[1].trim()).toBe('World');
  });

  test('Write with mixed types', async () => {
    const { result } = await parseAndRun(`Début
    Ecrire("Value:", 42, "is the answer")
Fin`);
    expect(result.output[0].trim()).toBe('Value: 42 is the answer');
  });

  test('Single-line comment //', async () => {
    const { result } = await parseAndRun(`Début
    // ceci est un commentaire
    Ecrire("OK")
Fin`);
    expect(result.output[0].trim()).toBe('OK');
  });

  test('Multi-line comment /* */', async () => {
    const { result } = await parseAndRun(`Début
    /* ceci est un
       commentaire multiligne */
    Ecrire("OK")
Fin`);
    expect(result.output[0].trim()).toBe('OK');
  });

  test('Var declaration with continuation lines', async () => {
    const { interpreter, result } = await parseAndRun(`Type tab = tableau de 20 entier
Var n, s: entier
    t: tab
Début
    n ← 1
    s ← 2
    t[1] ← 10
    Ecrire(n, s, t[1])
Fin`);
    expect(interpreter.globalEnv['n']).toBe(1);
    expect(interpreter.globalEnv['s']).toBe(2);
    expect(interpreter.globalEnv['t'][1]).toBe(10);
    expect(result.output[0].trim()).toBe('1 2 10');
  });
});