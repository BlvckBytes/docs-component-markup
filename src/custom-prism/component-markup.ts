import { Prism } from 'prism-react-renderer';
import { tokenizeMarkupExpression } from './markup-expression';

class OutputBuilder {
  constructor(public tokens: Prism.Token[]) {}

  tagName(value: string) {
    this.tokens.push(new Prism.Token('tag', value));
  }

  punctuation(value: string) {
    if (value == '>' || value == '<' || value == '/') {
      this.tokens.push(new Prism.Token('tag', value, 'tag-punctuation'));
      return;
    }

    this.tokens.push(new Prism.Token('punctuation', value));
  }

  expression(value: string) {
    this.tokens.push(...tokenizeMarkupExpression(value));
  }

  text(value: string) {
    let buffer = '';

    for (let char of value) {
      if (char == ' ' || char == '\t') {
        if (buffer.length > 0) {
          this.tokens.push(new Prism.Token('plain', buffer, 'text'));
          buffer = '';
        }

        this.whitespace(char);
        continue;
      }

      buffer += char;
    }

    if (buffer.length > 0)
      this.tokens.push(new Prism.Token('plain', buffer, 'text'));
  }

  comment(value: string) {
    this.tokens.push(new Prism.Token('comment', value));
  }

  attributeName(value: string) {
    let firstChar = value.charAt(0);
    let lastChar = value.charAt(value.length - 1);

    if (firstChar == '*') {
      this.punctuation(firstChar);

      if (value.startsWith('*for-')) {
        this.tokens.push(new Prism.Token('keyword', 'for'));
        this.punctuation('-');
        value = value.substring(5);
      }
      else
        value = value.substring(1);
    }

    if (firstChar == '[' && lastChar == ']') {
      this.punctuation('[');
      this.tokens.push(new Prism.Token('keyword', value.substring(1, value.length - 1)));
      this.punctuation(']');
      return;
    }

    if (value.startsWith('let-')) {
      this.tokens.push(new Prism.Token('keyword', 'let'));
      this.punctuation('-');
      value = value.substring(4);
    }

    this.tokens.push(new Prism.Token('keyword', value));
  }

  stringContents(value: string, attributeName: string) {
    this.tokens.push(new Prism.Token('string', '"'));

    let c = attributeName.charAt(0);

    if (c == '*' || c == '[' && attributeName.charAt(attributeName.length - 1) == ']' || attributeName.startsWith("let-"))
      this.expression(value);
    else
      this.tokens.push(new Prism.Token('string', value));

    this.tokens.push(new Prism.Token('string', '"'));
  }

  literal(value: string) {
    this.tokens.push(new Prism.Token('keyword', value));
  }

  number(value: string) {
    this.tokens.push(new Prism.Token('number', value));
  }

  whitespace(value: string) {
    if (value.length == 0)
      return;

    for (let char of value) {
      let alias = undefined;

      if (char == ' ')
        alias = 'whitespace';
      else if (char == '\t')
        alias = 'tab';

      this.tokens.push(new Prism.Token('plain', char, alias));
    }
  }
}

class InputCursor {

  public nextCharIndex: number = 0;

  constructor(public input: string, private output: OutputBuilder) {}

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

  consumeWhitespace(doOutput = true) {
    let buf = '';

    while (/\s/.test(this.peekChar() || ''))
      buf += this.nextChar();

    if (doOutput && buf.length > 0) {
      this.output.whitespace(buf);
    }

    return buf;
  }
}

class SubstringBuilder {
  private startInclusive: number;
  private endExclusive: number;

  constructor(private input: string) {
    this.resetIndices();
  }

  private resetIndices() {
    this.startInclusive = -1;
    this.endExclusive = 0;
  }

  hasStartSet(): boolean {
    return this.startInclusive >= 0;
  }

  hasEndSet(): boolean {
    return this.endExclusive > 0;
  }

  setStartInclusive(index: number) {
    this.resetIndices();
    this.startInclusive = index;
  }

  setEndExclusive(index: number) {
    if (index == 0)
      throw new Error("End-exclusive cannot be zero");

    this.endExclusive = index;
  }

