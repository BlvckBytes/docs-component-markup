---
sidebar_position: 1
---

# Introduction

Components are an integral part of how Minecraft renders text, possibly containing data, styles and interactive elements; they represent a standardised and ubiquitous format, guiding various slots like chat, action-bar, score-board, title/subtitle, tablist header/footer, playerlist-entries, inventory-titles, item name/lore and so on and so forth. That being said, the format underwent many breaking changes and has gotten quite some additions as the game matured over the years.

While there are broadly accepted "solutions" in existence, they all fail to satisfy at least one of the following criteria: readability, extensibility, expressive power, performance and platform-independence; all of these shortcomings have been taken into account when designing this little templating language.

## Readability

As for readability and maintainability, we employ proper XML-syntax with named attributes instead of trying to compress information ad-absurdum; also, components as arguments are not mere strings, but fully fledged markup.

```component-markup
<hover-item
  name={<red>My tooltip}
  lore={
    <green>First line<br/>
    <aqua>Second line<br/>
    <gold>Third line
  }
>
  <blue>Go ahead and hover over me! :)
</>
```

## Extensibility

Power-users may define their own tags with ease, being able to generate content and rewrite tag-members by working with the AST; learn about the details over at [Defining Tags](./defining_tags.md).

## Expressive Power

With the majority of existing systems, templating seems to be an afterthought and is usually solved by substituting variables at the level of the input-string before parsing the final expression. This language supports not only the evaluation of flexible [Expressions](./expression_syntax.md) at runtime, but also comes with conditionals, loops and variable-binding; the sky is the limit!

```component-markup
<gray>
  Online players:<space/>
  <red
    *for-player_name="player_names"
    *if="player_name != 'Steve'"
    let-position_number="loop.index + 1"
    for-separator={<gray>, }
  >
    <run-command
      [value]="'/tp ' + player_name"
    >#{{position_number}} {{player_name}}</>
  </>
</>
```

Make sure to check out the [Tag Syntax](./tag_syntax.mdx) as to ensure effective and frictionless use of this language!

## Performance

The overwhelming majority of expressions, especially those of higher complexity, will be stored within configuration-files and thereby remain static during the uptime of the server or until the file has been reloaded by the plugin. By parsing said expressions only once at startup while validating their correctness, this step can be saved on for every single evaluation at runtime. Also, we employ an event-style parser and generator, saving on needless allocations. With these optimisations in mind, performance reached a level where all messages, items and the like may be described by markup and be rendered in real time, without having to take the resource-hit.

## Platform Independence

Nothing about the process of evaluating markup should be artificially bound to any specific platform or version which is why both the component-generator as well as the component-applicator are to be provided by the API-user, all with a range of ready-to-use implementations being at their disposal. This library is designed to be shaded into the final project, keeping the footprint minimal and not causing the headache of having to depend on the platform providing crucial features.
