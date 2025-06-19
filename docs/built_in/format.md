---
sidebar_position: 2
---

# Format

Specifys the enclosed content's formats, being either enabled, disabled or unset (default). In order
to reset all prior formatting back to the default, use the corresponding tag:

```component-markup
<reset>My text</reset>
```

## Immediate

Both the full format as well as it's shorthand may be used as tag-names (also supporting the
ubiquitous ampersand-sequences); prepend a bang in order to disable this style (and don't
forget to mirror it in the closing-tag too!). For most cases, the positive version of each
tag will suffice.

<table>
  <thead>
    <tr>
      <th>Format</th>
      <th>Short</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>bold</td>
      <td>
        <code>b</code>
        <p style={{height: '4rem'}}></p>
        <code>&l</code>
      </td>
      <td>
        ```component-markup
        <b>Bold text</b>
        <!b>Non-bold text</!b>
        ```
        ```component-markup
        <&l>Bold text</&l>
        <&!l>Non-bold text</&!l>
        ```
      </td>
    </tr>
    <tr>
      <td>italic</td>
      <td>
        <code>i</code>
        <p style={{height: '4rem'}}></p>
        <code>&o</code>
      </td>
      <td>
        ```component-markup
        <i>Italic text</i>
        <!i>Non-italic text</!i>
        ```
        ```component-markup
        <&o>Italic text</&o>
        <&!o>Non-italic text</&!o>
        ```
      </td>
    </tr>
    <tr>
      <td>underlined</td>
      <td>
        <code>u</code>
        <p style={{height: '4rem'}}></p>
        <code>&n</code>
      </td>
      <td>
        ```component-markup
        <u>Underlined text</u>
        <!u>Non-underlined text</!u>
        ```
        ```component-markup
        <&n>Underlined text</&n>
        <&!n>Non-underlined text</&!n>
        ```
      </td>
    </tr>
    <tr>
      <td>strikethrough</td>
      <td>
        <code>st</code>
        <p style={{height: '4rem'}}></p>
        <code>&m</code>
      </td>
      <td>
        ```component-markup
        <st>Strikethrough text</st>
        <!st>Non-strikethrough text</!st>
        ```
        ```component-markup
        <&m>Strikethrough text</&m>
        <&!m>Non-strikethrough text</&!m>
        ```
      </td>
    </tr>
    <tr>
      <td>obfuscated</td>
      <td>
        <code>obf</code>
        <p style={{height: '4rem'}}></p>
        <code>&k</code>
      </td>
      <td>
        ```component-markup
        <obf>Obfuscated text</obf>
        <!obf>Non-obfuscated text</!obf>
        ```
        ```component-markup
        <&k>Obfuscated text</&k>
        <&!k>Non-obfuscated text</&!k>
        ```
      </td>
    </tr>
  </tbody>
</table>

## Dynamic

If the format is to be driven by data, there exists the explicit tag which takes each individual
style as an attribute of corresponding name, accepting nullable booleans (null means unset).

```component-markup
<format
  [bold]="<expression>"
  [italic]="<expression>"
  [underlined]="<expression>"
  [strikethrough]="<expression>"
  [obfuscated]="<expression>"
>My text</format>
```