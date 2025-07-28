import React, { ReactNode } from 'react';
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

const injectTokenStyle = () => {
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

const decideClassName = (type: string, value: string): string | undefined => {
  switch (type) {
    case "ANY__WHITESPACE":
      if (value == '\n')
        return undefined;

      return "tk-whitespace";
    case "MARKUP__COMMENT":
      return "tk-comment";
    case "MARKUP__PLAIN_TEXT":
      return "tk-content";
    case "MARKUP__PUNCTUATION__TAG":
      return "tk-class-name-alt";
    case "MARKUP__LITERAL__ANY":
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
    case "MARKUP__INTERPOLATION":
    case "MARKUP__PUNCTUATION__SUBTREE":
    case "MARKUP__PUNCTUATION__BINDING_SEPARATOR":
    case "MARKUP__PUNCTUATION__EQUALS":
    case "EXPRESSION__PUNCTUATION__ANY":
    case "MARKUP__OPERATOR__SPREAD":
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
};

export const getTokenizerResult = (input: string, lenient: boolean, expression: boolean): TokenizerResult => {
  try {
    let tokens: HighlightToken[] = [];

    // By convention with the TeeVM script; most efficient way to pass token-data
    window["onEmitToken"] = (type: string, beginIndexInclusive: number, endIndexExclusive: number, value: string) => {
      tokens.push({
        from: beginIndexInclusive,
        to: endIndexExclusive,
        value: value,
        className: decideClassName(type, value),
      });
    };

    const { errorMessage, errorCharIndex } = tokenize(input, lenient, expression);

    if (errorMessage != null) {
      return {
        tokens: [{
          from: 0,
          to: input.length,
          value: input,
          className: undefined
        }],
        errorMessage,
        errorBeginIndex: errorCharIndex
      };
    }

    return {
      tokens,
      errorMessage,
      errorBeginIndex: errorCharIndex
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
      errorBeginIndex: 1
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
      overflow: "hidden"
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
      borderRight: "1px solid rgba(255, 255, 255, .15) !important",
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
  value, language, editable = false, activeLine = false, lenient = false 
} : {
  value: string,
  language: string,
  editable?: boolean,
  activeLine?: boolean,
  lenient?: boolean,
}): ReactNode {
  const isBrowser = useIsBrowser();

  if (isBrowser)
    injectTokenStyle();

  type TokenizerFunction = (input: string) => TokenizerResult;
  let tokenizerFunction: TokenizerFunction = null;

  const extensions: Extension[] = [
    customizedEditorTheme,
  ];

  if (isBrowser) {
    if (language == "component-markup")
      tokenizerFunction = input => getTokenizerResult(input, lenient, false);

    else if (language == "markup-expression")
      tokenizerFunction = input => getTokenizerResult(input, false, true);
  }

  // ================================================================================
  // Syntax Highlighting
  // ================================================================================

  const tokenizerResultState = StateField.define<TokenizerResult>({
    create: function (state: EditorState): TokenizerResult {
      if (tokenizerFunction == null)
        return { tokens: [], errorMessage: null, errorBeginIndex: -1 };

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
      tokenHighlightExtension
    );
  }

  if (tokenizerFunction != null) {
    extensions.push(
      errorLinterExtension,
      errorTooltipExtension
    );

    language = undefined;
  }

  return (
    <div style={{textAlign: 'left', marginBottom: '1rem'}}>
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