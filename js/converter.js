/**
 * Python Converter for the Algorithmic Language
 * Converts AST into Python code.
 */

class PythonConverter {
  constructor() {
    this.code = '';
    this.indentLevel = 0;
    this.imports = new Set();
    this.typeDefs = {};
    this.repeatCounter = 0;
  }

  indent() { return '    '.repeat(this.indentLevel); }

  convert(ast) {
    this.code = '';
    this.indentLevel = 0;
    this.imports = new Set();
    this.typeDefs = {};

    for (const decl of ast.declarations) {
      if (decl.type === 'TypeDecl') this.typeDefs[decl.name] = decl;
    }

    // Check imports
    for (const decl of ast.declarations) this.checkImports(decl);
    this.checkImports = () => { };

    for (const decl of ast.declarations) this.convertDeclaration(decl);

    let imports = '';
    if (this.imports.has('numpy')) imports += 'from numpy import array\n';
    if (this.imports.has('math')) imports += 'from math import sqrt\n';
    if (this.imports.has('random')) imports += 'from random import randint\n';
    if (imports) imports += '\n';
    return imports + this.code;
  }

  checkImports(decl) {
    if (decl.type === 'VarDecl' && this.typeDefs[decl.varType]) this.imports.add('numpy');
    if (['Procedure', 'Function'].includes(decl.type)) this.traverseForImports(decl.body);
    if (decl.type === 'MainProgram') this.traverseForImports(decl.body);
  }

  traverseForImports(stmts) {
    for (const s of stmts || []) {
      if (s.type === 'Call') {
        if (s.name === 'Racine') this.imports.add('math');
        if (s.name === 'Aléa') this.imports.add('random');
      }
      if (['For', 'While', 'Repeat'].includes(s.type)) this.traverseForImports(s.body);
      if (s.type === 'If') {
        this.traverseForImports(s.thenBlock);
        for (const eb of s.elseIfBlocks || []) this.traverseForImports(eb.body);
        if (s.elseBlock) this.traverseForImports(s.elseBlock);
      }
      if (Array.isArray(s.body)) this.traverseForImports(s.body);
    }
  }

  convertDeclaration(decl) {
    switch (decl.type) {
      case 'TypeDecl':
        this.code += this.indent() + `# Type ${decl.name} = tableau de ${decl.arraySize} ${decl.elemType}\n`;
        this.imports.add('numpy');
        break;
      case 'VarDecl': {
        const tm = { 'entier': 'int()', 'réel': 'float()', 'booléen': 'bool()', 'caractère': '" "', 'chaîne': '""' };
        for (const name of decl.names) {
          if (this.typeDefs[decl.varType]) {
            const td = this.typeDefs[decl.varType];
            const pyDef = tm[td.elemType] || '0';
            this.code += this.indent() + `${name} = array([${pyDef}]*${td.arraySize})\n`;
          }
        }
        break;
      }
      case 'Procedure': {
        const params = decl.params.map(p => p.name).join(', ');
        this.code += this.indent() + `def ${decl.name}(${params}):\n`;
        this.indentLevel++;
        this.convertStatements(decl.body);
        this.indentLevel--;
        this.code += '\n';
        break;
      }
      case 'Function': {
        const params = decl.params.map(p => p.name).join(', ');
        this.code += this.indent() + `def ${decl.name}(${params}):\n`;
        this.indentLevel++;
        this.convertStatements(decl.body);
        this.indentLevel--;
        this.code += '\n';
        break;
      }
      case 'MainProgram': {
        this.convertStatements(decl.body);
        break;
      }
    }
  }

  convertStatements(statements) {
    for (const stmt of statements) this.convertStatement(stmt);
  }

