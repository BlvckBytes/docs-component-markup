import React, {type ComponentProps, createContext, useContext } from 'react';
import Head from '@docusaurus/Head';
import Admonition from '@theme/Admonition';
import Mermaid from '@theme/Mermaid';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import Pre from '@theme/MDXComponents/Pre';
import Li from '@theme/MDXComponents/Li';
import Ul from '@theme/MDXComponents/Ul';
import Details from '@theme/Details';
import Heading from '@theme/Heading';
import Img from '@theme/MDXComponents/Img';
import InlineCode from '@site/src/components/InlineCode';
import type {MDXComponentsObject} from '@theme/MDXComponents';
import ExtendedCodeMirror from '@site/src/pages/extended-code-mirror';
import useIsBrowser from '@docusaurus/useIsBrowser';

export const InPreContext = createContext(false);

function SmartCode(props: { children: React.ReactNode; className?: string }) {
  const isBrowser = useIsBrowser();
  const inPre = useContext(InPreContext);

  if (!isBrowser)
    return <>Code-Blocks are only available within the browser</>

  const { children, className } = props;

  if (className || inPre) {
    const classPrefix = "language-";

    if (typeof children === 'string' && className.startsWith(classPrefix)) {
      const language = className.substring(classPrefix.length);

      if (language == "java")
        return <CodeBlock {...props} />;

      return <ExtendedCodeMirror language={language} lenient={true} value={children.trim()} />
    }

    return <CodeBlock {...props} />
  }

  const raw = String(children).trim();
  const match = raw.match(/^([a-z]+(-[a-z]+)*):\s+(.+)/);

  if (match) {
    let [, lang, , code] = match;

    // Convenient short-hand to save space
    if (lang == 'l-me')
      lang = 'markup-expression';
    else if (lang == 'l-cm')
      lang = 'component-markup';

    return <InlineCode language={lang}>{code}</InlineCode>
  }

  return <InlineCode>{raw}</InlineCode>
}

export function WrappedPre(props: any) {
  return (
    <InPreContext.Provider value={true}>
      <Pre {...props } />
    </InPreContext.Provider>
  );
}

const MDXComponents: MDXComponentsObject = {
  Head,
  details: Details,
  Details: Details,
  code: SmartCode,
  a: Link,
  pre: WrappedPre,
  ul: Ul,
  li: Li,
  img: Img,
  h1: (props: ComponentProps<'h1'>) => <Heading as="h1" {...props} />,
  h2: (props: ComponentProps<'h2'>) => <Heading as="h2" {...props} />,
  h3: (props: ComponentProps<'h3'>) => <Heading as="h3" {...props} />,
  h4: (props: ComponentProps<'h4'>) => <Heading as="h4" {...props} />,
  h5: (props: ComponentProps<'h5'>) => <Heading as="h5" {...props} />,
  h6: (props: ComponentProps<'h6'>) => <Heading as="h6" {...props} />,
  admonition: Admonition,
  mermaid: Mermaid,
};

export default MDXComponents;