  build(): string {
    if (this.startInclusive < 0)
      throw new Error("Cannot build a substring without a determined start");

    if (this.endExclusive == 0)
      throw new Error("Cannot build a substring without a determined end");

    const result = this.input.substring(this.startInclusive, this.endExclusive);
    this.resetIndices();
    return result;
  }
}

class InStringDetector {
  private stackBits: number = 0;
  private stackSize: number = 0;

  onEncounter(c: string) {
    let isSingleQuote = c == '\'';

    if (!isSingleQuote && c != '"')
      return;

    let bitMask = 1;

    if (this.stackSize > 1)
      bitMask <<= this.stackSize - 1;

    if (this.stackSize == 0 || ((this.stackBits & bitMask) == 0) == isSingleQuote) {
      if (++this.stackSize != 1)
        bitMask <<= 1;

      // If that's exceeded, there's something horribly wrong with the input...
      if (this.stackSize == 64 + 1)
        throw new Error("Maximum quote-stack-depth exceeded");

      if (isSingleQuote)
        this.stackBits |= bitMask;
      else
        this.stackBits &= ~bitMask;

      return;
    }

    --this.stackSize;
  }

  public isInString() {
    return this.stackSize != 0;
  }

  public reset() {
    this.stackSize = 0;
  }
}

class MarkupParser {

  private substringBuilder: SubstringBuilder;
  private inStringDetector: InStringDetector;

  constructor(private cursor: InputCursor, private output: OutputBuilder) {
    this.substringBuilder = new SubstringBuilder(cursor.input);
    this.inStringDetector = new InStringDetector();
  }

  parseInput() {
    this._parseInput(false);
  }

  private isIdentifierChar(c: string) {
    if (c < '!' || c > '~')
      return false;

    switch (c) {
      case '<':
      case '>':
      case '{':
      case '}':
      case '\\':
      case '/':
      case '\'':
      case '"':
      case '=':
        return false;
      default:
        return true;
    }
  }

  private tryParseIdentifier() {
    if (!this.isIdentifierChar(this.cursor.peekChar()))
      return null;

    this.substringBuilder.setStartInclusive(this.cursor.nextCharIndex);

    this.cursor.nextChar();

    while (this.isIdentifierChar(this.cursor.peekChar()))
      this.cursor.nextChar();

    this.substringBuilder.setEndExclusive(this.cursor.nextCharIndex);

    return this.substringBuilder.build();
  }

  private tryConsumeCommentTag(tagName: string) {
    if (tagName !== "!--")
      return false;

    let savedPosition = this.cursor.nextCharIndex;

    while (this.cursor.peekChar() != '-')
      this.cursor.nextChar();

    if (this.cursor.nextChar() != '-' || this.cursor.nextChar() != '-') {
      this.cursor.nextCharIndex = savedPosition;
      return false;
    }

    if (this.cursor.nextChar() != '>') {
      this.cursor.nextCharIndex = savedPosition;
      return false;
    }

    return true;
  }

  private parseStringAttributeValue() {
    if (this.cursor.nextChar() != '"')
      throw new Error("Expected opening double-quotes");

    this.substringBuilder.setStartInclusive(this.cursor.nextCharIndex);

    let encounteredEnd = false;
    let priorChar: string | null = null;

    while (this.cursor.peekChar() !== null) {
      let currentChar = this.cursor.nextChar();

      if (currentChar == '"') {
        if (priorChar != '\\') {
          encounteredEnd = true;
          this.substringBuilder.setEndExclusive(this.cursor.nextCharIndex - 1);
          break;
        }
      }

      priorChar = currentChar;
    }

    if (!encounteredEnd)
      throw new Error('UNTERMINATED_STRING');

    return this.substringBuilder.build();
  }

  private doesEndOrHasTrailingWhiteSpaceOrTagTermination() {
    if (this.cursor.peekChar() == null)
      return true;

    let peekedChar = this.cursor.peekChar();

    if (/\s/.test(peekedChar))
      return true;

    return peekedChar == '>';
  }

