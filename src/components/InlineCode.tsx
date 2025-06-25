import React, { ReactNode } from 'react';
import { Highlight } from 'prism-react-renderer';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';

export default function InlineCode({
  children,
  language = '',
}: {
  children: string;
  language?: string;
}): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode } = useColorMode();

  const prismConfig = siteConfig.themeConfig?.prism || {};
  const themeLight = prismConfig['theme'] || {};
  const themeDark = prismConfig['darkTheme'] || {};
  const theme = colorMode === 'dark' ? themeDark : themeLight;

  return (
    <Highlight code={children.trim()} language={language} theme={theme}>
      {({ tokens, getTokenProps }) => (
        <code
          style={{
            ...theme.plain,
            padding: '.35rem .4rem'
          }}
        >
          {tokens[0].map((token, i) => {
            const { style, children, className } = getTokenProps({ token, key: i });
            return (
              <span key={i} style={style} className={className}>
                {children}
              </span>
            );
          })}
        </code>
      )}
    </Highlight>
  );
}