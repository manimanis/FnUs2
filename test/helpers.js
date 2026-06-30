/**
 * Shared helpers for interpreter tests
 */
import { Lexer } from '../js/lexer.js';
import { Parser } from '../js/parser.js';
import { Interpreter } from '../js/interpreter.js';

export async function parseAndRun(code, inputCallBack = () => '', options={}) {
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const interpreter = new Interpreter(options);
  interpreter.setInputCallback(() => inputCallBack());
  const result = await interpreter.run(ast, options);
  return { interpreter, result };
}