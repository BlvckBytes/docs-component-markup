import { Prism } from 'prism-react-renderer';

class InputCursor {
  public nextCharIndex: number = 0;

  constructor(private input: string) {}

  nextChar(): string | null {
    if (this.nextCharIndex == this.input.length)
      return null;

    return this.input.charAt(this.nextCharIndex++);
  }

  peekChar(): string | null {
    if (this.nextCharIndex == this.input.length)
      return null;

    return this.input.charAt(this.nextCharIndex);
  }

  consumeWhitespace(): string {
    let buf = '';

    while (/\s/.test(this.peekChar() || ''))
      buf += this.nextChar();

    return buf;
  }
}

export const tokenizeMarkupExpression = (input: string): Prism.Token[] => {
  let result: Prism.Token[] = [];
  let cursor = new InputCursor(input);

  const consumeAndHoldWhitespace = (): (() => void) | null => {
    let whitespace = cursor.consumeWhitespace();

    if (whitespace.length == 0)
      return null;

    return () => {
      for (let char of whitespace) {
        let alias = undefined;

        if (char == ' ')
          alias = 'whitespace';
        else if (char == '\t')
          alias = 'tab';

        result.push(new Prism.Token('plain', char, alias));
      }
    }
  }

  while (cursor.peekChar() !== null) {
    consumeAndHoldWhitespace()?.();

    let nextChar = cursor.nextChar();

    if (nextChar === null)
      break;

    if (nextChar == '\'' || nextChar == '"') {
      const quoteChar = nextChar;
      let stringBuf = nextChar;

      while (true) {
        const releaseWhitespace = consumeAndHoldWhitespace();

        if (releaseWhitespace != null && stringBuf.length != 0) {
          result.push(new Prism.Token('string', stringBuf));
          stringBuf = '';
          releaseWhitespace();
        }

        let nextChar = cursor.nextChar();

        if (nextChar == null)
          break;

        stringBuf += nextChar;

        if (stringBuf.length > 1 && stringBuf[stringBuf.length - 2] == '\\')
          continue;

        if (nextChar == quoteChar)
          break;
      }

      result.push(new Prism.Token('string', stringBuf));
      continue;
    }

    const keywords = ['true', 'false', 'null'];
    let locatedKeyword: string | null = null;

    for (const keyword of keywords) {
      if (nextChar != keyword.charAt(0))
        continue;

      if (input.includes(keyword, cursor.nextCharIndex - 1)) {
        locatedKeyword = keyword;

        for (let i = 1; i < keyword.length; ++i)
          cursor.nextChar();

        break;
      }
    }

    if (locatedKeyword != null) {
      result.push(new Prism.Token('keyword', locatedKeyword));
      continue;
    }

    if (/[a-z]/i.test(nextChar)) {
      let identifierBuf = nextChar;

      while (true) {
        if (!/[a-z_]/.test(cursor.peekChar() || ''))
          break;

        identifierBuf += cursor.nextChar();
      }

      result.push(new Prism.Token('identifier', identifierBuf));
      continue;
    }

    if (/\d|-/.test(nextChar)) {
      let numberBuf = nextChar;
      let hadDecimal = nextChar == '.';
      let emitDotDot = false;

      while (true) {
        let peekChar = cursor.peekChar();

        if (!/\d|\./.test(peekChar || ''))
          break;

        if (peekChar == '.') {
          if (hadDecimal) {
            if (numberBuf.charAt(numberBuf.length - 1) == '.') {
              numberBuf = numberBuf.substring(0, numberBuf.length - 1);
              cursor.nextChar();
              emitDotDot = true;
            }

            break;
          }

          hadDecimal = true;
        }

        numberBuf += cursor.nextChar();
      }

      if (numberBuf != '-') {
        result.push(new Prism.Token('number', numberBuf));

        if (emitDotDot)
          result.push(new Prism.Token('operator', '..'));

        continue;
      }
    }

    if (['+', '-', '*', '/', '%', '^', '&', '?', ':', '@'].includes(nextChar)) {
      result.push(new Prism.Token('operator', nextChar));
      continue;
    }

    if (['>', '<'].includes(nextChar)) {
      let operator = nextChar;

      if (cursor.peekChar() == '=')
        operator += cursor.nextChar();

      result.push(new Prism.Token('operator', operator));
      continue;
    }

    if (['[', ']', '(', ')', '.', ','].includes(nextChar)) {
      result.push(new Prism.Token('punctuation', nextChar));
      continue;
    }

    if (['|', '&', '?', '=', '.'].includes(nextChar) && cursor.peekChar() == nextChar) {
      result.push(new Prism.Token('operator', nextChar + cursor.nextChar()));
      continue;
    }

    if (nextChar == '!') {
      if (cursor.peekChar() == '=') {
        cursor.nextChar();
        result.push(new Prism.Token('operator', "!="));
        continue;
      }

      result.push(new Prism.Token('operator', nextChar));
      continue;
    }

    if (nextChar == '~') {
      let peek = cursor.peekChar();
      if (peek == '^' || peek == '_' || peek == '#' || peek == '!' || peek == '-' || peek == '?' || peek == '|' || peek == '<') {
        result.push(new Prism.Token('operator', nextChar + cursor.nextChar()));
        continue;
      }
    }

    result.push(new Prism.Token('plain', nextChar));
  }

  return result;
};

Prism.languages['markup-expression'] = {
    placeholder: /.*/s,
};

Prism.hooks.add('after-tokenize', env => {
  if (env.language != 'markup-expression')
    return;

  env.tokens = tokenizeMarkupExpression(env.code);
});