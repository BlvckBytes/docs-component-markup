---
sidebar_position: 12
---

# Shadow

Specifies the enclosed content's shadow-color, supporting either RGB `#RRGGBB` or RGBA `#RRGGBBAA` hexadecimal values as well as vanilla color-constants and sequences, analogous to the [Color](./color.mdx) tag.

| Attribute   | Type   | Mandatory | Description                                       |
|-------------|--------|-----------|---------------------------------------------------|
| value       | Scalar | yes       | Color value                                       |
| opacity     | Scalar | no        | Percentage between `l-me: 0.0` and `l-me: 100.0`  |


```component-markup
<shadow value="red">My text</>
```

```component-markup
<shadow value="#FF02FA">My text</>
```

```component-markup
<shadow value="&6" opacity=55.4>My text</>
```