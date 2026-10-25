# ECodeBlock

A block of code with a copy button. For code inside a sentence use [`EHighlight`](../Highlight/README.md) with `code`, and [`ECopyButton`](../CopyButton/README.md) to copy a value without showing it as code.

```vue
<ECodeBlock lang="ts" code="npm install @eos-ui/vue" />
```

For your own highlighting, put the markup in the slot. The button copies the text of the first `<pre>`:

```vue
<ECodeBlock lang="vue">
<pre v-html="highlighted" />
</ECodeBlock>
```

Blocks that sit back to back with no gap (a plain container, or an `EStack` with `gap="0"`) join into one box that shares a single hairline and is rounded only at its outer corners. Give them a gap and each is a separate rounded block, so choose one or the other.

`lineNumbers` numbers plain `code` by itself. With your own markup, wrap each line in an element with the class `line`, as Shiki does.

## Props

<!-- props:start -->

| Prop          | Type      | Default                            | Notes                                                                                                                                           |
| ------------- | --------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`        | `string`  | None                               | The text to show, as plain text. Leave it out to use the slot and put your own highlighted markup there.                                        |
| `lang`        | `string`  | None                               | The language, such as `ts` or `vue`. A common one is read by its name ("TypeScript") as the name of the code group.                             |
| `label`       | `string`  | `the language's name, else "Code"` | Names the code group for screen readers, instead of the language.                                                                               |
| `copyLabel`   | `string`  | `"Copy code"`                      | The copy button's name. Say what is copied when a page has several.                                                                             |
| `wrap`        | `boolean` | `false`                            | Wraps long lines instead of scrolling sideways.                                                                                                 |
| `lineNumbers` | `boolean` | `false`                            | Numbers the lines. Plain `code` is numbered by itself; your own markup needs each line in an element with the class `line` (Shiki writes them). |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. The messages `copyCode` and `copied` ("Copied") are configurable.

## Slots

| Slot      | Use                                        |
| --------- | ------------------------------------------ |
| `default` | Your own highlighted `<pre><code>` markup. |

## Accessibility

- The code sits in a `group` named by `label`, else by the language (`ts` is read "TypeScript"). While it scrolls sideways the group is a tab stop, so the keys scroll it, also with your own slot markup.
- "Copied" is announced politely through the page's shared announcer (see `useAnnouncer`). If the clipboard is blocked nothing is copied and "Couldn't copy" is announced.
- Nothing is highlighted for you, so your colours must meet contrast.

## Keyboard

| Key                                       | Action                                                             |
| ----------------------------------------- | ------------------------------------------------------------------ |
| Tab                                       | Moves focus to the code while it scrolls, then to the copy button. |
| Arrow keys, Page Up, Page Down, Home, End | Scrolls the code region when it is focused.                        |
| Enter, Space                              | Presses the copy button.                                           |

## Related

[`EKbd`](../Kbd/README.md) for a key in a sentence.
