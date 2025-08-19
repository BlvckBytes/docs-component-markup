---
sidebar_position: 1
---

# Introduction

Components are an integral part of how Minecraft renders text, possibly containing data, styles and interactive elements; they represent a standardised and ubiquitous format, guiding various slots like chat, action-bar, score-board, title/subtitle, tablist header/footer, playerlist-entries, inventory-titles, item name/lore and so on and so forth. That being said, the format underwent many breaking changes and has gotten quite some additions as the game matured over the years.

## Design-Criteria

While there are broadly accepted "solutions" in existence, they all fail to satisfy at least one of the following criteria: readability, extensibility, expressive power, performance and platform-independence; all of these shortcomings have been taken into account when designing this little templating language.

### Readability

As for readability and maintainability, we employ proper XML-syntax with named attributes instead of trying to compress information ad-absurdum; also, components as arguments are not mere strings, but fully fledged markup.

```!component-markup
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

### Extensibility

Power-users may define their own tags with ease, being able to generate content and rewrite tag-members by working with the AST; learn about the details over at the [Extension API](./extension_api).

### Expressive Power

With the majority of existing systems, templating seems to be an afterthought and is usually solved by substituting variables at the level of the input-string before parsing the final expression. This language supports not only the evaluation of flexible [Expressions](./expression_syntax) at runtime, but also comes with conditionals, loops and variable-binding; the sky is the limit!

```!component-markup
<gray>
  Online players:<space/>
  <red
    *for-player_name="['Alex', 'Steve', 'Notch', 'BlvckBytes']"
    *if="player_name neq 'Steve'"
    *let-position_number="loop.index + 1"
    *for-separator={<gray>,<space/>}
  >
    <!-- Just as a visual example - could also be <run-command/> -->
    <hover-text
      value=`/tp {player_name}`
    >#{position_number} {player_name}</>
  </>
</>
```

Make sure to check out the [Tag Syntax](./tag_syntax) as to ensure effective and frictionless use of this language!

### Performance

The overwhelming majority of expressions, especially those of higher complexity, will be stored within configuration-files and thereby remain static during the uptime of the server or until the file has been reloaded by the plugin. By parsing said expressions only once at startup while validating their correctness, this step can be saved on for every single evaluation at runtime. Also, we employ an event-style parser and generator, saving on needless allocations. With these optimisations in mind, performance reached a level where all messages, items and the like may be described by markup and be rendered in real time, without having to take the resource-hit.

### Platform Independence

Nothing about the process of evaluating markup should be artificially bound to any specific platform or version which is why both the component-generator as well as the component-applicator are to be provided by the API-user, all with a range of ready-to-use implementations being at their disposal. This library is designed to be shaded into the final project, keeping the footprint minimal and not causing the headache of having to depend on the platform providing crucial features.

## Roadmap

To be frank, getting all of the countless little details and edge-cases of this custom language just right, not to speak of the user-experience when it comes to actually integrating it into existing projects, is quite the herculean task; especially for a single developer. There's no need to pretend like the project is going to be field-ready any time soon. That said, progress is coming along rather well, with the architecture continuously maturing over time. So, which chunks of work are up ahead?

- Finalizing the API of the `ComponentConstructor`
  - Implementing the `ComponentConstructor` for the whole desired version-range
  - Coming up with a simple solution to load them on-demand from a repo (possibly including local caching)
- Designing the `ComponentApplicator` from the ground up (yet uncharted territory)

...and possibly a few other bits and bobs, :).