  private parseNumericAttributeValue() {
    this.substringBuilder.setStartInclusive(this.cursor.nextCharIndex);

    if (this.cursor.peekChar() == '-')
      this.cursor.nextChar();

    this.cursor.consumeWhitespace();

    let encounteredDecimalPoint = false;
    let encounteredDigit = false;

    while (this.cursor.peekChar() !== null) {
      let peekedChar = this.cursor.peekChar();

      if (peekedChar >= '0' && peekedChar <= '9') {
        this.cursor.nextChar();
        encounteredDigit = true;
        continue;
      }

      if (peekedChar == '.') {
        if (encounteredDecimalPoint)
          throw new Error('MALFORMED_NUMBER');

        this.cursor.nextChar();
        encounteredDecimalPoint = true;
        continue;
      }

      break;
    }

    if (!encounteredDigit)
      throw new Error('MALFORMED_NUMBER');

    if (!this.doesEndOrHasTrailingWhiteSpaceOrTagTermination())
      throw new Error('MALFORMED_NUMBER');

    this.substringBuilder.setEndExclusive(this.cursor.nextCharIndex);
    this.output.number(this.substringBuilder.build());
  }

  private tryParseAttribute() {
    this.cursor.consumeWhitespace();

    let attributeName = this.tryParseIdentifier();

    if (attributeName == null) {
      if (this.cursor.peekChar() == '"') {
        this.cursor.nextChar();
        throw new Error('EXPECTED_ATTRIBUTE_KEY');
      }

      return false;
    }

    // Attribute-identifiers do not support leading digits, as this constraint allows for
    // proper detection of malformed input; example: my-attr 53 (missing an equals-sign).
    if (/\d/.test(attributeName.charAt(0)))
      throw new Error('EXPECTED_ATTRIBUTE_KEY');

    this.output.attributeName(attributeName);

    this.cursor.consumeWhitespace();

    if (this.cursor.peekChar() != '=') {
      // These "keywords" are reserved; again - for proper detection of malformed input.
      if (attributeName.toLowerCase() == "true" || attributeName.toLowerCase() == "false")
        throw new Error('EXPECTED_ATTRIBUTE_KEY');

      // Flag attribute
      return true;
    }

    this.output.punctuation("=");

    this.cursor.nextChar();

    this.cursor.consumeWhitespace();

    switch (this.cursor.peekChar()) {
      case '"':
        this.output.stringContents(this.parseStringAttributeValue(), attributeName);
        return true;

      case '{':
        this.cursor.nextChar();
        this.output.punctuation('{');

        this._parseInput(true);

        let nextChar = this.cursor.nextChar();

        if (nextChar != '}')
          throw new Error('UNTERMINATED_SUBTREE');

        this.output.punctuation('}');
        return true;

      case 'T':
      case 't':
        for (let c of "true") {
          if (this.cursor.nextChar().toLowerCase() != c)
            throw new Error('MALFORMED_LITERAL_TRUE');
        }

        if (!this.doesEndOrHasTrailingWhiteSpaceOrTagTermination())
          throw new Error('MALFORMED_LITERAL_TRUE');

        this.output.literal('true');
        return true;

      case 'F':
      case 'f':
        for (let c of "false") {
          if (this.cursor.nextChar().toLowerCase() != c)
            throw new Error('MALFORMED_LITERAL_FALSE');
        }

        if (!this.doesEndOrHasTrailingWhiteSpaceOrTagTermination())
          throw new Error('MALFORMED_LITERAL_FALSE');

        this.output.literal('false');
        return true;

      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '.':
      case '-':
        this.parseNumericAttributeValue();
        return true;

      default:
        throw new Error('UNSUPPORTED_ATTRIBUTE_VALUE');
    }
  }

  private parseOpeningOrClosingTag() {
    let beginning = this.cursor.nextCharIndex;

    if (this.cursor.nextChar() != '<')
      throw new Error("Expected an opening pointy-bracket!");

    let pendingWhitespace = this.cursor.consumeWhitespace(false);

    let wasClosingTag = false;

    if (this.cursor.peekChar() == '/') {
      this.cursor.nextChar();
      wasClosingTag = true;
    }

    let tagName = this.tryParseIdentifier();

    if (wasClosingTag) {
      if (this.cursor.nextChar() != '>')
        throw new Error('UNTERMINATED_TAG');

      this.output.whitespace(pendingWhitespace);
      this.output.punctuation('<');
      this.output.punctuation('/');

      if (tagName != null)
        this.output.tagName(tagName);

      this.output.punctuation('>');
      return;
    }

    if (tagName == null)
      throw new Error('MISSING_TAG_NAME');

    if (this.tryConsumeCommentTag(tagName)) {
      this.output.comment(this.cursor.input.substring(beginning, this.cursor.nextCharIndex));
      return;
    }

    this.output.whitespace(pendingWhitespace);
    this.output.punctuation('<');
    this.output.tagName(tagName);

    while (this.cursor.peekChar() !== null) {
      if (!this.tryParseAttribute())
        break;
    }

    if (this.cursor.peekChar() == '/') {
      this.cursor.nextChar();
      this.output.punctuation('/');
    }

    this.cursor.consumeWhitespace();

    if (this.cursor.nextChar() != '>')
      throw new Error('UNTERMINATED_TAG');

    this.output.punctuation('>');
  }

