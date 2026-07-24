import { describe, it, expect } from 'vitest';
import { parseAndRun } from './helpers.js';
import { Lexer } from '../js/lexer.js';
import { Parser } from '../js/parser.js';
import { PythonConverter } from '../js/converter.js';

describe('graine instruction', () => {
  it('should produce identical random numbers when seeded with same value', async () => {
    const code1 = `
Début
  graine(1234)
  Ecrire(aléa(1, 100))
  Ecrire(aléa(1, 100))
Fin
`;
    const code2 = `
Début
  graine(1234)
  Ecrire(aléa(1, 100))
  Ecrire(aléa(1, 100))
Fin
`;

    const { result: res1 } = await parseAndRun(code1);
    const { result: res2 } = await parseAndRun(code2);

    expect(res1.output).toEqual(res2.output);
  });

  it('should convert graine to seed in Python converter', () => {
    const code = `
Début
  graine(42)
  x ← aléa(1, 10)
Fin
`;
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const converter = new PythonConverter();
    const pythonCode = converter.convert(ast);

    expect(pythonCode).toContain('from random import randint, seed');
    expect(pythonCode).toContain('seed(42)');
    expect(pythonCode).toContain('randint(1, 10)');
  });
});
