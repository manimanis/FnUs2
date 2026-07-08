/**
 * Interpreter for the Algorithmic Language
 * Executes the AST directly.
 */

class Interpreter {
  constructor(options = {}) {
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
    this._stopped = false;
    this.maxIterations = options.maxIterations || 1000000;
    this.executionTimeout = options.executionTimeout || 50000;
    this.iterationCount = 0;
    this.startTime = null;
    this.yieldInterval = options.yieldInterval || 100;
    this._yieldCounter = 0;
  }

  stop() {
    this._stopped = true;
  }

  _maybeYield() {
    this._yieldCounter++;
    if (this._yieldCounter >= this.yieldInterval) {
      this._yieldCounter = 0;
      return new Promise(resolve => setTimeout(resolve, 0));
    }
    return null;
  }

  _checkIterationLimit() {
    this.iterationCount++;
    if (this.iterationCount > this.maxIterations) {
      throw new Error('Limite d\'itérations atteinte');
    }
  }

  _checkTimeout() {
    if (this.startTime && (Date.now() - this.startTime > this.executionTimeout)) {
      throw new Error('Timeout');
    }
  }

  _formatError(message, stmt) {
    const line = stmt && stmt.line ? ` (ligne ${stmt.line})` : '';
    return `${message}${line}`;
  }

  setOutputCallback(cb) { this.outputCallback = cb; }
  setInputCallback(cb) { this.inputCallback = cb; }
  setVariableUpdateCallback(cb) { this.variableUpdateCallback = cb; }

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
        const td = this.typeDefs[type.toLowerCase()];
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
    this._stopped = false;
    this.iterationCount = 0;
    this.startTime = Date.now();

    let mainBody = null;

    for (const decl of ast.declarations) {
      if (decl.type === 'TypeDecl') this.typeDefs[decl.name.toLowerCase()] = decl;
      else if (decl.type === 'Procedure') this.procedures[decl.name.toLowerCase()] = decl;
      else if (decl.type === 'Function') this.functions[decl.name.toLowerCase()] = decl;
      else if (decl.type === 'VarDecl') {
        for (const name of decl.names) {
          this.globalEnv[name.toLowerCase()] = this.getDefaultValue(decl.varType);
        }
      } else if (decl.type === 'MainProgram') {
        mainBody = decl.body;
      }
    }

    if (mainBody) {
      await this.executeBlock(mainBody, this.globalEnv);
      return { output: this.output };
    }

    if (this.procedures['main']) { await this.executeProcedure('main', [], this.globalEnv); return { output: this.output }; }
    if (this.procedures['principal']) { await this.executeProcedure('principal', [], this.globalEnv); return { output: this.output }; }

