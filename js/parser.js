/**
 * Parser for the Algorithmic Language
 * Converts token stream into an Abstract Syntax Tree (AST).
 */

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    static normalize(value) {
        return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    expectKeyword(value) {
        const token = this.next();
        const ok = (token.type === 'KEYWORD' || token.type === 'IDENTIFIER')
            && Parser.normalize(token.value) === Parser.normalize(value);
        if (!ok) {
            throw new Error(`Erreur ligne ${token.line}: Attendu '${value}', trouvé '${token.value}'`);
        }
        return token;
    }

    peek() { return this.tokens[this.pos]; }
    next() { return this.tokens[this.pos++]; }

    expect(type, value) {
        const token = this.next();
        const valMatch = value !== undefined
            ? (type === 'KEYWORD' ? Parser.normalize(token.value) === Parser.normalize(value) : token.value === value)
            : true;
        if (token.type !== type || !valMatch) {
            throw new Error(`Erreur ligne ${token.line}: Attendu '${value || type}', trouvé '${token.value}'`);
        }
        return token;
    }

    match(type, value) {
        const token = this.peek();
        const valMatch = value !== undefined
            ? (type === 'KEYWORD' ? Parser.normalize(token.value) === Parser.normalize(value) : token.value === value)
            : true;
        if (token.type === type && valMatch) {
            return this.next();
        }
        return null;
    }

    error(message) {
        const token = this.peek();
        throw new Error(`Erreur de syntaxe ligne ${token.line}: ${message} près de '${token.value}'`);
    }

    parse() {
        return this.parseProgram();
    }

    parseProgram() {
        const declarations = [];
        while (this.peek().type !== 'EOF') {
            // Skip comments at top level
            if (this.peek().type === 'COMMENT') {
                this.next();
                continue;
            }
            const v = Parser.normalize(this.peek().value);
            if (v === 'type') declarations.push(this.parseTypeDecl());
            else if (v === 'var') {
                const decls = this.parseVarDecl();
                for (const d of decls) declarations.push(d);
            }
            else if (this.isVarDeclaration()) {
                const decls = this.parseVarDeclWithoutVar();
                for (const d of decls) declarations.push(d);
            }
            else if (v === 'procedure') declarations.push(this.parseProcedure());
            else if (v === 'fonction') declarations.push(this.parseFunction());
            else if (v === 'debut') {
                this.next();
                const body = this.parseStatementBlock('Fin');
                declarations.push({ type: 'MainProgram', body });
            }
            else this.error('Attendu Type, Var, Procédure, Fonction, ou Début');
        }
        return { type: 'Program', declarations };
    }

    parseTypeDecl() {
        this.expect('KEYWORD', 'Type');
        const name = this.expect('IDENTIFIER');
        this.expect('OPERATOR', '=');
        this.expect('TYPE', 'tableau');
        this.expectKeyword('De');
        const size = this.expect('NUMBER');
        const elemType = this.expect('TYPE');
        return { type: 'TypeDecl', name: name.value, arraySize: parseInt(size.value), elemType: elemType.value, line: name.line };
    }

    isVarDeclaration() {
        const token = this.peek();
        // Check if current token is an identifier followed by ':' or ','
        if (token.type === 'IDENTIFIER') {
            const nextToken = this.tokens[this.pos + 1];
            if (nextToken && (nextToken.type === 'DELIMITER' && (nextToken.value === ':' || nextToken.value === ','))) {
                return true;
            }
        }
        return false;
    }

    parseVarDecl() {
        this.expect('KEYWORD', 'Var');
        return this.parseVarDeclarations();
    }

    parseVarDeclWithoutVar() {
        return this.parseVarDeclarations();
    }

    parseVarDeclarations() {
        const decls = [];
        const firstId = this.expect('IDENTIFIER');
        const ids = [firstId.value];
        while (this.match('DELIMITER', ',')) ids.push(this.expect('IDENTIFIER').value);
        this.expect('DELIMITER', ':');
        let varType;
        let typeToken;
        if (this.peek().type === 'TYPE' || this.peek().type === 'IDENTIFIER') {
            typeToken = this.next();
            varType = typeToken.value;
        } else {
            this.error('Attendu un type (entier, réel, chaîne, ...)');
        }
        decls.push({ type: 'VarDecl', names: ids, varType, line: firstId.line });

        // Handle continuation lines like "    t: tab" without extra Var/;
        this.consumeSemicolons();
        while (this.peek().type === 'IDENTIFIER') {
            const moreIds = [this.expect('IDENTIFIER').value];
            while (this.match('DELIMITER', ',')) moreIds.push(this.expect('IDENTIFIER').value);
            this.expect('DELIMITER', ':');
            let moreType;
            if (this.peek().type === 'TYPE' || this.peek().type === 'IDENTIFIER') {
                moreType = this.next().value;
            } else {
                this.error('Attendu un type');
            }
            decls.push({ type: 'VarDecl', names: moreIds, varType: moreType, line: moreIds[0].line || this.peek().line });
            this.consumeSemicolons();
        }
        return decls;
    }

    parseProcedure() {
        this.expect('KEYWORD', 'Procédure');
        const name = this.expect('IDENTIFIER');
        this.expect('DELIMITER', '(');
        const params = this.parseParams();
        this.expect('DELIMITER', ')');
        // Allow local Var declarations before Début
        const localVars = this.parseLocalVars();
        this.expect('KEYWORD', 'Début');
        const body = this.parseStatementBlock('Fin');
        // Prepend variable declarations to body as assignments
        const fullBody = [...localVars, ...body];
        return { type: 'Procedure', name: name.value, params, body: fullBody, line: name.line };
    }

    parseFunction() {
        this.expect('KEYWORD', 'Fonction');
        const name = this.expect('IDENTIFIER');
        this.expect('DELIMITER', '(');
        const params = this.parseParams();
        this.expect('DELIMITER', ')');
        this.expect('DELIMITER', ':');
        const returnType = this.expect('TYPE');
        // Allow local Var declarations before Début
        const localVars = this.parseLocalVars();
        this.expect('KEYWORD', 'Début');
        const body = this.parseStatementBlock('Fin');
        const fullBody = [...localVars, ...body];
        return { type: 'Function', name: name.value, params, returnType: returnType.value, body: fullBody, line: name.line };
    }

    parseLocalVars() {
        const stmts = [];
        while (this.peek().value.toLowerCase() === 'var' || this.isVarDeclaration()) {
            const decls = this.peek().value.toLowerCase() === 'var' 
                ? this.parseVarDecl() 
                : this.parseVarDeclWithoutVar();
            for (const d of decls) {
                stmts.push({ type: 'LocalVarDecl', names: d.names, varType: d.varType });
            }
        }
        return stmts;
    }

    parseParams() {
        const params = [];
        if (this.peek().value === ')') return params;

        // Parse first parameter (or group of params sharing a type)
        this.parseParamGroup(params);

        // Handle remaining params separated by , or ;
        while (this.peek().type === 'DELIMITER' && (this.peek().value === ',' || this.peek().value === ';')) {
            this.next(); // consume separator
            this.parseParamGroup(params);
        }
        return params;
    }

    parseParamGroup(params) {
        // Handle ref params
        let byRef = false;
        if (this.peek().type === 'DELIMITER' && this.peek().value === '@') {
            this.next();
            byRef = true;
        }

        const name = this.expect('IDENTIFIER').value;

        // If next is ',' then it's "a, b: type" (shared type) - collect all names
        if (this.peek().type === 'DELIMITER' && this.peek().value === ',') {
            const names = [name];
            while (this.peek().type === 'DELIMITER' && this.peek().value === ',') {
                this.next(); // consume ','
                names.push(this.expect('IDENTIFIER').value);
            }
            this.expect('DELIMITER', ':');
            const paramType = this.parseParamType();
            for (const n of names) {
                params.push({ type: 'Param', name: n, paramType, byRef });
            }
            return;
        }

        // Individual parameter: "name: type"
        this.expect('DELIMITER', ':');
        const paramType = this.parseParamType();
        params.push({ type: 'Param', name, paramType, byRef });
    }

    parseParamType() {
        const paramType = this.peek();
        if (paramType.type === 'TYPE' || paramType.type === 'IDENTIFIER') {
            return this.next().value;
        }
        this.error('Attendu un type (entier, réel, chaîne, tab, ...)');
    }


    parseStatementBlock(endKeyword) {
        const statements = [];
        const endLower = endKeyword.toLowerCase();
        this.consumeSemicolons();
        while (this.peek().value.toLowerCase() !== endLower && this.peek().type !== 'EOF') {
            const stmt = this.parseStatement();
            if (stmt) statements.push(stmt);
            this.consumeSemicolons();
        }
        if (this.peek().value.toLowerCase() === endLower) this.next();
        return statements;
    }

    consumeSemicolons() {
        while (this.peek().type === 'DELIMITER' && this.peek().value === ';') {
            this.next();
        }
    }

    parseStatement() {
        const token = this.peek();
        if (token.type === 'COMMENT') { this.next(); return { type: 'Comment', value: token.value }; }
        const tokVal = Parser.normalize(token.value);
        if (tokVal === 'si') return this.parseIf();
        if (tokVal === 'pour') return this.parseFor();
        if (tokVal === 'repeter') return this.parseRepeat();
        if (tokVal === 'tant') return this.parseWhile();
        if (tokVal === 'ecrire') return this.parseWrite();
        if (tokVal === 'lire') return this.parseRead();
        if (tokVal === 'retourner') return this.parseReturn();

        if (token.type === 'IDENTIFIER') {
            const name = token.value;
            const line = token.line;
            this.next();
            if (this.peek().type === 'DELIMITER' && this.peek().value === '(') {
                const args = this.parseArgs();
                return { type: 'Call', name, args, line };
            }
            if (this.peek().type === 'ARROW') {
                this.next();
                const value = this.parseExpression();
                return { type: 'Assign', target: name, value, line };
            }
            if (this.peek().type === 'DELIMITER' && this.peek().value === '[') {
                this.next();
                const index = this.parseExpression();
                this.expect('DELIMITER', ']');
                this.expect('ARROW');
                const value = this.parseExpression();
                return { type: 'ArrayAssign', target: name, index, value, line };
            }
            this.error('Attendu ←, ( ou [ après un identifiant');
        }
        this.error(`Instruction inattendue: '${token.value}'`);
    }

    // Case-insensitive value helpers
    valEq(tok, expected) {
        return tok && tok.value && tok.value.toLowerCase() === expected.toLowerCase();
    }

    // Check if current position has keyword sequence
    isNextToken(val) {
        return this.pos + 1 < this.tokens.length &&
               this.tokens[this.pos + 1].value.toLowerCase() === val.toLowerCase();
    }

    // Consume two-token keyword pair if present
    matchPair(first, second) {
        if (this.valEq(this.peek(), first) && this.isNextToken(second)) {
            this.next();
            this.next();
            return true;
        }
        return false;
    }

    // Check if we're at a block-ending keyword (including two-token ones)
    isEndOfBlock(endValues) {
        const val = Parser.normalize(this.peek().value);
        if (endValues.some(v => Parser.normalize(v) === val)) return true;
        // Handle two-token endings: Fin Si = Fin + Si, Fin Pour = Fin + Pour, etc.
        if (val === 'fin' && this.isNextToken('Si')) return true;
        if (val === 'fin' && this.isNextToken('Pour')) return true;
        if (val === 'fin' && this.isNextToken('Tant Que')) return true;
        if (val === 'sinon' && this.isNextToken('Si')) return true;
        return false;
    }

    parseIf() {
        const siToken = this.expect('KEYWORD', 'Si');
        const condition = this.parseExpression();
        this.expect('KEYWORD', 'Alors');
        const thenBlock = this.parseUntilIfBlock();
        const elseIfBlocks = [];
        while (this.isSinonSi()) {
            this.next(); // Sinon
            this.next(); // Si
            const elseifCond = this.parseExpression();
            this.expect('KEYWORD', 'Alors');
            const elseifBlock = this.parseUntilIfBlock();
            elseIfBlocks.push({ condition: elseifCond, body: elseifBlock });
        }
        let elseBlock = null;
        if (this.match('KEYWORD', 'Sinon')) {
            elseBlock = this.parseUntilIfBlock();
        }
        // Consume "Fin Si" or just "Fin"
        if (!this.matchPair('Fin', 'Si')) {
            if (this.valEq(this.peek(), 'Fin')) this.next();
        }
        return { type: 'If', condition, thenBlock, elseIfBlocks, elseBlock, line: siToken.line };
    }

    isSinonSi() {
        return this.valEq(this.peek(), 'Sinon') && this.isNextToken('Si');
    }

    parseUntilIfBlock() {
        const stmts = [];
        this.consumeSemicolons();
        while (!this.isEndOfBlock(['Sinon','Fin']) && this.peek().type !== 'EOF') {
            const stmt = this.parseStatement();
            if (stmt) stmts.push(stmt);
            this.consumeSemicolons();
        }
        return stmts;
    }

    parseUntil(endValues) {
        const stmts = [];
        this.consumeSemicolons();
        while (!this.isEndOfBlock(endValues) && this.peek().type !== 'EOF') {
            const stmt = this.parseStatement();
            if (stmt) stmts.push(stmt);
            this.consumeSemicolons();
        }
        return stmts;
    }

    parseFor() {
        const pourToken = this.expect('KEYWORD', 'Pour');
        const varName = this.expect('IDENTIFIER');
        this.expectKeyword('De');
        const start = this.parseExpression();
        this.expectKeyword('À');
        const end = this.parseExpression();
        let step = null;
        if (this.match('KEYWORD', 'Pas')) step = this.parseExpression();
        this.expect('KEYWORD', 'Faire');
        const body = this.parseUntil(['Fin Pour','Fin']);
        // Consume "Fin Pour" or just "Fin"
        if (!this.matchPair('Fin', 'Pour')) {
            if (this.valEq(this.peek(), 'Fin')) this.next();
        }
        return { type: 'For', varName: varName.value, start, end, step, body, line: pourToken.line };
    }

    parseRepeat() {
        const repeterToken = this.expectKeyword('Répéter');
        const body = this.parseUntil(['Jusqu\'à']);
        this.expect('KEYWORD', 'Jusqu\'à');
        const condition = this.parseExpression();
        return { type: 'Repeat', body, condition, line: repeterToken.line };
    }

    parseWhile() {
        const tantToken = this.expect('KEYWORD', 'Tant');
        this.expect('KEYWORD', 'Que');
        const condition = this.parseExpression();
        this.expect('KEYWORD', 'Faire');
        const body = this.parseUntil(['Fin Tant Que','Fin']);
        // Consume "Fin Tant Que" - but Tant Que is two tokens, so we check differently
        if (this.valEq(this.peek(), 'Fin')) {
            this.next();
            // After Fin, if there's Tant and then Que, consume them
            if (this.valEq(this.peek(), 'Tant')) {
                this.next();
                if (this.valEq(this.peek(), 'Que')) this.next();
            }
        }
        return { type: 'While', condition, body, line: tantToken.line };
    }

    parseWrite() {
        const ecrireToken = this.expect('KEYWORD', 'Ecrire');
        this.expect('DELIMITER', '(');
        const args = [];
        let sep = null;
        let fin = null;

        // Helper: check if current position is a keyword argument
        // Note: 'fin' is a keyword token ('fin'), 'sep' is an identifier token
        const isKeywordArg = () => {
            const tok = this.peek();
            const name = tok.value.toLowerCase();
            return (name === 'sep' || name === 'fin') &&
                this.pos + 1 < this.tokens.length && this.tokens[this.pos + 1].value === '=';
        };

        // Parse regular arguments first
        if (this.peek().value !== ')' && !isKeywordArg()) {
            args.push(this.parseExpression());
            while (this.peek().type === 'DELIMITER' && this.peek().value === ',') {
                this.next(); // consume ','
                if (isKeywordArg()) break;
                args.push(this.parseExpression());
            }
        }

        // Parse keyword arguments: sep="..." and fin="..."
        while (isKeywordArg()) {
            const kwToken = this.next();
            const kwName = kwToken.value.toLowerCase();
            this.expect('OPERATOR', '=');
            const valueExpr = this.parseExpression();
            if (valueExpr.type !== 'String') {
                this.error(`La valeur de '${kwName}' doit être une chaîne de caractères`);
            }
            if (kwName === 'sep') {
                if (sep !== null) this.error("'sep' ne peut être spécifié qu'une fois");
                sep = valueExpr.value;
            } else {
                if (fin !== null) this.error("'fin' ne peut être spécifié qu'une fois");
                fin = valueExpr.value;
            }
            // If there's a comma, consume it for the next keyword arg
            if (this.peek().type === 'DELIMITER' && this.peek().value === ',') {
                this.next();
            }
        }

        this.expect('DELIMITER', ')');
        return { type: 'Write', args, sep, fin, line: ecrireToken.line };
    }

    parseRead() {
        const lireToken = this.expect('KEYWORD', 'Lire');
        this.expect('DELIMITER', '(');
        const targets = [];
        const first = this.parseExpression();
        if (first.type === 'Variable' || first.type === 'ArrayAccess') targets.push(first);
        else this.error('Lire attend un identifiant ou un accès tableau');
        while (this.match('DELIMITER', ',')) {
            const nextExpr = this.parseExpression();
            if (nextExpr.type === 'Variable' || nextExpr.type === 'ArrayAccess') targets.push(nextExpr);
            else this.error('Lire attend un identifiant ou un accès tableau');
        }
        this.expect('DELIMITER', ')');
        return { type: 'Read', targets, line: lireToken.line };
    }

    parseReturn() {
        const token = this.next();
        const normVal = Parser.normalize(token.value);
        if (normVal !== 'retourner') {
            throw new Error(`Erreur ligne ${token.line}: Attendu 'Retourner', trouvé '${token.value}'`);
        }
        const value = this.parseExpression();
        return { type: 'Return', value, line: token.line };
    }

    parseArgs() {
        this.expect('DELIMITER', '(');
        const args = [];
        if (this.peek().value !== ')') {
            args.push(this.parseExpression());
            while (this.match('DELIMITER', ',')) args.push(this.parseExpression());
        }
        this.expect('DELIMITER', ')');
        return args;
    }

    // Expression parsing with precedence
    parseExpression() { return this.parseOr(); }

    parseOr() {
        let left = this.parseAnd();
        while (Parser.normalize(this.peek().value) === 'ou') {
            this.next();
            left = { type: 'BinaryOp', op: 'Ou', left, right: this.parseAnd() };
        }
        return left;
    }

    parseAnd() {
        let left = this.parseComparison();
        while (Parser.normalize(this.peek().value) === 'et') {
            this.next();
            left = { type: 'BinaryOp', op: 'Et', left, right: this.parseComparison() };
        }
        return left;
    }

    parseComparison() {
        let left = this.parseAddition();
        const comparisons = [];
        while (
            (this.peek().type === 'OPERATOR' && ['=', '<', '>', '<=', '>=', '≠', '!=', '≤', '≥'].includes(this.peek().value))
            || (this.peek().type === 'OPERATOR' && this.peek().value === '∈')
        ) {
            const op = this.next().value;
            let right;
            if (op === '∈') {
                if (this.peek().type !== 'DELIMITER' || this.peek().value !== '{') {
                    this.error("Attendu '{' après '∈'");
                }
                this.next(); // skip {
                const elements = [];
                if (!(this.peek().type === 'DELIMITER' && this.peek().value === '}')) {
                    elements.push(this.parseExpression());
                    while (this.peek().type === 'DELIMITER' && this.peek().value === ',') {
                        this.next();
                        elements.push(this.parseExpression());
                    }
                }
                this.expect('DELIMITER', '}');
                right = { type: 'SetLiteral', elements };
            } else {
                right = this.parseAddition();
            }
            comparisons.push({ left, op, right });
            left = right;
        }
        if (comparisons.length === 0) return left;
        let result = { type: 'BinaryOp', op: comparisons[0].op, left: comparisons[0].left, right: comparisons[0].right };
        for (let i = 1; i < comparisons.length; i++) {
            const c = comparisons[i];
            const rightExpr = { type: 'BinaryOp', op: c.op, left: comparisons[i - 1].right, right: c.right };
            result = { type: 'BinaryOp', op: 'Et', left: result, right: rightExpr };
        }
        return result;
    }

    parseAddition() {
        let left = this.parseTerm();
        while (this.peek().type === 'OPERATOR' && ['+', '-'].includes(this.peek().value)) {
            const op = this.next().value;
            left = { type: 'BinaryOp', op, left, right: this.parseTerm() };
        }
        return left;
    }

    parseTerm() {
        let left = this.parseFactor();
        while (this.peek().type === 'OPERATOR' && ['*', '/', 'div', 'mod', '%'].includes(this.peek().value)) {
            const op = this.next().value;
            left = { type: 'BinaryOp', op, left, right: this.parseFactor() };
        }
        return left;
    }

    parseFactor() {
        const token = this.peek();
        if (token.type === 'OPERATOR' && token.value === '-') {
            this.next();
            return { type: 'UnaryOp', op: '-', operand: this.parseFactor() };
        }
        if (Parser.normalize(token.value) === 'non') {
            this.next();
            return { type: 'UnaryOp', op: 'Non', operand: this.parseFactor() };
        }
        if (token.type === 'DELIMITER' && token.value === '(') {
            this.next();
            const expr = this.parseExpression();
            this.expect('DELIMITER', ')');
            return expr;
        }
        if (token.type === 'NUMBER') { this.next(); return { type: 'Number', value: parseInt(token.value), line: token.line }; }
        if (token.type === 'REAL') { this.next(); return { type: 'Real', value: parseFloat(token.value), line: token.line }; }
        if (token.type === 'STRING') { this.next(); return { type: 'String', value: token.value, line: token.line }; }
        if (Parser.normalize(token.value) === 'vrai') { this.next(); return { type: 'Bool', value: true, line: token.line }; }
        if (Parser.normalize(token.value) === 'faux') { this.next(); return { type: 'Bool', value: false, line: token.line }; }

        if (token.type === 'IDENTIFIER') {
            const name = token.value;
            const line = token.line;
            this.next();
            if (this.peek().type === 'DELIMITER' && this.peek().value === '(') {
                const args = this.parseArgs();
                return { type: 'Call', name, args, line };
            }
            if (this.peek().type === 'DELIMITER' && this.peek().value === '[') {
                this.next();
                const index = this.parseExpression();
                this.expect('DELIMITER', ']');
                return { type: 'ArrayAccess', name, index, line };
            }
            return { type: 'Variable', name, line };
        }
        this.error(`Expression inattendue: '${token.value}'`);
    }
}

export { Parser };