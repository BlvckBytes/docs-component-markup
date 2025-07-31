---
sidebar_position: 8
---

# Space

While whitespace that is wedged in-between plain text and tags will persist, as in

```component-markup
this text <red>
  is newline-separated
```

becoming

```component-markup
this text <red>is newline-separated
```

leading whitespace (i.e. indentation) as well as trailing whitespace gets removed unconditionally.

```component-markup
this text 
  is newline-separated
```

becomes

```component-markup
this textis newline-separated
```

If a single space is to be introduced at the end- or the beginning of a line, use the explicit `<space/>`
tag, such that

```component-markup
this text<space/>
  is newline-separated
```

becomes

```component-markup
this text is newline-separated
```

The `<space/>` tag acts as a mere placeholder and does not bear any content - it must be self-closing. Should
the case ever arise that more than one space are to be inserted, consider using the [Repeat Operator](../expression_syntax#repeat-operator), as follows:

```component-markup
this text{" " ** 5}
  is newline-separated
```

will become

```component-markup
this text     is newline-separated
```