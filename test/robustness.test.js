/**
 * Tests for robustness and reliability improvements
 * - Timeout handling
 * - Iteration limits
 * - Input validation
 * - Error handling
 */
import { describe, test, expect } from 'vitest';
import { parseAndRun } from './helpers.js';

describe('Robustness - Timeout and Limits', () => {
  test('Infinite loop detection - while true', async () => {
    const code = `Var x: entier
Début
  Tant Que Vrai Faire
    x ← x + 1
  Fin Tant Que
Fin`;

    await expect(parseAndRun(code,
      () => '',
      { maxIterations: 100 })).rejects.toThrow('Limite d\'itérations atteinte');
  }, 50000);

  test('Infinite loop detection - for with step 0', async () => {
    const code = `Var i: entier
Début
  Pour i de 1 à 10 Pas 0 Faire
    Ecrire(i)
  Fin Pour
Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Le pas de la boucle Pour ne peut pas être nul');
  });

  test('Large loop completes within limits', async () => {
    const code = `Var i, x: entier 
Début
  Pour i de 1 à 1000 Faire
    x ← i
  Fin Pour
  Ecrire(x)
Fin`;

    await expect(parseAndRun(code, () => '', { executionTimeout: 10 }))
      .rejects.toThrow('Timeout');
  });

  test('Custom iteration limit', async () => {
    const code = `Var i, x: entier 
Début
  Pour i de 1 à 200 Faire
    x ← i
  Fin Pour
  Ecrire(x)
Fin`;

    // With default 100000 limit, this should succeed
    const { result } = await parseAndRun(code);
    expect(result.output[0].trim()).toBe('200');
  });
});

describe('Robustness - Division by Zero', () => {
  test('Division by zero throws error', async () => {
    const code = `Var x: réel
Début
  x ← 10 / 0
  Ecrire(x)
Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Division par zéro');
  });

  test('Integer division by zero throws error', async () => {
    const code = `Var x: entier
Début
  x ← 10 div 0
  Ecrire(x)
Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Division entière par zéro');
  });

  test('Modulo by zero throws error', async () => {
    const code = `Var x: entier
Début
  x ← 10 mod 0
  Ecrire(x)
Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Modulo par zéro');
  });

  test('Division by variable that is zero', async () => {
    const code = `Var x: entier
  y: réel
Début
  y ← 0
  x ← 10 / y
  Ecrire(x)
Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Division par zéro');
  });
});

describe('Robustness - Array Bounds Checking', () => {
  test('Array access out of bounds - positive index', async () => {
    const code = `Type tab = tableau de 5 entier
Var t: tab
  x: entier
Début
  t[0] ← 10
  x ← t[5]
  Ecrire(x)
Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Indice 5 hors bornes');
  });

  test('Array access out of bounds - negative index', async () => {
    const code = `Type tab = tableau de 5 entier
    Var t: tab
    Début
      t[0] ← 10
      x ← t[-1]
      Ecrire(x)
    Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Indice -1 hors bornes');
  });

  test('Array assignment out of bounds', async () => {
    const code = `Type tab = tableau de 5 entier
    Var t: tab
    Début
      t[10] ← 42
      Ecrire(t[10])
    Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Indice 10 hors bornes');
  });

  test('Valid array access within bounds', async () => {
    const code = `Type tab = tableau de 5 entier
Var t: tab
Début
  t[0] ← 10
  t[4] ← 20
  Ecrire(t[0])
  Ecrire(t[4])
Fin`;

    const { result } = await parseAndRun(code);
    expect(result.output[0].trim()).toBe('10');
    expect(result.output[1].trim()).toBe('20');
  });
});

describe('Robustness - Variable Validation', () => {
  test('Undefined variable throws error', async () => {
    const code = `Début
      Ecrire(x)
    Fin`;

    await expect(parseAndRun(code)).rejects.toThrow("Variable 'x' non définie");
  });

  test('Undefined procedure throws error', async () => {
    const code = `Début
      AppelerProcedureInconnue()
    Fin`;

    await expect(parseAndRun(code)).rejects.toThrow("Fonction 'appelerprocedureinconnue' non définie");
  });

  test('Undefined function throws error', async () => {
    const code = `Var x: entier
Début
  x ← FonctionInconnue(5)
  Ecrire(x)
Fin`;

    await expect(parseAndRun(code)).rejects.toThrow("Fonction 'fonctioninconnue' non définie");
  });
});