    return { output: this.output };
  }

  _findEnvWithOwnProperty(env, name) {
    const lowerName = name.toLowerCase();
    let current = env;
    while (current) {
      if (Object.prototype.hasOwnProperty.call(current, lowerName)) {
        return current;
      }
      current = Object.getPrototypeOf(current);
    }
    return null;
  }

  async executeProcedure(name, argExprs, callerEnv = this.globalEnv) {
    const proc = this.procedures[name.toLowerCase()];
    if (!proc) {
      throw new Error(`Procédure '${name}' non définie`);
    }
    const localEnv = Object.create(callerEnv);
    for (let i = 0; i < proc.params.length; i++) {
      const p = proc.params[i];
      if (p.byRef && i < argExprs.length) {
        const arg = argExprs[i];
        if (arg.type === 'Variable') {
          let targetEnv = this._findEnvWithOwnProperty(callerEnv, arg.name) || this.globalEnv;
          Object.defineProperty(localEnv, p.name.toLowerCase(), {
            get: () => targetEnv[arg.name.toLowerCase()],
            set: (v) => { targetEnv[arg.name.toLowerCase()] = v; },
            configurable: true,
            enumerable: true
          });
          continue;
        }
        if (arg.type === 'ArrayAccess') {
          const arr = await this.evaluateExpression({ type: 'Variable', name: arg.name.toLowerCase() }, callerEnv);
          const idx = await this.evaluateExpression(arg.index, callerEnv);
          Object.defineProperty(localEnv, p.name.toLowerCase(), {
            get: () => arr[idx],
            set: (v) => { arr[idx] = v; },
            configurable: true,
            enumerable: true
          });
          continue;
        }
      }
      localEnv[p.name.toLowerCase()] = i < argExprs.length
        ? await this.evaluateExpression(argExprs[i], callerEnv)
        : this.getDefaultValue(p.paramType);
    }
    await this.executeBlock(proc.body, localEnv);
  }

  async executeFunction(name, argExprs, callerEnv = this.globalEnv) {
    const func = this.functions[name.toLowerCase()];
    if (!func) {
      throw new Error(`Fonction '${name}' non définie`);
    }
    const localEnv = Object.create(callerEnv);
    for (let i = 0; i < func.params.length; i++) {
      const p = func.params[i];
      localEnv[p.name.toLowerCase()] = i < argExprs.length
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
      if (this._stopped) throw new Error('__STOPPED__');
      await this.executeStatement(stmt, env);
      if (this._returnValue && this._returnValue.set) return;
    }
  }

  async executeStatement(stmt, env) {
    if (this._returnValue && this._returnValue.set) return;
    if (this._stopped) throw new Error('__STOPPED__');

    switch (stmt.type) {
      case 'Assign':
        env[stmt.target.toLowerCase()] = await this.evaluateExpression(stmt.value, env);
        this._notifyVariableUpdate();
        break;
      case 'ArrayAssign': {
        const arr = env[stmt.target.toLowerCase()];
        const idx = await this.evaluateExpression(stmt.index, env);
        if (!Array.isArray(arr)) throw new Error(this._formatError(`${stmt.target} n'est pas un tableau`, stmt));
        if (idx < 0 || idx >= arr.length) {
          throw new Error(this._formatError(`Indice ${idx} hors bornes`, stmt));
        }
        arr[idx] = await this.evaluateExpression(stmt.value, env);
        this._notifyVariableUpdate();
        break;
      }
      case 'ArrayAssign2D': {
        const arr = env[stmt.target.toLowerCase()];
        const idx1 = await this.evaluateExpression(stmt.index1, env);
        const idx2 = await this.evaluateExpression(stmt.index2, env);
        if (!Array.isArray(arr)) {
          throw new Error(this._formatError(`${stmt.target} n'est pas une matrice`, stmt));
        }
        if (idx1 < 0 || idx1 >= arr.length) {
          throw new Error(this._formatError(`Indice ligne ${idx1} hors bornes`, stmt));
        }
        const row = arr[idx1];
        if (!Array.isArray(row)) {
          throw new Error(this._formatError(`Ligne ${idx1} de ${stmt.target} n'est pas un tableau`, stmt));
        }
        if (idx2 < 0 || idx2 >= row.length) {
          throw new Error(this._formatError(`Indice colonne ${idx2} hors bornes`, stmt));
        }
        row[idx2] = await this.evaluateExpression(stmt.value, env);
        this._notifyVariableUpdate();
        break;
      }
      case 'Write': {
        const parts = [];
        for (const a of stmt.args) {
          const v = await this.evaluateExpression(a, env);
          if (typeof v === 'boolean') parts.push(v ? 'Vrai' : 'Faux');
          else parts.push(v === null || v === undefined ? '' : String(v));
        }
        const separator = (typeof stmt.sep === 'string') ? stmt.sep : ' ';
        const ending = stmt.fin !== null && stmt.fin !== undefined ? stmt.fin : '\n';
        this.addOutput(parts.join(separator) + ending);
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
            env[target.name.toLowerCase()] = this.convertInput(inputStr, env[target.name.toLowerCase()]);
          } else if (target.type === 'ArrayAccess') {
            const arr = env[target.name.toLowerCase()];
            if (!Array.isArray(arr)) throw new Error(this._formatError(`${target.name} n'est pas un tableau`, target));
            const idx = await this.evaluateExpression(target.index, env);
            arr[idx] = this.convertInput(inputStr, arr[idx]);
          } else if (target.type === 'ArrayAccess2D') {
            const arr = env[target.name.toLowerCase()];
            if (!Array.isArray(arr)) throw new Error(this._formatError(`${target.name} n'est pas une matrice`, target));
            const idx1 = await this.evaluateExpression(target.index1, env);
            const idx2 = await this.evaluateExpression(target.index2, env);
            if (idx1 < 0 || idx1 >= arr.length) throw new Error(this._formatError(`Indice ligne ${idx1} hors bornes`, target));
            const row = arr[idx1];
            if (!Array.isArray(row)) throw new Error(this._formatError(`Ligne ${idx1} n'est pas un tableau`, target));
            if (idx2 < 0 || idx2 >= row.length) throw new Error(this._formatError(`Indice colonne ${idx2} hors bornes`, target));
            row[idx2] = this.convertInput(inputStr, row[idx2]);
          }
          this.addOutput(inputStr + '\n');
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
          env[name.toLowerCase()] = this.getDefaultValue(stmt.varType);
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
      throw new Error(this._formatError(`Procédure/Fonction '${stmt.name}' non définie`, stmt));
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
    if (this._stopped) throw new Error('__STOPPED__');
    const start = await this.evaluateExpression(stmt.start, env);
    const end = await this.evaluateExpression(stmt.end, env);
    const step = stmt.step ? await this.evaluateExpression(stmt.step, env) : 1;

    if (typeof start !== 'number' || typeof end !== 'number') {
      throw new Error('Les bornes de la boucle Pour doivent être des nombres');
    }
    if (typeof step !== 'number' || isNaN(step)) {
      throw new Error('Les bornes de la boucle Pour doivent être des nombres');
    }
    if (step === 0) {
      throw new Error('Le pas de la boucle Pour ne peut pas être nul');
    }

    if (step > 0) {
      for (let i = start; i <= end; i += step) {
        this._checkIterationLimit();
        this._checkTimeout();
        if (this._stopped) throw new Error('__STOPPED__');
        env[stmt.varName.toLowerCase()] = i;
        await this.executeBlock(stmt.body, env);
        if (this._returnValue && this._returnValue.set) return;
        if (this._stopped) throw new Error('__STOPPED__');
        const yieldPromise = this._maybeYield();
        if (yieldPromise) await yieldPromise;
      }
    } else {
      for (let i = start; i >= end; i += step) {
        this._checkIterationLimit();
        this._checkTimeout();
        if (this._stopped) throw new Error('__STOPPED__');
        env[stmt.varName.toLowerCase()] = i;
        await this.executeBlock(stmt.body, env);
        if (this._returnValue && this._returnValue.set) return;
        if (this._stopped) throw new Error('__STOPPED__');
        const yieldPromise = this._maybeYield();
        if (yieldPromise) await yieldPromise;
      }
    }
  }

  async executeWhile(stmt, env) {
    if (this._stopped) throw new Error('__STOPPED__');
    while (await this.evaluateExpression(stmt.condition, env)) {
      this._checkIterationLimit();
      this._checkTimeout();
      if (this._stopped) throw new Error('__STOPPED__');
      await this.executeBlock(stmt.body, env);
      if (this._returnValue && this._returnValue.set) return;
      if (this._stopped) throw new Error('__STOPPED__');
      const yieldPromise = this._maybeYield();
      if (yieldPromise) await yieldPromise;
    }
  }

  async executeRepeat(stmt, env) {
    if (this._stopped) throw new Error('__STOPPED__');
    do {
      this._checkIterationLimit();
      this._checkTimeout();
      if (this._stopped) throw new Error('__STOPPED__');
      await this.executeBlock(stmt.body, env);
      if (this._returnValue && this._returnValue.set) return;
      if (this._stopped) throw new Error('__STOPPED__');
      const yieldPromise = this._maybeYield();
      if (yieldPromise) await yieldPromise;
    } while (!(await this.evaluateExpression(stmt.condition, env)));
  }

  async evaluateExpression(expr, env) {
    switch (expr.type) {
      case 'Number': return expr.value;
      case 'Real': return expr.value;
      case 'String': return expr.value;
      case 'Bool': return expr.value;
      case 'Variable':
        if (expr.name.toLowerCase() in env) return env[expr.name.toLowerCase()];
        throw new Error(this._formatError(`Variable '${expr.name}' non définie`, expr));
      case 'ArrayAccess': {
        const arr = env[expr.name.toLowerCase()];
        const idx = await this.evaluateExpression(expr.index, env);
        if (Array.isArray(arr) || typeof arr === 'string') {
          if (idx < 0 || idx >= arr.length) {
            throw new Error(this._formatError(`Indice ${idx} hors bornes`, expr));
          }
          return arr[idx];
        }
        throw new Error(this._formatError(`${expr.name} n'est pas un tableau ni une chaîne`, expr));
      }
      case 'ArrayAccess2D': {
        const arr = env[expr.name.toLowerCase()];
        const idx1 = await this.evaluateExpression(expr.index1, env);
        const idx2 = await this.evaluateExpression(expr.index2, env);
        if (!Array.isArray(arr)) {
          throw new Error(this._formatError(`${expr.name} n'est pas une matrice`, expr));
        }
        if (idx1 < 0 || idx1 >= arr.length) {
          throw new Error(this._formatError(`Indice ligne ${idx1} hors bornes`, expr));
        }
        const row = arr[idx1];
        if (!Array.isArray(row) && typeof row !== 'string') {
          throw new Error(this._formatError(`Ligne ${idx1} de ${expr.name} n'est pas un tableau`, expr));
        }
        if (idx2 < 0 || idx2 >= row.length) {
          throw new Error(this._formatError(`Indice colonne ${idx2} hors bornes`, expr));
        }
        return row[idx2];
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
    switch (expr.op) {
      case '+':
      case '-':
      case '*':
      case '/':
      case 'div':
      case 'mod':
      case '%':
      case '=':
      case '<':
      case '>':
      case '<=':
      case '≤':
      case '>=':
      case '≥':
      case '≠':
      case '!=': {
        const right = await this.evaluateExpression(expr.right, env);
        switch (expr.op) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/':
            if (right === 0) throw new Error(this._formatError('Division par zéro', expr));
            return left / right;
          case 'div':
            if (right === 0) throw new Error(this._formatError('Division entière par zéro', expr));
            return Math.floor(left / right);
          case 'mod':
          case '%':
            if (right === 0) throw new Error(this._formatError('Modulo par zéro', expr));
            return left % right;
          case '=': return left === right;
          case '<': return left < right;
          case '>': return left > right;
          case '<=':
          case '≤': return left <= right;
          case '>=':
          case '≥': return left >= right;
          case '≠':
          case '!=': return left !== right;
          default: throw new Error(this._formatError(`Opérateur inconnu: ${expr.op}`, expr));
        }
      }
      case 'Et': {
        // Short-circuit: if left is falsy, skip evaluating right
        if (!left) return false;
        const right = await this.evaluateExpression(expr.right, env);
        return right;
      }
      case 'Ou': {
        // Short-circuit: if left is truthy, skip evaluating right
        if (left) return true;
        const right = await this.evaluateExpression(expr.right, env);
        return right;
      }
      case '∈': {
        const right = await this.evaluateExpression(expr.right, env);
        if (Array.isArray(right)) return right.includes(left);
        throw new Error(this._formatError("Opérande droit de '∈' doit être un ensemble", expr));
      }
      default: throw new Error(this._formatError(`Opérateur inconnu: ${expr.op}`, expr));
    }
  }

  async evaluateUnaryOp(expr, env) {
    const operand = await this.evaluateExpression(expr.operand, env);
    switch (expr.op) {
      case '-': return -operand;
      case 'Non': return !operand;
      default: throw new Error(this._formatError(`Opérateur unaire inconnu: ${expr.op}`, expr));
    }
  }

  async evaluateCall(expr, env) {
    const name = expr.name.toLowerCase();
    const args = expr.args;
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
    if (name === 'estnum') {
      const x = await this.evaluateExpression(args[0], env);
      return /^-?\d+(\.\d+)?$/.test(String(x));
    }
    if (name === 'alea' || name === 'aléa') {
      const deb = await this.evaluateExpression(args[0], env);
      const fin = await this.evaluateExpression(args[1], env);
      return Math.floor(Math.random() * (fin - deb + 1)) + deb;
    }
    if (name === 'ent') return Math.floor(await this.evaluateExpression(args[0], env));
    if (this.functions[name]) return await this.executeFunction(name, args, env);
    throw new Error(this._formatError(`Fonction '${name}' non définie`, expr));
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

  _notifyVariableUpdate() {
    if (this.variableUpdateCallback) {
      const vars = {};
      for (const key in this.globalEnv) {
        if (Object.prototype.hasOwnProperty.call(this.globalEnv, key)) {
          vars[key] = this.globalEnv[key];
        }
      }
      this.variableUpdateCallback(vars);
    }
  }

  addInput(value) { this.inputBuffer.push(value); }
}

export { Interpreter };