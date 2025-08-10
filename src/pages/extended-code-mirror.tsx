import React, { ReactNode, useRef } from 'react';
import { useThemeConfig } from '@docusaurus/theme-common';
import { EditorState, Extension, RangeSet, RangeSetBuilder, StateField, Transaction } from '@codemirror/state';
import { tokenize } from '../custom-prism/component-markup';
import { Decoration, EditorView, Tooltip, ViewPlugin, ViewUpdate, showTooltip } from '@codemirror/view';
import { linter, Diagnostic } from "@codemirror/lint";
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import useIsBrowser from '@docusaurus/useIsBrowser';

// ================================================================================
// Token Style-Classes
// ================================================================================

export const injectTokenStyle = () => {
  const { prism } = useThemeConfig();

  const syntaxStylesClass = "syntax-highlighting-styles";

  if (document.querySelector('.' + syntaxStylesClass) != null)
    return;

  const styleElement = document.createElement("style");
  styleElement.className = syntaxStylesClass;
  document.head.appendChild(styleElement);

  let styleString = "";

  for (const style of prism.darkTheme.styles) {
    let classStringNormal = "";
    let classStringAlt = "";

    for (const type of style.types) {
      classStringNormal += (classStringNormal.length == 0 ? "" : ", ") + ".tk-" + type;
      classStringAlt += (classStringAlt.length == 0 ? "" : ", ") + ".tk-" + type + "-alt";
    }

    classStringNormal += "{";
    classStringAlt += "{";

    for (const property of Object.getOwnPropertyNames(style.style)) {
      const rule = property + ": " + style.style[property] + ";";

      classStringNormal += rule;
      classStringAlt += rule;
    }

    classStringAlt += "filter: saturate(30%);"

    classStringNormal += "}";
    classStringAlt += "}";

    styleString += (styleString.length == 0 ? "" : " ") + classStringNormal + " " + classStringAlt;
  }

  styleElement.innerHTML = styleString;
};

// ================================================================================
// Token Mapping
// ================================================================================

interface HighlightToken {
  from: number;
  to: number;
  value: string;
  className: string;
}

export const decideClassName = (type: string, value: string | null = null): string | undefined => {
  switch (type) {
    case "ANY__WHITESPACE":
      if (value == '\n')
        return undefined;

      return "tk-whitespace";
    case "ANY__ESCAPE_SEQUENCE":
      return "tk-char";
    case "MARKUP__COMMENT":
      return "tk-comment";
    case "MARKUP__PLAIN_TEXT":
      return "tk-content";
    case "MARKUP__PUNCTUATION__TAG":
      return "tk-class-name-alt";
    case "EXPRESSION__LITERAL":
      return "tk-keyword";
    case "EXPRESSION__STRING":
    case "MARKUP__STRING":
      return "tk-string";
    case "MARKUP__NUMBER":
    case "EXPRESSION__NUMBER":
      return "tk-number";
    case "MARKUP__IDENTIFIER__TAG":
      return "tk-class-name";
    case "MARKUP__IDENTIFIER__BINDING":
    case "EXPRESSION__IDENTIFIER_ANY":
      return "tk-variable";
    case "MARKUP__IDENTIFIER__ATTRIBUTE_USER":
    case "MARKUP__IDENTIFIER__ATTRIBUTE_INTRINSIC":
      return "tk-keyword";
    case "ANY__INTERPOLATION":
    case "MARKUP__PUNCTUATION__SUBTREE":
    case "MARKUP__PUNCTUATION__BINDING_SEPARATOR":
    case "MARKUP__PUNCTUATION__EQUALS":
    case "EXPRESSION__PUNCTUATION__ANY":
    case "MARKUP__OPERATOR__SPREAD":
    case "MARKUP__OPERATOR__NEGATE":
    case "MARKUP__OPERATOR__INTRINSIC_LITERAL":
    case "MARKUP__OPERATOR__INTRINSIC_EXPRESSION":
    case "MARKUP__OPERATOR__DYNAMIC_ATTRIBUTE":
    case "MARKUP__OPERATOR__CAPTURE":
    case "EXPRESSION__OPERATOR__ANY":
      return "tk-operator";
  }
};

// ================================================================================
// ComponentMarkup Tokenizer
// ================================================================================

export interface TokenizerResult {
  tokens: HighlightToken[] | null;
  errorMessage: string | null;
  errorBeginIndex: number;
  renderResult: HTMLElement[] | null;
};

