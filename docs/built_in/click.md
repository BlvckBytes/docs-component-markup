---
sidebar_position: 3
---

# Click

Specifies what action to run once the enclosed content has been clicked on; please note that
not all actions are supported on all Minecraft versions.

## Open URL

Opens the specified URL when clicking.

| Attribute | Type   | Mandatory | Description |
|-----------|--------|-----------|-------------|
| value     | Scalar | yes       | URL to open |

```component-markup
<open-url value="https://google.com">Open a website</open-url>
```

## Suggest Command

Suggests the specified command within the player's chat-prompt.

| Attribute | Type   | Mandatory | Description        |
|-----------|--------|-----------|--------------------|
| value     | Scalar | yes       | Command to suggest |

```component-markup
<suggest-command value="/my-command">Suggest a command</suggest-command>
```

## Run Command

Executes the specified command using the player's client; some vanilla-commands block this action!

| Attribute | Type   | Mandatory | Description    |
|-----------|--------|-----------|----------------|
| value     | Scalar | yes       | Command to run |

```component-markup
<run-command value="/my-command">Run a command</run-command>
```

## Copy To Clipboard

Copies the specified text to the player's system-clipboard.

| Attribute | Type   | Mandatory | Description  |
|-----------|--------|-----------|--------------|
| value     | Scalar | yes       | Text to copy |

```component-markup
<to-clipboard value="greetings!">Copy to the clipboard</to-clipboard>
```

## Change Page

Changes the page of a book to the specified number; only works within books.

| Attribute | Type   | Mandatory | Description   |
|-----------|--------|-----------|---------------|
| value     | Scalar | yes       | Number of page|

```component-markup
<change-page value=5>To page 5</change-page>
```

## Open File

Opens a local file on the player's computer; this action has been discontinued and should
not be used on modern versions of Minecraft (will be omitted as to avoid errors)!

| Attribute | Type   | Mandatory | Description  |
|-----------|--------|-----------|--------------|
| value     | Scalar | yes       | Path of file |

```component-markup
<open-file value="my-document.txt">Open my document</open-file>
```