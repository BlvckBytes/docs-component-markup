---
sidebar_position: 1
---

# Container

Whenever intrinsic directives are to be applied to a multitude of tags all at once and said members
are not already wrapped by another tag due to the nature of the template at hand, simply wrap them in an
invisible container-tag such that they become logically grouped. This kind of grouping may come in handy 
as soon as conditionals, loops or bindings are to be employed to a greater scope.

```component-markup
<container *if="my_condition">
  <red>Hello, world!</><br/>
  <green>Hello, world!</><br/>
  <blue>Hello, world!</>
</>
```
