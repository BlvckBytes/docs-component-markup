---
sidebar_position: 1
---

# Container

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

## Nuanced Interpolation

Yet another great use for container-tags is to add more nuances to the basic interpolation-syntax
of `{...}`, by enclosing said invocation into a container with special properties.

### Conditional Interpolation

Let's say that an interpolation is to be rendered conditionally - simply wrap it by a conditional
container, as follows:

```!!component-markup
<container
  *let-first_component={<red>Hello, component!}
  *let-second_component={<aqua>Bye, component!}
>
  <container *if="render_count % 2 eq 0">{first_component}</container>
  <container *else>{second_component}</container>
```

Using containers with a single member as done above becomes tedious rather quickly, since
one is often forced to append a closing-tag, as to preserve a clean hierarchy; for the
sake of convenience, all attributes passed to a **self-closing** `container`-tag are rendered
in declaration-order, allowing to drop the closing-tag without compromise:

```!component-markup
<container
  *let-first_component={<red>Hello, component!}
  *let-second_component={<aqua>Bye, component!}
>
  <container [c]="first_component" c={<br/>} [c]="second_component" />
```

While this feature already reduces some of the mental burden, we may go one step further
and also drop the attribute-names as well as the expression-binding syntax, by employing
the by-name attribute-binding syntax as described in [Tag Syntax](../tag_syntax.mdx),
which is perfectly valid, since `container` does not acknowledge the names of its
attributes - only their values and order.

```!component-markup
<container
  *let-first_component={<red>Hello, component!}
  *let-second_component={<aqua>Bye, component!}
>
  <container &first_component c={<br/>} &second_component />
```

Now once again reformulate the conditional from earlier, with more expressive power this time.

```!!component-markup
<container
  *let-first_component={<red>Hello, component!}
  *let-second_component={<aqua>Bye, component!}
>
  <container *if="render_count % 2 eq 0" &first_component />
  <container *else &second_component />
```

### Parameterized Interpolation

In order to parameterize an interpolation and thereby gain access to reusable components,
simply define the corresponding let-bindings on the container, such that they will become
available to the interpolated component when it gets interpreted.

```!!component-markup
<container
  *let-my_component={<rainbow><b>Well hello there, dear <&f>{name}</>!}
>
  <container +let-name="Steve" &my_component />
  <br/>
  <container +let-name="Alex" &my_component />