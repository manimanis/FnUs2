/**
 * Interpreter for the Algorithmic Language
 * Executes the AST directly.
 */

class Interpreter {
  constructor() {
    this.globalEnv = {};
    this.functions = {};
    this.procedures = {};
    this.typeDefs = {};
    this.output = [];
    this.inputBuffer = [];
    this.waitingForInput = false;
    this.inputCallback = null;
    this.outputCallback = null;
    this._returnValue = { set: false, value: null };
  }

  setOutputCallback(cb) { this.outputCallback = cb; }
  setInputCallback(cb) { this.inputCallback = cb; }

  addOutput(text) {
    this.output.push(text);
    if (this.outputCallback) this.outputCallback(text);
  }

  requestInput(promptText) {
    if (this.inputCallback) return this.inputCallback(promptText);
    return '';
  }

  getDefaultValue(type) {
    switch (type) {
      case 'entier': return 0;
      case 'réel': return 0.0;
      case 'booléen': return false;
      case 'caractère': return '';
      case 'chaîne': return '';
      default:
        // Check if it's a user-defined array type
        const td = this.typeDefs[type];
        if (td) {
          const arr = new Array(td.arraySize);
          const defaultVal = this.getDefaultValue(td.elemType);
          for (let i = 0; i < td.arraySize; i++) arr[i] = defaultVal;
          return arr;
        }
        return null;
    }
  }

  getVars() {
    return this.globalEnv;
  }

  async run(ast) {
    this.output = [];
    this.globalEnv = {};
    this.functions = {};
    this.procedures = {};
    this.typeDefs = {};
    this._returnValue = { set: false, value: null };

    let mainBody = null;

    // First pass: collect declarations
    for (const decl of ast.declarations) {
      if (decl.type === 'TypeDecl') this.typeDefs[decl.name] = decl;
      else if (decl.type === 'Procedure') this.procedures[decl.name.toLowerCase()] = decl;
      else if (decl.type === 'Function') this.functions[decl.name.toLowerCase()] = decl;
      else if (decl.type === 'VarDecl') {
        for (const name of decl.names) {
          this.globalEnv[name] = this.getDefaultValue(decl.varType);
        }
      } else if (decl.type === 'MainProgram') {
        mainBody = decl.body;
      }
    }

    // Execute main program block if it exists
    if (mainBody) {
      await this.executeBlock(mainBody, this.globalEnv);
      return { output: this.output };
    }

    // Find and execute main procedure
    if (this.procedures['main']) { await this.executeProcedure('main', [], this.globalEnv); return { output: this.output }; }
    if (this.procedures['principal']) { await this.executeProcedure('principal', [], this.globalEnv); return { output: this.output }; }

    return { output: this.output };
  }

  _findEnvWithOwnProperty(env, name) {
    let current = env;
    while (current) {
      if (Object.prototype.hasOwnProperty.call(current, name)) {
        return current;
      }
      current = Object.getPrototypeOf(current);
    }
    return null;
  }

  async executeProcedure(name, argExprs, callerEnv = this.globalEnv) {
    const proc = this.procedures[name.toLowerCase()];
    if (!proc) throw new Error(`Procédure '${name}' non définie`);
    const localEnv = Object.create(callerEnv);
    for (let i = 0; i < proc.params.length; i++) {
      const p = proc.params[i];
      if (p.byRef && i < argExprs.length) {
        const arg = argExprs[i];
        if (arg.type === 'Variable') {
          let targetEnv = this._findEnvWithOwnProperty(callerEnv, arg.name) || this.globalEnv;
          Object.defineProperty(localEnv, p.name, {
            get: () => targetEnv[arg.name],
            set: (v) => { targetEnv[arg.name] = v; },
            configurable: true,
            enumerable: true
          });
          continue;
        }
        if (arg.type === 'ArrayAccess') {
          const arr = await this.evaluateExpression({ type: 'Variable', name: arg.name }, callerEnv);
          const idx = await this.evaluateExpression(arg.index, callerEnv);
          Object.defineProperty(localEnv, p.name, {
            get: () => arr[idx],
            set: (v) => { arr[idx] = v; },
            configurable: true,
            enumerable: true
          });
          continue;
        }
      }
      localEnv[p.name] = i < argExprs.length
        ? await this.evaluateExpression(argExprs[i], callerEnv)
        : this.getDefaultValue(p.paramType);
    }
    await this.executeBlock(proc.body, localEnv);
  }

  async executeFunction(name, argExprs, callerEnv = this.globalEnv) {
    const func = this.functions[name.toLowerCase()];
    if (!func) throw new Error(`Fonction '${name}' non définie`);
    const localEnv = Object.create(callerEnv);
    for (let i = 0; i < func.params.length; i++) {
      const p = func.params[i];
      localEnv[p.name] = i < argExprs.length
        ? await this.evaluateExpression(argExprs[i], callerEnv)
        : this.getDefaultValue(p.paramType);
    }
    let returnValue = this.getDefaultValue(func.returnType);
    const oldRet = this._returnValue;
    this._returnValue = { set: false, value: null };
    await this.executeBlock(func.body, localEnv);
    if (this._returnValue.set) returnValue = this._returnValue.value;
    this._returnValue = oldRet;
    return returnValue;
  }

