---
sidebar_position: 9
---

# Score

Substitutes the Scoreboard-value of a given objective for a provided score-holder; this tag
acts as a placeholder and must thereby be self-closing (does not accept content).

| Attribute   | Type   | Mandatory | Description                |
|-------------|--------|-----------|----------------------------|
| name        | Scalar | yes       | Score-holder name/selector |
| objective   | Scalar | yes       | Name of objective          |
| value       | Scalar | no        | Value override             |

```component-markup
You have died <score
  name="@p"
  objective="deathCount"
/> times!
```