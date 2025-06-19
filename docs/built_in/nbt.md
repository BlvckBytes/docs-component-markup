---
sidebar_position: 5
---

# NBT

Substitutes the NBT-value at a given path as retrieved from various sources; this tag acts as
a placeholder and must thereby be self-closing (does not accept content).

## Block

Retrieves data from a block within the player's world.

| Attribute   | Type       | Mandatory | Description                      |
|-------------|------------|-----------|----------------------------------|
| coordinates | Scalar     | yes       | Coordinates of the block         |
| path        | Scalar     | yes       | Path of NBT-value                |
| separator   | Markup     | no        | Separator for list-items         |
| interpret   | true/false | no        | Interpreted values as components |

```component-markup
<block-nbt
  coordinates="123 43 -87"
  path="my.path"
  separator={
    <gray>,
  }
/>
```

## Entity

Retrieves data from an entity within the player's world.

| Attribute   | Type       | Mandatory | Description                      |
|-------------|------------|-----------|----------------------------------|
| selector    | Scalar     | yes       | Target selector                  |
| path        | Scalar     | yes       | Path of NBT-value                |
| separator   | Markup     | no        | Separator for list-items         |
| interpret   | true/false | no        | Interpreted values as components |

```component-markup
<entity-nbt
  selector="@e[limit=5,sort=nearest]"
  path="my.path"
  separator={
    <gray>,
  }
/>
```

## Storage

Retrieves data from a resource-location or command-storage.

| Attribute   | Type       | Mandatory | Description                      |
|-------------|------------|-----------|----------------------------------|
| key         | Scalar     | yes       | Resource location                |
| path        | Scalar     | yes       | Path of NBT-value                |
| separator   | Markup     | no        | Separator for list-items         |
| interpret   | true/false | no        | Interpreted values as components |

```component-markup
<storage-nbt
  key="my.resource"
  path="my.path"
  separator={
    <gray>,
  }
/>
```