  private _parseInput(isWithinCurlyBrackets: boolean) {
    let priorChar: string | null = null;

    while (this.cursor.peekChar() !== null) {
      if (this.cursor.peekChar() == '}' && priorChar !== '\\') {
        if (isWithinCurlyBrackets)
          break;

        // Let's not do this for syntax highlighting, as to be able to show
        // what processed inputs become (which strip the escape-sequence).
        // throw new Error('UNESCAPED_CLOSING_CURLY');
      }

      let preConsumePosition = this.cursor.nextCharIndex;
      let possibleNonTextBeginIndex = this.cursor.nextCharIndex;

      if (this.cursor.peekChar() == '{') {
        this.cursor.nextChar();

        if (this.cursor.peekChar() == '{') {
          this.cursor.nextChar();

          if (this.substringBuilder.hasStartSet()) {
            this.substringBuilder.setEndExclusive(possibleNonTextBeginIndex);
            this.output.text(this.substringBuilder.build());
          }

          this.substringBuilder.setStartInclusive(this.cursor.nextCharIndex);

          while (this.cursor.peekChar() !== null) {
            let possiblePreTerminationIndex = this.cursor.nextCharIndex;
            let c = this.cursor.nextChar();

            this.inStringDetector.onEncounter(c);

            if (this.inStringDetector.isInString())
              continue;

            if (c == '}' && this.cursor.peekChar() == '}') {
              this.cursor.nextChar();
              this.substringBuilder.setEndExclusive(possiblePreTerminationIndex);
              break;
            }
          }

          if (!this.substringBuilder.hasEndSet())
            throw new Error('UNTERMINATED_INTERPOLATION');

          this.inStringDetector.reset();

          this.output.punctuation('{{');
          this.output.expression(this.substringBuilder.build());
          this.output.punctuation('}}');
          continue;
        }

        this.cursor.nextCharIndex = preConsumePosition;
      }

      let pendingWhitespace = this.cursor.consumeWhitespace(false);

      if (this.cursor.peekChar() == '<') {
        if (this.substringBuilder.hasStartSet()) {
          this.substringBuilder.setEndExclusive(possibleNonTextBeginIndex);
          this.output.text(this.substringBuilder.build());
        }

        this.output.whitespace(pendingWhitespace);
        this.parseOpeningOrClosingTag();
        priorChar = null;
        continue;
      }

      this.cursor.nextCharIndex = preConsumePosition;

      let nextCharIndex = this.cursor.nextCharIndex;
      let nextChar = this.cursor.nextChar();

      if (!this.substringBuilder.hasStartSet())
        this.substringBuilder.setStartInclusive(nextCharIndex);

      if (nextChar == '\\' && (this.cursor.peekChar() == '<' || this.cursor.peekChar() == '}'))
        nextChar = this.cursor.nextChar();

      priorChar = nextChar;

      this.cursor.consumeWhitespace(false);
    }

    if (this.substringBuilder.hasStartSet()) {
      this.substringBuilder.setEndExclusive(this.cursor.nextCharIndex);
      this.output.text(this.substringBuilder.build());
    }
  }
}

Prism.languages['component-markup'] = {
    placeholder: /.*/s,
};

Prism.hooks.add('after-tokenize', env => {
  if (env.language != 'component-markup')
    return;

  let outputBuilder = new OutputBuilder([]);
  let inputCursor = new InputCursor(env.code, outputBuilder);

  try {
    new MarkupParser(inputCursor, outputBuilder).parseInput();
  } catch (error) {
    console.error(error);
  }

  env.tokens = outputBuilder.tokens;
});