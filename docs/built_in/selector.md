---
sidebar_position: 11
---

# Selector

Substitutes the name of one or more entities as retrieved by a target-selector; this tag acts as a placeholder and must thereby be self-closing (does not accept content).

| Attribute   | Type   | Mandatory | Description              |
|-------------|--------|-----------|--------------------------|
| selector    | Scalar | yes       | Target selector          |
| separator   | Markup | no        | Separator of results     |

```component-markup
<selector
  selector="@e[limit=5,sort=nearest]"
  separator={<red>,}
/>
```