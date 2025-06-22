---
sidebar_position: 2
---

# Tag Syntax

This markup-language has been heavily inspired by XML while also making various domain-specific improvements as to reduce friction when trying to depict component-templates. The following overview will outline its features and facets one by one, all while explaining why these patterns are in place.

## Special Characters

All text other than tags themselves which is also outside of placeholder-notation is not constrained in any way, besides the very few exceptions discussed below; keeping syntactic noise to a bare minimum is a conscious design-decision.

### Opening Pointy-Brackets

Literal opening pointy-brackets are **always** to be marked by a leading backslash in order to avoid them erroneously being interpreted as the beginning of a tag. The input

```component-markup
This text does not open a \<new tag! :)
```

becomes

```txt
This text does not open a <new tag! :)
```

once processed.

### Closing Curly-Brackets

Literal closing curly-brackets are **always** to be marked by a leading backslash in order to avoid them erroneously being interpreted as the premature end of a tag-attribute's markup-value, as said markup-values are delimited by a matching pair of curly brackets.

```component-markup
<my-tag
  my-attribute={
    <red>This curly bracket \} does not close the attribute's input!
  }
/>
```

The value of `my-attribute` will become

```component-markup
<red>This curly bracket } does not close the attribute's input!
```

once processed. It does *not* matter whether the text is within one such delimiting block - closing curly-brackets are to be escaped unconditionally, as to avoid having to differentiate and thus make code-fragments become context-sensitive (=brittle).

### Opening Double Curly-Brackets

Due to placeholder-notation, as to avoid two back-to-back opening curly-brackets being erroneously interpreted as the beginning of a placeholder slot, simply introduce a placeholder of the desired value being a string-literal. The input

```component-markup
Double {{"{{"}} curly-brackets!
```

becomes

```txt
Double {{ curly-brackets!
```

once processed. This again is a conscious design-decision, as the aforementioned case will only occur very seldomly and not having to prepend every single opening curly-bracket with a backslash is going to reduce syntactic noise in the great scheme of things.

## Placeholders

In order to substitute variables and various expressions in general into designated slots, said expressions are simply to be wrapped twice by a pair of matching curly-brackets. Let's assume that the variable `player` holds a string-value of `"Steve"`, then the markup

```component-markup
<red>Hello, {{player}}!
```

becomes

```component-markup
<red>Hello, Steve!
```

once processed.

## Tags

Tags represent calls to internally existing functionality, which then can modify and or generate content dynamically; see [Built-In](./category/built-in) to discover predefined features and check out [Defining Tags](./defining_tags.md) as to learn about creating your own. There are two types of notation: one being comprised of an opening- and a (optional) closing-tag, while the other self-closes within the opening-tag and thereby does not bear any content.

### Opening And Closing

When invoking a tag which holds content, the tag becomes enabled to modify said members in order to implement various visual and/or generative transformations. The opening-tag is simply surrounded by pointy-brackets `<name>`, while the closing-tag has to be equally named, with the addition of a slash right before said name `</name>`.

```component-markup
<red>
  <bold>Some bold text</bold>
  <italic>Some italic text
</red>
```

In the example above, both the `bold` and `italic` passages will be colored `red`, as they are members of the corresponding invocation to colorise; as can be seen also, the `italic`-tag's closing has been omitted, which will be carried out implicitly once its parent closes, or the very end of the code has been reached. For simple scenarious, implicit closing can help with brevity, but for complex templates, it is not advised to rely on this feature, as unexpected implications may follow which add needless mental overhead regarding their reader and maintainer.

### Self-Closing

Tags which bear no content, as they simply insert data retrieved externally or mark special instructions, self-close by adding a slash right before the closing pointy-bracket `<name/>`.

```component-markup
The tag <my-tag/> self-closes and thus needs no corresponding closing-tag!
```

### Attributes

All opening-tags, including the self-closing kind, may support a variety of attributes - be they simple scalar values or more complex markup.

```component-markup
<my-tag
  a="my value"
  b=5
  c=3.42
  d=true
  e=false
  f
  g={
    <red>Hello, world!
  }
/>
```

In the example above, `a` is of type string (sequence of characters), `b` of type whole number, `c` of type floating-point number, `d` and `e` of type boolean, `f` also of type boolean (as a "flag", indicating `true`) and `g` being a markup-value, delimited by curly-brackets. In general, the only differentiation occurs between markup-values and scalar-values (string, number, boolean), where the latter will never cause a type-mismatch and simply be interpreted as required.

Attributes of scalar types also support dynamic values, meaning values which are not specified immediately but rather are to be retrieved by evaluating an expression; to indicate this behaviour, simply enclose the attribute-name by a pair of square-brackets `[]`.

```component-markup
<my-tag
  [my-attribute]="user.name"
/>
```

Now, `my-attribute` will be assigned to whatever value the expression `user.name` evaluates to.

Attributes which support multiple values may be assigned more than once - each occurrence will be collected and passed to the tag as a list when executing it, maintaining the top-down order of assignment.

```component-markup
<translate
  key="chat.type.advancement.challenge"
  with={<green>Username}
  with={<green>Challenge-Name}
/>
```

In the above example, the two values of `with` will be matched with the two placeholders of the `challenge` translation-message by the client; such messages may have a different number of slots, with component-markup allowing the user to specify as many values as necessary.

### Let-Bindings