  convertStatement(stmt) {
    switch (stmt.type) {
      case 'Assign':
        this.code += this.indent() + `${stmt.target} = ${this.convertExpression(stmt.value)}\n`;
        break;
      case 'ArrayAssign':
        this.code += this.indent() + `${stmt.target}[${this.convertExpression(stmt.index)}] = ${this.convertExpression(stmt.value)}\n`;
        break;
      case 'Write': {
        const parts = stmt.args.map(a => this.convertExpression(a));
        const pyArgs = [];
        if (parts.length > 0) pyArgs.push(parts.join(', '));
        if (stmt.sep !== null && stmt.sep !== undefined) pyArgs.push(`sep="${stmt.sep}"`);
        if (stmt.fin !== null && stmt.fin !== undefined) pyArgs.push(`end="${stmt.fin}"`);
        this.code += this.indent() + `print(${pyArgs.join(', ')})\n`;
        break;
      }
      case 'Read':
        for (const target of stmt.targets) {
          const name = target.type === 'Variable' ? target.name : this.convertExpression(target);
          this.code += this.indent() + `${name} = input()\n`;
        }
        break;
      case 'If': {
        this.code += this.indent() + `if ${this.convertExpression(stmt.condition)}:\n`;
        this.indentLevel++;
        this.convertStatements(stmt.thenBlock);
        this.indentLevel--;
        for (const eb of stmt.elseIfBlocks) {
          this.code += this.indent() + `elif ${this.convertExpression(eb.condition)}:\n`;
          this.indentLevel++;
          this.convertStatements(eb.body);
          this.indentLevel--;
        }
        if (stmt.elseBlock) {
          this.code += this.indent() + `else:\n`;
          this.indentLevel++;
          this.convertStatements(stmt.elseBlock);
          this.indentLevel--;
        }
        break;
      }
      case 'For': {
        const start = this.convertExpression(stmt.start);
        const end = this.convertExpression(stmt.end);
        const step = stmt.step ? this.convertExpression(stmt.step) : null;
        if (step) {
          this.code += this.indent() + `for ${stmt.varName} in range(${start}, ${end}+1, ${step}):\n`;
        } else {
          // Detect descending loop: if start > end, use step -1 and adjust end bound
          const startNum = parseInt(stmt.start.value);
          const endNum = parseInt(stmt.end.value);
          if (!isNaN(startNum) && !isNaN(endNum) && startNum > endNum) {
            this.code += this.indent() + `for ${stmt.varName} in range(${start}, ${end}-1, -1):\n`;
          } else {
            this.code += this.indent() + `for ${stmt.varName} in range(${start}, ${end}+1):\n`;
          }
        }
        this.indentLevel++;
        this.convertStatements(stmt.body);
        this.indentLevel--;
        break;
      }
      case 'While': {
        this.code += this.indent() + `while ${this.convertExpression(stmt.condition)}:\n`;
        this.indentLevel++;
        this.convertStatements(stmt.body);
        this.indentLevel--;
        break;
      }
      case 'Repeat': {
        if (stmt.body.length === 1) {
          this.convertStatements(stmt.body);
          this.code += this.indent() + `while not ${this.convertExpression(stmt.condition)}:\n`;
          this.indentLevel++;
          this.convertStatements(stmt.body);
          this.indentLevel--;
        } else {
          this.repeatCounter++;
          const counterName = `rp_cond_${this.repeatCounter}`;
          this.code += this.indent() + `${counterName} = True\n`;
          this.code += this.indent() + `while ${counterName}:\n`;
          this.indentLevel++;
          this.convertStatements(stmt.body);
          this.code += this.indent() + `if ${this.convertExpression(stmt.condition)}:\n`;
          this.indentLevel++;
          this.code += this.indent() + `${counterName} = False\n`;
          this.indentLevel--;
          this.indentLevel--;
        }
        break;
      }
      case 'Call': {
        const args = stmt.args.map(a => this.convertExpression(a)).join(', ');
        this.code += this.indent() + `${stmt.name}(${args})\n`;
        break;
      }
      case 'Return':
        this.code += this.indent() + `return ${this.convertExpression(stmt.value)}\n`;
        break;
      case 'LocalVarDecl': {
        const tm = { 'entier': 'int()', 'réel': 'float()', 'booléen': 'bool()', 'caractère': '" "', 'chaîne': '""' };
        for (const name of stmt.names) {
          this.code += this.indent() + `${name} = ${tm[stmt.varType] || '0'}\n`;
        }
        break;
      }
      case 'Comment':
        this.code += this.indent() + `# ${stmt.value}\n`;
        break;
    }
  }

  convertExpression(expr) {
    switch (expr.type) {
      case 'Number': return String(expr.value);
      case 'Real': return String(expr.value);
      case 'String': return `"${expr.value}"`;
      case 'Bool': return expr.value ? 'True' : 'False';
      case 'Variable': return expr.name;
      case 'ArrayAccess':
        return `${expr.name}[${this.convertExpression(expr.index)}]`;

      case 'BinaryOp': {
        const left = this.convertExpression(expr.left);
        const right = this.convertExpression(expr.right);
        const opMap = {
          '+': '+', '-': '-', '*': '*', '/': '/',
          'div': '//', 'mod': '%',
          '=': '==', '<': '<', '>': '>', '<=': '<=', '>=': '>=', '≠': '!=', '≥': '>=', '≤': '<=',
          'Et': 'and', 'Ou': 'or', '∈': 'in'
        };
        return `${left} ${opMap[expr.op] || expr.op} ${right}`;
      }

      case 'SetLiteral': {
        const elements = expr.elements.map(el => this.convertExpression(el)).join(', ');
        return `[${elements}]`;
      }

      case 'UnaryOp': {
        const operand = this.convertExpression(expr.operand);
        if (expr.op === '-') return `(-${operand})`;
        if (expr.op === 'Non') return `(not ${operand})`;
        return `(${expr.op} ${operand})`;
      }

      case 'Call': {
        const args = expr.args.map(a => this.convertExpression(a)).join(', ');
        const name = expr.name.toLowerCase();
        if (name === 'racine') { this.imports.add('math'); return `sqrt(${args})`; }
        if (name === 'aléa') { this.imports.add('random'); return `randint(${args})`; }
        if (name === 'sous_chaine') {
          const [s, d, f] = expr.args.map(a => this.convertExpression(a));
          return `(${s}[${d}-1:${f}])`;
        }
        if (name === 'effacer') {
          const [s, d, f] = expr.args.map(a => this.convertExpression(a));
          return `(${s}[:${d}-1]+${s}[${f}:])`;
        }
        if (name === 'pos') {
          const [s1, s2] = expr.args.map(a => this.convertExpression(a));
          return `(${s2}.find(${s1})+1)`;
        }
        if (name === 'convch') return `str(${args})`;
        if (name === 'valeur') return `float(${args})`;
        if (name === 'ent') return `int(${args})`;
        if (name === 'long') return `len(${args})`;
        if (name === 'chr') return `chr(${args})`;
        if (name === 'ord') return `ord(${args})`;
        return `${name}(${args})`;
      }
      default: return `#ERROR:${expr.type}`;
    }
  }
}

export { PythonConverter };