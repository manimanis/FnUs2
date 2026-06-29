/**
 * Web Worker pour l'exécution du pseudo-code.
 * S'exécute indépendamment du thread principal de l'interface.
 */

import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';

let pendingInputResolve = null;
let inputIdCounter = 0;
let interpreter = null;

self.onmessage = async (e) => {
  const { type, code } = e.data;

  if (type === 'run') {
    try {
      const startTime = performance.now();

      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      interpreter = new Interpreter();

      interpreter.setOutputCallback((text) => {
        self.postMessage({ type: 'output', text });
      });

      interpreter.setInputCallback(async (promptText) => {
        const id = ++inputIdCounter;
        self.postMessage({ type: 'input_request', id, prompt: promptText });
        return new Promise((resolve) => {
          pendingInputResolve = { id, resolve };
        });
      });

      const result = await interpreter.run(ast);

      const execTime = Math.round(performance.now() - startTime);
      self.postMessage({ type: 'done', output: result.output, execTime });
    } catch (err) {
      if (err.message === '__STOPPED__') {
        self.postMessage({ type: 'stopped' });
      } else {
        self.postMessage({ type: 'error', text: err.message });
      }
    }
  } else if (type === 'input_response') {
    if (pendingInputResolve && pendingInputResolve.id === e.data.id) {
      const resolve = pendingInputResolve.resolve;
      pendingInputResolve = null;
      resolve(e.data.value);
    }
  } else if (type === 'stop') {
    if (interpreter) {
      interpreter.stop();
    }
  }
};
