---
sidebar_position: 10
---

# Translate

Substitutes the translation corresponding to the given key using the currently selected
client-language while allowing to set placeholders in retrieved values as well as to provide
a fallback if there was no value with the given key; this tag acts as a placeholder and
must thereby be self-closing (does not accept content).

| Attribute   | Type        | Mandatory | Description              |
|-------------|-------------|-----------|--------------------------|
| key         | Scalar      | yes       | Path of translation      |
| with        | Markup-List | no        | Placeholder-values       |
| fallback    | Markup      | no        | Fallback if non-existent |

```component-markup
<translate
  key="chat.type.advancement.challenge"
  with={
    <green>Username
  }
  with={
    <green>Challenge-Name
  }
  fallback={
    <red>Could not locate key
  }
/>
```