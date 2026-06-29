/**
 * Tests for array operations
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Array declarations', () => {
  test('Array type declaration', async () => {
    const { result } = await parseAndRun(`Type TableauEntiers = tableau de 5 entier
Var t : TableauEntiers
Début
    Ecrire("OK")
Fin`);
    expect(result.output[0]).toBe('OK');
  });

  test('Array type declaration with short name', async () => {
    const { result } = await parseAndRun(`Type tab = tableau de 20 entier
Var t : tab
Début
    Ecrire("OK")
Fin`);
    expect(result.output[0]).toBe('OK');
  });

  test('Array access and assignment', async () => {
    const { interpreter, result } = await parseAndRun(`Type TableauEntiers = tableau de 5 entier
Var t : TableauEntiers
Début
    t[1] ← 10
    t[2] ← 20
    Ecrire(t[1], t[2])
Fin`);
    expect(result.output[0]).toBe('10 20');
    expect(interpreter.globalEnv['t'][1]).toBe(10);
    expect(interpreter.globalEnv['t'][2]).toBe(20);
  });

  test('Array default values', async () => {
    const { interpreter, result } = await parseAndRun(`Type TableauEntiers = tableau de 3 entier
Var t : TableauEntiers
Début
    Ecrire(t[1])
Fin`);
    expect(result.output[0]).toBe('0');
    expect(interpreter.globalEnv['t'][1]).toBe(0);
  });
});