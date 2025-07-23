import { Prism } from 'prism-react-renderer';
import { getTokenizerResult, TokenizerResult } from '../pages/extended-code-mirror';

Prism.languages['component-markup'] = {
    placeholder: /.*/s,
};

Prism.languages['markup-expression'] = {
    placeholder: /.*/s,
};

// While CodeMirror handles multi-line code-blocks, PrismJS takes care of their inline counterparts

Prism.hooks.add('after-tokenize', env => {
  let tokenizerResult: TokenizerResult = null;

  if (env.language == 'component-markup') {
    tokenizerResult = getTokenizerResult(env.code, true, false);
  } else if (env.language == 'markup-expression')
    tokenizerResult = getTokenizerResult(env.code, false, true);

  if (tokenizerResult == null)
    return;

  if (tokenizerResult.tokens == null || tokenizerResult.errorMessage != null) {
    console.error('pos ' + tokenizerResult.errorBeginIndex + ': ' + tokenizerResult.errorMessage);
    console.error(env.code);
    return;
  }

  env.tokens = tokenizerResult.tokens.map(token => new Prism.Token("_", token.value, token.className));
});