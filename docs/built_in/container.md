---
sidebar_position: 1
---

# Container/Substitution

## Container

Whenever intrinsic attributes are to be applied to a multitude of tags all at once and said members
are not already wrapped by another tag due to the nature of the template at hand, simply wrap them in an
invisible container-tag such that they become logically grouped. This kind of grouping may come in handy 
as soon as conditionals, loops or bindings are to be employed to a greater scope.

```!!component-markup
<container *if="render_count % 2 eq 0">
  <red>Hello, world!</><br/>
  <green>Hello, world!</><br/>
  <blue>Hello, world!</>
</>
<container *else>
  <red>Goodbye, world!</><br/>
  <green>Goodbye, world!</><br/>
  <blue>Goodbye, world!</>
</>
```

## Substitution

### Conditional Substitution

Let's say that a substitution is to be rendered conditionally - simply make use of
[Substitution Syntax](../tag_syntax.mdx#template-substitution) in combination with conditionals.

```!!component-markup
<container
  *let-first_component={<red>Hello, component!}
  *let-second_component={<aqua>Bye, component!}
>
  <$first_component *if="render_count % 2 eq 0" />
  <$second_component *else />
```

### Parameterized Substitution

In order to parameterize a substitution and thereby gain access to reusable components,
simply define attribute key-value-pairs, which will be introduced as let-bindings into the
scope of the substituted markup.

```!!component-markup
<container
  *let-my_component={<rainbow><b>Well hello there, dear <&f>{name}</>!}
>
  <$my_component name="Steve" />
  <br/>
  <$my_component name="Alex" />