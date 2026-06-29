/**
 * Lexer / Tokenizer for the Algorithmic Language
 * Converts source code into a stream of tokens.
 */

class Lexer {
    constructor(source) {
        this.source = source;
        this.pos = 0;
        this.line = 1;
        this.col = 1;
        this.tokens = [];
    }

    static TOKEN_TYPES = {
        KEYWORD: 'KEYWORD',
        TYPE: 'TYPE',
        IDENTIFIER: 'IDENTIFIER',
        NUMBER: 'NUMBER',
        REAL: 'REAL',
        STRING: 'STRING',
        OPERATOR: 'OPERATOR',
        ARROW: 'ARROW',
        DELIMITER: 'DELIMITER',
        COMMENT: 'COMMENT',
        EOF: 'EOF'
    };

    static normalizeKeyword(str) {
        return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Keywords stored normalized for case-insensitive and accent-insensitive matching
    static KEYWORDS = [
        'si','alors','sinon','fin','pour','faire',
        'pas','repeter',"jusqu'a",'tant','que','procedure',
        'fonction','debut','type','var','retourner','et','ou',
        'non','vrai','faux','ecrire','lire'
    ];

    static TYPES = ['entier','reel','caractere','chaine','booleen','tableau'];

    error(message) {
        throw new Error(`Erreur ligne ${this.line}, col. ${this.col}: ${message}`);
    }

    peek() { return this.pos < this.source.length ? this.source[this.pos] : null; }
    peekNext() { return this.pos + 1 < this.source.length ? this.source[this.pos + 1] : null; }

    advance() {
        const ch = this.source[this.pos++];
        if (ch === '\n') { this.line++; this.col = 1; }
        else { this.col++; }
        return ch;
    }

    skipWhitespace() {
        while (this.pos < this.source.length && /\s/.test(this.source[this.pos])) {
            this.advance();
        }
    }

    readString() {
        this.advance(); // skip "
        let str = '';
        while (this.pos < this.source.length && this.source[this.pos] !== '"') {
            str += this.advance();
        }
        if (this.pos >= this.source.length) this.error('Chaîne non terminée');
        this.advance(); // skip "
        return { type: Lexer.TOKEN_TYPES.STRING, value: str, line: this.line, col: this.col - str.length - 2 };
    }

    readIdentifier() {
        let id = '';
        // Allow apostrophe for "Jusqu'à"
        while (this.pos < this.source.length && /[a-zA-Z0-9_À-ÿ']/.test(this.source[this.pos])) {
            id += this.advance();
        }
        // Case-insensitive and accent-insensitive matching for keywords and types
        const idNorm = Lexer.normalizeKeyword(id);
        if (idNorm === 'div' || idNorm === 'mod') {
            return { type: Lexer.TOKEN_TYPES.OPERATOR, value: idNorm, line: this.line, col: this.col - id.length };
        }
        if (Lexer.KEYWORDS.includes(idNorm)) {
            return { type: Lexer.TOKEN_TYPES.KEYWORD, value: idNorm, line: this.line, col: this.col - id.length };
        }
        if (Lexer.TYPES.includes(idNorm)) {
            return { type: Lexer.TOKEN_TYPES.TYPE, value: idNorm, line: this.line, col: this.col - id.length };
        }
        return { type: Lexer.TOKEN_TYPES.IDENTIFIER, value: id, line: this.line, col: this.col - id.length };
    }

    readNumber() {
        let num = '';
        let isReal = false;
        while (this.pos < this.source.length && /[0-9.]/.test(this.source[this.pos])) {
            if (this.source[this.pos] === '.') {
                if (isReal) break;
                isReal = true;
            }
            num += this.advance();
        }
        return {
            type: isReal ? Lexer.TOKEN_TYPES.REAL : Lexer.TOKEN_TYPES.NUMBER,
            value: num, line: this.line, col: this.col - num.length
        };
    }

    readSingleLineComment() {
        let comment = '';
        this.advance(); // skip first /
        this.advance(); // skip second /
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
            comment += this.advance();
        }
        // Keep the newline in the source so skipWhitespace / line counting stays correct
        return { type: Lexer.TOKEN_TYPES.COMMENT, value: comment, line: this.line, col: this.col - comment.length - 2 };
    }

    readMultiLineComment() {
        let comment = '';
        this.advance(); // skip /
        this.advance(); // skip *
        while (this.pos < this.source.length) {
            if (this.source[this.pos] === '*' && this.peekNext() === '/') {
                this.advance(); // skip *
                this.advance(); // skip /
                return { type: Lexer.TOKEN_TYPES.COMMENT, value: comment, line: this.line, col: this.col - comment.length - 2 };
            }
            comment += this.advance();
        }
        this.error('Commentaire multiligne non fermé');
    }

    readOperator() {
        // Handle ←
        if (this.peek() === '←') {
            this.advance();
            return { type: Lexer.TOKEN_TYPES.ARROW, value: '←', line: this.line, col: this.col - 1 };
        }
        // Handle <-
        if (this.peek() === '<' && this.peekNext() === '-') {
            this.advance(); this.advance();
            return { type: Lexer.TOKEN_TYPES.ARROW, value: '<-', line: this.line, col: this.col - 2 };
        }
        // Handle :=
        if (this.peek() === ':' && this.peekNext() === '=') {
            this.advance(); this.advance();
            return { type: Lexer.TOKEN_TYPES.ARROW, value: ':=', line: this.line, col: this.col - 2 };
        }
        // Handle <=
        if (this.peek() === '<' && this.peekNext() === '=') {
            this.advance(); this.advance();
            return { type: Lexer.TOKEN_TYPES.OPERATOR, value: '<=', line: this.line, col: this.col - 2 };
        }
        // Handle >=
        if (this.peek() === '>' && this.peekNext() === '=') {
            this.advance(); this.advance();
            return { type: Lexer.TOKEN_TYPES.OPERATOR, value: '>=', line: this.line, col: this.col - 2 };
        }
        // Handle !=
        if (this.peek() === '!' && this.peekNext() === '=') {
            this.advance(); this.advance();
            return { type: Lexer.TOKEN_TYPES.OPERATOR, value: '!=', line: this.line, col: this.col - 2 };
        }
        // Handle ≠
        if (this.peek() === '≠') {
            this.advance();
            return { type: Lexer.TOKEN_TYPES.OPERATOR, value: '≠', line: this.line, col: this.col - 1 };
        }
        // Handle other delimiters
        if (':,@.()[];{}'.includes(this.peek())) {
            const ch = this.advance();
            return { type: Lexer.TOKEN_TYPES.DELIMITER, value: ch, line: this.line, col: this.col - 1 };
        }
        // Handle operators
        if ('+-*/=<>≤≥∈'.includes(this.peek())) {
            const ch = this.advance();
            return { type: Lexer.TOKEN_TYPES.OPERATOR, value: ch, line: this.line, col: this.col - 1 };
        }
        // Handle other chars
        const ch = this.advance();
        return { type: Lexer.TOKEN_TYPES.OPERATOR, value: ch, line: this.line, col: this.col - 1 };
    }

    tokenize() {
        this.tokens = [];
        while (this.pos < this.source.length) {
            this.skipWhitespace();
            if (this.pos >= this.source.length) break;

            const ch = this.peek();

            if (ch === '"') { this.tokens.push(this.readString()); continue; }
            if (/[0-9]/.test(ch)) { this.tokens.push(this.readNumber()); continue; }
            if (/[a-zA-Z_À-ÿ]/.test(ch)) { this.tokens.push(this.readIdentifier()); continue; }
            if (ch === '←') { this.advance(); this.tokens.push({ type: Lexer.TOKEN_TYPES.ARROW, value: '←', line: this.line, col: this.col - 1 }); continue; }

            if (ch === '/' && this.peekNext() === '/') { this.tokens.push(this.readSingleLineComment()); continue; }
            if (ch === '/' && this.peekNext() === '*') { this.tokens.push(this.readMultiLineComment()); continue; }

            this.tokens.push(this.readOperator());
        }
        this.tokens.push({ type: Lexer.TOKEN_TYPES.EOF, value: 'EOF', line: this.line, col: this.col });
        return this.tokens;
    }
}

export { Lexer };