Each tag, no matter its underlying implementation, supports binding the result of expressions to temporary variables whose lifetime spans the content of said tag. While there are many uses for this feature, one of the simplest will be to extract complex common expressions. In order to introduce such a binding, make use of the reserved `let-` attribute namespace, where the identifier after the dash denotes the name of the newly introduced temporary variable; the attribute-value is **always** interpreted as an expression (square brackets must **not** be added explicitly).

```component-markup
<red let-my_var="my.complex.extracted.expression">
  <bold>First use {{my_var}} of it</bold>
  <italic>Second use {{my_var}} of it</italic>
</red>
```

Please note that variables, by enforced convention, always follow the `snake_case`-style, meaning being all lower-case with spaces represented as underscores. In contrast, tag- as well as attribute-names enforce the same pattern, just with the alteration of them swapping out underscores for hyphens, making it become `kebab-case`. By this simple yet effective differentiation, it is immediately visually obvious to which realm an identifier belongs to.

### Conditionals

The simplest form of a conditional is represented by the intrinsic `*if`-directive, which is **always** treated as an expression (square brackets must **not** be added explicitly); if matching, the tag to which it is applied shows up and if not, the tag will not be evaluated.

```component-markup
<red *if="my_condition">Shown if the condition matches!</red>
```

Once a conditional has been declared as can be seen above, the directives `*else-if` as well as `*else` are now available to its direct siblings, meaning elements which succeed it on the same level of nesting.

```component-markup
<red *if="my_number == 1">Shown if the value is one!</red>
<red *else-if="my_number == 2">Shown if the value is two!</red>
<red *else-if="my_number == 3">Shown if the value is three!</red>
<red *else>Shown if the value is anything else!</red>
```

The `*else-if`-branches are evaluated in the order they are specified in and only once the main `*if`-condition failed; once an `*else-if`-conditional matched, all others, including the `*else`-fallthrough will not evaluate; if all conditions fail, the `*else`-case will show up in the result (note that it has no value assigned and also does not accept one, for logical reasons).

These `*if`-/`*else-if`-/`*else`-sequences need to be organised as a single block of subsequent members, meaning that there cannot be any intermediate nodes not being part of the case-decision; if that is desired, simply use standalone `*if`-clauses.

Multiple such sequences may coexist one after another on the same level of depth, separated by their initial `*if`-conditional; they may also be nested to any arbitrary complexity. This way, nuanced decisions may be depicted with minimal syntactic effort.

```component-markup
<!-- First independent block -->
<red *if="condition_1">Shown when condition 1 is met!</red>
<red *else>Shown if condition 1 is not met!</red>

<!-- Second independent block -->
<red *if="condition_2">
  <!-- Nested conditionals -->
  <bold *if="condition_3">Shown when both condition 2 and 3 are met!</bold>
  <italic *else>Shown when only condition 2 is met!</italic>
</red>
<red *else>Shown if condition 2 is not met!</red>
```

### Generative Loops

In order to generate content based on a sequence of data-points, the intrinsic `*for-`-directive may be employed; it is a mere attribute that can be added to any existing tag, instantiating it once for each point of data. In order to assign the current item to an accessible variable, specify its name right after the hyphen of the directive, akin to [Let-Bindings](#let-bindings). The value is **always** interpreted as an expression (square brackets must **not** be added explicitly). Once employed, the additional attribute `for-separator` becomes available, accepting an optional markup-value to be injected inbetween iterations.

```component-markup
<gray>Online players: <red
  *for-player_name="player_names"
  for-separator={<gray>, }
>{{player_name}}</red>
```

The example above will generate the `red` tag once for each name in the list, injecting the `gray` separators inbetween iterations. If items are to be skipped based on a [Condition](#conditionals), simply also add in the corresponding `*if`-directive.

Let's skip names equal to `Steve`:

```component-markup
<gray>Online players: <red
  *for-player_name="player_names"
  *if="player_name != 'Steve'"
  for-separator={<gray>, }
>{{player_name}}</red>
```
In this context, meaning when combined with a loop, the `*if`-condition may not be chained with `*else-if`/`*else`-directives, as it does not control whether the *node* is rendered, but whether an *iteration* is rendered, and thereby becomes attached with a completely different meaning. For more nuanced control, consider adding conditions on child-tags.

Let's render an alternate name for `Steve`:

```component-markup
<gray>
  Online players:
  <container
    *for-player_name="player_names"
    for-separator={<gray>, }
  >
    <green *if="player_name == 'Steve'">Alternate Name Here</green>
    <red *else>{{player_name}}</red>
  </container>
</gray>
```

Additional information is made available via the implicitly added temporary variable called `loop`; it also only exists for the duration of the tag-contents to which the `*for-`-directive has been applied to. It itself holds the following useful properties, updated for each iteration:

- `index`: Zero-based sequence-number of the current element
- `is_even`: Whether the `index` is an even number
- `is_odd`: Whether the `index` is an odd number
- `is_first`: Whether the item is the first of the sequence
- `is_last`: Whether the item is the last of the sequence

For single loops, accessing this variable directly marks the most straight-forward way; let's add positions (`#1`, `#2`, ...) to the prior example.

```component-markup
<gray>Online players: <red
  *for-player_name="player_names"
  *if="player_name != 'Steve'"
  for-separator={<gray>, }
>#{{loop.index + 1}} {{player_name}}</red>
```

To generate multiple elements per iteration, make use of the invisible `container`-tag:

```component-markup
<container
  *for-player_name="player_names"
  for-separator={<br/>}
>
  <red>First member</red>
  <green>Second member</green>
  <blue>Third member</blue>
  <gold>Greetings, {{player_name}}!</gold>
</container>
```