  async executeBlock(statements, env) {
    for (const stmt of statements) {
      await this.executeStatement(stmt, env);
      if (this._returnValue && this._returnValue.set) return;
    }
  }

  async executeStatement(stmt, env) {
    if (this._returnValue && this._returnValue.set) return;

    switch (stmt.type) {
      case 'Assign':
        env[stmt.target] = await this.evaluateExpression(stmt.value, env);
        break;
      case 'ArrayAssign': {
        const arr = env[stmt.target];
        const idx = await this.evaluateExpression(stmt.index, env);
        if (!Array.isArray(arr)) throw new Error(`${stmt.target} n'est pas un tableau`);
        arr[idx] = await this.evaluateExpression(stmt.value, env);
        break;
      }
      case 'Write': {
        const parts = [];
        for (const a of stmt.args) {
          const v = await this.evaluateExpression(a, env);
          if (typeof v === 'boolean') parts.push(v ? 'Vrai' : 'Faux');
          else parts.push(v === null || v === undefined ? '' : String(v));
        }
        this.addOutput(parts.join(' '));
        break;
      }
      case 'Read':
        for (const target of stmt.targets) {
          let inputStr;
          if (this.inputBuffer.length > 0) {
            inputStr = this.inputBuffer.shift();
          } else {
            inputStr = await this.requestInput('Saisir une valeur :');
            if (inputStr === null || inputStr === undefined) inputStr = '';
          }
          if (target.type === 'Variable') {
            env[target.name] = this.convertInput(inputStr, env[target.name]);
          } else if (target.type === 'ArrayAccess') {
            const arr = env[target.name];
            if (!Array.isArray(arr)) throw new Error(`${target.name} n'est pas un tableau`);
            const idx = await this.evaluateExpression(target.index, env);
            arr[idx] = this.convertInput(inputStr, arr[idx]);
          }
        }
        break;
      case 'If': await this.executeIf(stmt, env); break;
      case 'For': await this.executeFor(stmt, env); break;
      case 'While': await this.executeWhile(stmt, env); break;
      case 'Repeat': await this.executeRepeat(stmt, env); break;
      case 'Call': await this.executeCallStmt(stmt, env); break;
      case 'Return':
        this._returnValue = { set: true, value: await this.evaluateExpression(stmt.value, env) };
        break;
      case 'LocalVarDecl':
        for (const name of stmt.names) {
          env[name] = this.getDefaultValue(stmt.varType);
        }
        break;
      case 'Comment': break;
      default: throw new Error(`Instruction inconnue: ${stmt.type}`);
    }
  }

  async executeCallStmt(stmt, env) {
    const args = stmt.args;
    const nameLower = stmt.name.toLowerCase();
    if (this.procedures[nameLower]) {
      await this.executeProcedure(nameLower, args, env);
    } else if (this.functions[nameLower]) {
      await this.executeFunction(nameLower, args, env);
    } else {
      // Evaluate as expression to handle built-in functions
      await this.evaluateCall(stmt, env);
    }
  }

  async executeIf(stmt, env) {
    if (await this.evaluateExpression(stmt.condition, env)) {
      await this.executeBlock(stmt.thenBlock, env);
    } else {
      let matched = false;
      for (const eb of stmt.elseIfBlocks) {
        if (await this.evaluateExpression(eb.condition, env)) {
          await this.executeBlock(eb.body, env);
          matched = true; break;
        }
      }
      if (!matched && stmt.elseBlock) await this.executeBlock(stmt.elseBlock, env);
    }
  }

  async executeFor(stmt, env) {
    const start = await this.evaluateExpression(stmt.start, env);
    const end = await this.evaluateExpression(stmt.end, env);
    const step = stmt.step ? await this.evaluateExpression(stmt.step, env) : 1;
    if (step > 0) {
      for (let i = start; i <= end; i += step) {
        env[stmt.varName] = i;
        await this.executeBlock(stmt.body, env);
        if (this._returnValue && this._returnValue.set) return;
      }
    } else {
      for (let i = start; i >= end; i += step) {
        env[stmt.varName] = i;
        await this.executeBlock(stmt.body, env);
        if (this._returnValue && this._returnValue.set) return;
      }
    }
  }

  async executeWhile(stmt, env) {
    while (await this.evaluateExpression(stmt.condition, env)) {
      await this.executeBlock(stmt.body, env);
      if (this._returnValue && this._returnValue.set) return;
    }
  }

  async executeRepeat(stmt, env) {
    do {
      await this.executeBlock(stmt.body, env);
      if (this._returnValue && this._returnValue.set) return;
    } while (!(await this.evaluateExpression(stmt.condition, env)));
  }