export const getTokenizerResult = (input: string, lenient: boolean, expression: boolean, interpret: boolean): TokenizerResult => {
  let renderResult: HTMLElement[] | null = null;

  try {
    let tokens: HighlightToken[] = [];

    // By convention with the TeeVM script; most efficient way to pass token-data

    window["onEmitComponents"] = (components: HTMLElement[]) => {
      for (const component of components)
        component.className += " rendered-component-line";

      renderResult = components;
    };

    window["onEmitToken"] = (type: string, beginIndexInclusive: number, endIndexExclusive: number, value: string) => {
      tokens.push({
        from: beginIndexInclusive,
        to: endIndexExclusive,
        value: value,
        className: decideClassName(type, value),
      });
    };

    const { errorMessage, errorCharIndex } = tokenize(input, lenient, expression, interpret);

    if (errorMessage != null) {
      return {
        tokens: [{
          from: 0,
          to: input.length,
          value: input,
          className: undefined
        }],
        errorMessage,
        errorBeginIndex: errorCharIndex,
        renderResult
      };
    }

    return {
      tokens,
      errorMessage,
      errorBeginIndex: errorCharIndex,
      renderResult
    };
  } catch(e) {
    let message: string;

    if (e instanceof Error)
      message = e.message;
    else
      message = JSON.stringify(e);

    return {
      tokens: [{
        from: 0,
        to: input.length,
        value: input,
        className: undefined
      }],
      errorMessage: 'threw: ' + message,
      errorBeginIndex: 1,
      renderResult
    }
  }
};

// ================================================================================
// CodeMirror Editor
// ================================================================================

const customizedEditorTheme = EditorView.theme(
  {
    "&.cm-editor": {
      fontSize: "16px",
      borderRadius: ".4rem",
      overflow: "hidden",
      border: "var(--ifm-table-border-width) solid var(--ifm-table-border-color)"
    },
    ".cm-content": {
      padding: "1rem"
    },
    ".cm-scroller": {
      lineHeight: "1.5"
    },
    ".cm-lineNumbers": {
      padding: "0 .3rem"
    },
    ".cm-gutters": {
      borderRight: "1px solid var(--ifm-table-border-color) !important",
    },
    "&.cm-focused": {
      outline: "none !important"
    },
  },
  {
    dark: true
  }
);

