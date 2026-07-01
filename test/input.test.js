/**
 * Tests for input (Lire) operations
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Input operations', () => {
  test('Input with prompt', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    Lire(x)
    Ecrire(x)
Fin`, () => '42');
    expect(result.output[0].trim()).toBe('42');
    expect(interpreter.globalEnv['x']).toBe(42);
  });

  test('Input multiple values', async () => {
    function fakePrompt() {
      let count = 0;
      return () => {
        count += 10;
        return count.toString();
      };
    }

    const { interpreter, result } = await parseAndRun(`Var x, y, z : entier
Début
    Lire(x)
    Lire(y)
    z ← x + y
    Ecrire(x, y, z)
Fin`, fakePrompt());
    expect(result.output[result.output.length - 1].trim()).toBe('10 20 30');
    expect(interpreter.globalEnv['x']).toBe(10);
    expect(interpreter.globalEnv['y']).toBe(20);
    expect(interpreter.globalEnv['z']).toBe(30);
  });

  test('Input with array access', async () => {
    function fakePrompt() {
      let count = 0;
      const values = ['18', '12', '23', '94', '35'];
      return () => {
        return values[count++];
      };
    }
    
    const { interpreter, result } = await parseAndRun(`Type tab = tableau de 5 entier
Var t : tab
    i : entier
Début
    Pour i de 0 à 4 faire
        Lire(t[i])
    Fin Pour
Fin`, fakePrompt());
    expect(interpreter.globalEnv['t'][0]).toBe(18);
    expect(interpreter.globalEnv['t'][1]).toBe(12);
    expect(interpreter.globalEnv['t'][2]).toBe(23);
    expect(interpreter.globalEnv['t'][3]).toBe(94);
    expect(interpreter.globalEnv['t'][4]).toBe(35);
  });

  test('Input with array access and procedure call', async () => {
    function fakePrompt() {
      let count = 0;
      const values = ['18', '12', '18', '12', '23', '12', '94', '35'];
      return () => {
        return values[count++];
      };
    }
    
    const { interpreter, result } = await parseAndRun(`Type tab = tableau de 5 entier

Procédure Remplir(@t: tab)
Var i : entier
Début
  Pour i de 0 à 4 faire
    Répéter
      Lire(t[i])
    Jusqu'à Recherche(t[i], t, i) = -1
  Fin Pour
Fin

Fonction Recherche(x: entier, t: tab, n: entier): entier
Var i : entier
Début
  Pour i de 0 à n-1 faire
    Si t[i] = x alors
      Retourner i
    Fin Si
  Fin Pour
  Retourner -1
Fin

Var t : tab
    i : entier
Début
  Remplir(t)
Fin`, fakePrompt());
    expect(interpreter.globalEnv['t'][0]).toBe(18);
    expect(interpreter.globalEnv['t'][1]).toBe(12);
    expect(interpreter.globalEnv['t'][2]).toBe(23);
    expect(interpreter.globalEnv['t'][3]).toBe(94);
    expect(interpreter.globalEnv['t'][4]).toBe(35);
  });
});