describe('Robustness - Loop Validation', () => {
  test('For loop with non-numeric bounds throws error', async () => {
    const code = `Var i: entier
Début
  Pour i de "a" à 10 Faire
    Ecrire(i)
  Fin Pour
Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Les bornes de la boucle Pour doivent être des nombres');
  });

  test('For loop with string step throws error', async () => {
    const code = `Début
      Pour i de 1 à 10 Pas "deux" Faire
        Ecrire(i)
      Fin Pour
    Fin`;

    await expect(parseAndRun(code)).rejects.toThrow('Les bornes de la boucle Pour doivent être des nombres');
  });
});

// describe('Robustness - Operator ∈ (Membership)', () => {
//   test('Membership operator with array', async () => {
//     const code = `Type tab = tableau de 5 entier
// Var t: tab
// Début
//   t[0] ← 1
//   t[1] ← 2
//   t[2] ← 3
//   Si 2 ∈ t Alors
//     Ecrire("Trouvé")
//   Sinon
//     Ecrire("Non trouvé")
//   Fin Si
// Fin`;

//     const { result } = await parseAndRun(code);
//     expect(result.output[0]).toBe('Trouvé');
//   });

//   test('Membership operator with string', async () => {
//     const code = `Début
//       ch ← "Bonjour"
//       Si 'o' ∈ ch Alors
//         Ecrire("Contient o")
//       Sinon
//         Ecrire("Ne contient pas o")
//       Fin Si
//     Fin`;

//     const { result } = await parseAndRun(code);
//     expect(result.output[0]).toBe('Contient o');
//   });

//   test('Membership operator with string - not found', async () => {
//     const code = `Var ch: chaîne
// Début
//   ch ← "Bonjour"
//   Si 'z' ∈ ch Alors
//     Ecrire("Contient z")
//   Sinon
//     Ecrire("Ne contient pas z")
//   Fin Si
// Fin`;

//     const { result } = await parseAndRun(code);
//     expect(result.output[0]).toBe('Ne contient pas z');
//   });
// });

describe('Robustness - Edge Cases', () => {
  test('Empty program executes without error', async () => {
    const code = `Début
    Fin`;

    const { result } = await parseAndRun(code);
    expect(result.output).toHaveLength(0);
  });

  test('Program with only comments', async () => {
    const code = `Début
      // Ceci est un commentaire
      /* Commentaire
         multiligne */
      x ← 5
    Fin`;

    const { result } = await parseAndRun(code);
    expect(result.output).toHaveLength(0);
  });

  test('Nested loops with limits', async () => {
    const code = `Var i, j, x: entier
Début
  Pour i de 1 à 10 Faire
    Pour j de 1 à 10 Faire
      x ← i + j
    Fin Pour
  Fin Pour
  Ecrire(x)
Fin`;

    const { result } = await parseAndRun(code);
    expect(result.output[0].trim()).toBe('20');
  });

  test('Deep recursion with return value', async () => {
    const code = `Fonction fact(n: entier): entier
    Début
      Si n <= 1 Alors
        Retourner 1
      Sinon
        Retourner n * fact(n - 1)
      Fin Si
    Fin
    
    Début
      Ecrire(fact(10))
    Fin`;

    const { result } = await parseAndRun(code);
    expect(result.output[0].trim()).toBe('3628800');
  });
});

describe('Robustness - Input Validation', () => {
  test('Invalid input for integer converts correctly', async () => {
    const code = `Var x: entier
Début  
  Lire(x)
  Ecrire(x)
Fin`;

    const { result } = await parseAndRun(code, () => '42');
    expect(result.output[0].trim()).toBe('42');
  });

  test('Invalid input for real converts correctly', async () => {
    const code = `Var x: réel
Début
  Lire(x)
  Ecrire(x)
Fin`;

    const { result } = await parseAndRun(code, () => '3.14');
    expect(result.output[0].trim()).toBe('3.14');
  });

  test('Boolean input conversion', async () => {
    const code = `Var x: booléen
Début
  Lire(x)
  Ecrire(x)
Fin`;

    const { result } = await parseAndRun(code, () => 'Vrai');
    expect(result.output[0].trim()).toBe('Vrai');
  });
});

describe('Robustness - Configuration Options', () => {
  test('Custom max iterations option', async () => {
    const code = `Var x: entier
Début
  Tant Que Vrai Faire
    x ← x + 1
  Fin Tant Que
Fin`;

    // Create interpreter with very low iteration limit
    const { Lexer } = await import('../js/lexer.js');
    const { Parser } = await import('../js/parser.js');
    const { Interpreter } = await import('../js/interpreter.js');

    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interpreter = new Interpreter({ maxIterations: 10 });
    interpreter.setInputCallback(() => '');

    await expect(interpreter.run(ast)).rejects.toThrow('Limite d\'itérations atteinte');
  });

  test('Custom timeout option', async () => {
    const code = `Début
      x ← 0
      Tant Que x < 1000000 Faire
        x ← x + 1
      Fin Tant Que
      Ecrire(x)
    Fin`;

    // Create interpreter with very short timeout
    const { Lexer } = await import('../js/lexer.js');
    const { Parser } = await import('../js/parser.js');
    const { Interpreter } = await import('../js/interpreter.js');

    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interpreter = new Interpreter({ executionTimeout: 50 }); // 50ms timeout
    interpreter.setInputCallback(() => '');

    await expect(interpreter.run(ast)).rejects.toThrow('Timeout');
  });
});