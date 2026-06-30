/**
 * Tests for output (Ecrire) operations
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Output operations', () => {
  test('Output simple', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    Ecrire("Bonjour")
    Ecrire("Tout")
    Ecrire("le")
    Ecrire("monde")
Fin`);
    result.output.forEach((output, index) => {
      output = output.trim();
      expect(output).toBe(['Bonjour', 'Tout', 'le', 'monde'][index]);
    });
  });

  test('Output with variable', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    x <- 10
    Ecrire(x)
Fin`);
    expect(result.output[0].trim()).toBe('10');
  });

  test('Output with string and variable', async () => {
    const { interpreter, result } = await parseAndRun(`Var x : entier
Début
    x <- 10
    Ecrire("La valeur de x est :", x)
Fin`);
    expect(result.output[0].trim()).toBe('La valeur de x est : 10');
  });

  test('Output with multiple variables', async () => {
    const { interpreter, result } = await parseAndRun(`Var x, y : entier
Début
    x <- 10
    y <- 20
    Ecrire("La valeur de x est :", x, "et la valeur de y est :", y)
Fin`);
    expect(result.output[0].trim()).toBe('La valeur de x est : 10 et la valeur de y est : 20');
  });

  test('Output with expression', async () => {
    const { interpreter, result } = await parseAndRun(`Var x, y : entier
Début
    x <- 10
    y <- 20
    Ecrire("La somme de x et y est :", x + y)
Fin`);
    expect(result.output[0].trim()).toBe('La somme de x et y est : 30');
  });
  
  test('Output with separator', async () => {
    const { interpreter, result } = await parseAndRun(`Var x, y, z : entier
Début
    x <- 10
    y <- 20
    z <- 30
    Ecrire(x, y, z, sep=":")
Fin`);
    expect(result.output[0].trim()).toBe('10:20:30');
  });

  test('Output with end parameter', async () => {
    const { interpreter, result } = await parseAndRun(`Var x, y, z : entier
Début
    x <- 10
    y <- 20
    z <- 30
    Ecrire(x, y, z, fin=";")
Fin`);
    expect(result.output[0]).toBe('10 20 30;');
  });

  test('Output with both separator and end', async () => {
    const { interpreter, result } = await parseAndRun(`Var x, y, z : entier
Début
    x <- 10
    y <- 20
    z <- 30
    Ecrire(x, y, z, sep=":", fin=";")
    Ecrire(x, y, z, fin="/", sep="*")
    Ecrire(x, y, z, sep="", fin="")
    Ecrire("Fin")
Fin`);
    expect(result.output[0]).toBe('10:20:30;');
    expect(result.output[1]).toBe('10*20*30/');
    expect(result.output[2]).toBe('102030');
    expect(result.output[3]).toBe('Fin\n');
  });

  
});