export default function ExtendedCodeMirror({
  value, language, editable = false, activeLine = false, lenient = false, interpret = false
} : {
  value: string,
  language: string,
  editable?: boolean,
  activeLine?: boolean,
  lenient?: boolean,
  interpret?: boolean,
}): ReactNode {
  const isBrowser = useIsBrowser();

  if (isBrowser)
    injectTokenStyle();

  type TokenizerFunction = (input: string) => TokenizerResult;
  let tokenizerFunction: TokenizerFunction = null;

  const wrapperReference = useRef<HTMLDivElement>(null);

  const extensions: Extension[] = [
    customizedEditorTheme,
  ];

  if (isBrowser) {
    if (language == "component-markup")
      tokenizerFunction = input => getTokenizerResult(input, lenient, false, interpret);

    else if (language == "markup-expression")
      tokenizerFunction = input => getTokenizerResult(input, false, true, false);
  }

  // ================================================================================
  // Syntax Highlighting
  // ================================================================================

  const tokenizerResultState = StateField.define<TokenizerResult>({
    create: function (state: EditorState): TokenizerResult {
      if (tokenizerFunction == null)
        return { tokens: [], errorMessage: null, errorBeginIndex: -1, renderResult: null };

      return tokenizerFunction(state.doc.toString());
    },
    update: function (value: TokenizerResult, transaction: Transaction): TokenizerResult {
      if (!transaction.docChanged)
        return value;

      return this.create(transaction.state);
    }
  });

  const tokenHighlightExtension = ViewPlugin.fromClass(
    class TokenHighlightPlugin {
      decorations: ReturnType<typeof Decoration.set>;

      constructor(view: EditorView) {
        this.decorations = this.build(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged)
          this.decorations = this.build(update.view);
      }

      build(view: EditorView): RangeSet<Decoration> {
        const builder = new RangeSetBuilder<Decoration>();
        const tokenizeResult = view.state.field(tokenizerResultState);

        if (tokenizeResult.tokens != null) {
          for (const token of tokenizeResult.tokens)
            builder.add(token.from, token.to, Decoration.mark({ class: token.className }));
        }

        return builder.finish();
      }
    },
    { decorations: plugin => plugin.decorations, }
  );

  const renderResultInjectorExtension = ViewPlugin.fromClass(
    class RenderResultInjector {

      private obfuscatedTerminals: Element[] = [];
      private charPool: string;

      constructor(view: EditorView) {
        // All chars which have been omitted from the printable ASCII-range are not of equal width
        this.charPool = 'ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789abcdeghjmnopqrsuvwxyz§$%&=?^/\\-#_';
        this.inject(view);

        setInterval(() => this.updateObfuscatedTerminals(), 50);
      }

      private randomObfuscationChar() {
        return this.charPool.charAt(Math.floor(Math.random() * this.charPool.length));
      }

      update(update: ViewUpdate) {
        if (update.docChanged)
          this.inject(update.view);
      }

      updateObfuscatedTerminals() {
        for (const obfuscatedTerminal of this.obfuscatedTerminals) {
          const contents = (obfuscatedTerminal as HTMLElement).innerText;
          let newValue = "";

          for (let char of contents) {
            if (char == ' ' || char == '\t') {
              newValue += char;
              continue;
            }

            newValue += this.randomObfuscationChar();
          }

          (obfuscatedTerminal as HTMLElement).innerText = newValue;
        }
      }

      attachToObfuscatedTerminals(components: HTMLElement[]) {
        this.obfuscatedTerminals = [];

        for (const component of components)
          this.collectObfuscatedTerminals(component, this.obfuscatedTerminals);
      }

      collectObfuscatedTerminals(element: Element, bucket: Element[], isActive: boolean = false) {
        isActive ||= element.classList.contains('rendered-component--obfuscated');

        let childCount = element.children.length;

        if (isActive && childCount == 0) {
          bucket.push(element);
          return;
        }

        for (let childIndex = 0; childIndex < childCount; ++childIndex)
          this.collectObfuscatedTerminals(element.children[childIndex], bucket, isActive);
      }

      inject(view: EditorView) {
        const { renderResult } = view.state.field(tokenizerResultState);

        if (renderResult == null)
          return;

        const wrapper = wrapperReference.current;

        const resultClass = 'component-render-result';
        let resultContainer = wrapper.querySelector('.' + resultClass);

        if (!resultContainer) {
          resultContainer = document.createElement("div");
          resultContainer.classList = resultClass;
          wrapper.appendChild(resultContainer);
        }

        this.attachToObfuscatedTerminals(renderResult);

        resultContainer.replaceChildren(...renderResult);
      }
    }
  );

  // ================================================================================
  // Error-Tooltip
  // ================================================================================

  const errorTooltipExtension = StateField.define<Tooltip | null>({
    create(state) {
      const tokenizeResult = state.field(tokenizerResultState);

      if (tokenizeResult.errorMessage == null)
        return null;

      return {
        pos: tokenizeResult.errorBeginIndex,
        above: true,
        create() {
          const dom = document.createElement("div");
          dom.textContent = tokenizeResult.errorMessage,
          dom.style.background = "rgba(0, 0, 0, 0.8)";
          dom.style.border = "1px solid rgba(255, 0, 0, 0.4)";
          dom.style.color = "red";
          dom.style.padding = "4px 8px";
          dom.style.borderRadius = "4px";
          dom.style.fontSize = "0.9em";
          dom.style.pointerEvents = "none";
          return { dom };
        }
      };
    },
    update(value, transaction) {
      if (!transaction.docChanged)
        return value;

      return this.create(transaction.state);
    },
    provide: f => showTooltip.from(f)
  });

  const errorLinterExtension = linter(
    (view) => {
      const tokenizeResult = view.state.field(tokenizerResultState);
      const diagnostics: Diagnostic[] = [];

      if (tokenizeResult.errorMessage == null)
        return diagnostics;

      diagnostics.push({
        from: tokenizeResult.errorBeginIndex,
        to: tokenizeResult.errorBeginIndex + 1,
        severity: "error",
        message: tokenizeResult.errorMessage,
        markClass: "tk-error",
      });

      return diagnostics;
    },
    {
      delay: 0
    }
  );

  if (tokenizerFunction != null) {
    extensions.push(
      tokenizerResultState,
      tokenHighlightExtension,
      renderResultInjectorExtension,
      errorLinterExtension,
      errorTooltipExtension
    );

    language = undefined;
  }

  return (
    <div style={{textAlign: 'left', marginBottom: '1rem'}} ref={wrapperReference}>
      <CodeMirror
        value={value}
        extensions={extensions}
        theme={vscodeDark}
        lang={language}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          indentOnInput: false,
          bracketMatching: false,
          closeBrackets: false,
          autocompletion: false,
          highlightActiveLine: activeLine,
          syntaxHighlighting: true,
          highlightActiveLineGutter: activeLine,
        }}
        editable={editable}
      />
    </div>
  );
};