  async evaluateExpression(expr, env) {
    switch (expr.type) {
      case 'Number': return expr.value;
      case 'Real': return expr.value;
      case 'String': return expr.value;
      case 'Bool': return expr.value;
      case 'Variable':
        if (expr.name in env) return env[expr.name];
        throw new Error(`Variable '${expr.name}' non définie`);
      case 'ArrayAccess': {
        const arr = env[expr.name];
        const idx = await this.evaluateExpression(expr.index, env);
        if (Array.isArray(arr) || typeof arr === 'string') {
          return arr[idx];
        }
        throw new Error(`${expr.name} n'est pas un tableau ni une chaîne`);
      }
      case 'BinaryOp': return this.evaluateBinaryOp(expr, env);
      case 'UnaryOp': return this.evaluateUnaryOp(expr, env);
      case 'Call': return this.evaluateCall(expr, env);
      case 'SetLiteral': {
        const values = [];
        for (const el of expr.elements) values.push(await this.evaluateExpression(el, env));
        return values;
      }
      default: throw new Error(`Expression inconnue: ${expr.type}`);
    }
  }

  async evaluateBinaryOp(expr, env) {
    const left = await this.evaluateExpression(expr.left, env);
    const right = await this.evaluateExpression(expr.right, env);
    switch (expr.op) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case 'div': return Math.floor(left / right);
      case 'mod':
      case '%': return left % right;
      case '=': return left === right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=':
      case '≤': return left <= right;
      case '>=':
      case '≥': return left >= right;
      case '≠':
      case '!=': return left !== right;
      case 'Et': return left && right;
      case 'Ou': return left || right;
      case '∈':
        if (Array.isArray(right)) return right.includes(left);
        throw new Error("Opérande droit de '∈' doit être un ensemble");
      default: throw new Error(`Opérateur inconnu: ${expr.op}`);
    }
  }

  async evaluateUnaryOp(expr, env) {
    const operand = await this.evaluateExpression(expr.operand, env);
    switch (expr.op) {
      case '-': return -operand;
      case 'Non': return !operand;
      default: throw new Error(`Opérateur unaire inconnu: ${expr.op}`);
    }
  }

  async evaluateCall(expr, env) {
    const name = expr.name.toLowerCase();
    const args = expr.args;
    // Built-in functions
    if (name === 'chr') return String.fromCharCode(await this.evaluateExpression(args[0], env));
    if (name === 'ord') return String(await this.evaluateExpression(args[0], env)).charCodeAt(0);
    if (name === 'long') return String(await this.evaluateExpression(args[0], env)).length;
    if (name === 'majus') return String(await this.evaluateExpression(args[0], env)).toUpperCase();
    if (name === 'sous_chaine') {
      const s = String(await this.evaluateExpression(args[0], env));
      const d = await this.evaluateExpression(args[1], env);
      const f = await this.evaluateExpression(args[2], env);
      return s.substring(d, f);
    }
    if (name === 'effacer') {
      const s = String(await this.evaluateExpression(args[0], env));
      const d = await this.evaluateExpression(args[1], env);
      const f = await this.evaluateExpression(args[2], env);
      return s.substring(0, d) + s.substring(f);
    }
    if (name === 'pos') {
      const s1 = String(await this.evaluateExpression(args[0], env));
      const s2 = String(await this.evaluateExpression(args[1], env));
      return s2.indexOf(s1);
    }
    if (name === 'convch') return String(await this.evaluateExpression(args[0], env));
    if (name === 'valeur') return parseFloat(String(await this.evaluateExpression(args[0], env)));
    if (name === 'racine') return Math.sqrt(await this.evaluateExpression(args[0], env));
    if (name === 'abs') return Math.abs(await this.evaluateExpression(args[0], env));
    if (name === 'arrondi') {
      const x = await this.evaluateExpression(args[0], env);
      const ix = Math.floor(x);
      if (x - ix === 0.5) {
        return ix % 2 === 0 ? ix : ix + 1;
      } else {
        return Math.round(x);
      }
    }
    if (name === 'alea' || name === 'aléa') {
      const deb = await this.evaluateExpression(args[0], env);
      const fin = await this.evaluateExpression(args[1], env);
      return Math.floor(Math.random() * (fin - deb + 1)) + deb;
    }
    if (name === 'ent') return Math.floor(await this.evaluateExpression(args[0], env));
    // User-defined function
    if (this.functions[name]) return await this.executeFunction(name, args, env);
    throw new Error(`Fonction '${name}' non définie`);
  }

  async requestInput(promptText) {
    if (this.inputCallback) return await this.inputCallback(promptText);
    return '';
  }

  convertInput(inputStr, currentType) {
    if (typeof currentType === 'number') {
      const val = parseFloat(inputStr);
      return Number.isInteger(val) ? parseInt(inputStr) : val;
    }
    if (typeof currentType === 'boolean') {
      return inputStr.toLowerCase() === 'vrai' || inputStr === 'true' || inputStr === '1';
    }
    return inputStr;
  }

  addInput(value) { this.inputBuffer.push(value); }
}

export { Interpreter };