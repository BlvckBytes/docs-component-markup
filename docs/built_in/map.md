---
sidebar_position: 0
---

# Map

In order to map an iterable to a list of scalar- or component values which can then
be, say, passed to another tag via attribute-binding, this built-in tag supports doing
so through special notation. Similar to some intrinsic attributes like `*for-` and `*let-`,
the map tag specifies the binding-name of the resulting list after the dash in it's
tag-name, i.e. `map-`; said variable is then introduced into the scope of the tag.

Other than that, one simply needs to specify an `iterable` and a so-called `mapper`,
which is being evaluated at each iteration, with the current item being introduced as
`item`, including a `loop`-variable analogous to that of the `*for` intrinsic attribute.

The mapper-attribute may either be an expression to become a scalar value or markup
to become a rendered, platform-native component.

## Examples

### Word-Wrapping Dynamic Counts

Let there be a map containing an arbitrary number of named counts - fruit in this case, but
one could easily imagine them being Minecraft item-types instead. Now, these are to be
displayed in an item's lore, which by itself does not wrap text.

Each entry is first formatted as desired by the mapper, such that we can then pass the list
of formatted entry-strings to the `word-wrap`-tag, using the spread-operator. Last but not
least, tokens are highlighted based on a regex.

```!component-markup
<map-my_list
  *let-my_map="{'Banana': 5, 'Apple': 10, 'Orange': 3, 'Watermelon': 7, 'Blueberry': 2, 'Papaya': 14}"
  [iterable]="my_map"
  mapper=`{my_map[item]}x {item}`
>
  <&7><word-wrap
    [@value]="my_list"
    width=30
    value-separator={,<space/>}
    token-renderer={
      <&e *use="token matches '^\d+x$'">{token}
    }
  />
```

Alternatively, one can also build the whole string at once using plain-text markup, which
is arguably the more direct approach to this issue (the solution above is but an example
to show off the functionality of the map-tag; there may be other cases where one absolutely
requires items to be mapped individually, though).

```!component-markup
<container
  *let-my_map="{'Banana': 5, 'Apple': 10, 'Orange': 3, 'Watermelon': 7, 'Blueberry': 2, 'Papaya': 14}"
  +let-my_string={
    <container *for-item="my_map" *for-separator={,<space/>}>
      {my_map[item]}x {item}
  }
>
  <&7><word-wrap
    [my_string]
    width=30
    token-renderer={
      <&e *use="token matches '^\d+x$'">{token}
    }
  />
```