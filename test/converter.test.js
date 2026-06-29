/**
 * Tests for the Python converter
 */
import { describe, test, expect } from 'vitest';
import { Lexer } from '../js/lexer.js';
import { Parser } from '../js/parser.js';
import { PythonConverter } from '../js/converter.js';

describe('Python Converter', () => {
  test('Converter repeat assignment uses target names', async () => {
    const code = `Var i, somme : entier
Début
    i ← 0
    somme ← 0
    Répéter
        i ← i + 1
        somme ← somme + i
    Jusqu'à i = 5
    Ecrire(somme)
Fin`;
    const tokens = new Lexer(code).tokenize();
    const ast = new Parser(tokens).parse();
    const py = new PythonConverter().convert(ast);
    expect(py).toContain('i = 0');
    expect(py).toContain('somme = 0');
    expect(py).toContain('i = i + 1');
    expect(py).toContain('somme = somme + i');
    expect(py).not.toMatch(/undefined = /);
  });
});