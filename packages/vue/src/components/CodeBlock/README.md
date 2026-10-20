# ECodeBlock

A block of code with a copy button. For a short word inside a sentence use plain `<code>`.

```vue
<ECodeBlock lang="ts" code="npm install @eos-ui/vue" />
```

For your own highlighting, put the markup in the slot; the button copies the text of the first `<pre>`:

```vue
<ECodeBlock lang="vue">
<pre v-html="highlighted" />
</ECodeBlock>
```

## Props

<!-- props:start -->

| Prop        | Type     | Default       | Notes                                                                                                    |
| ----------- | -------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `code`      | `string` | —             | The text to show, as plain text. Leave it out to use the slot and put your own highlighted markup there. |
| `lang`      | `string` | —             | The language, named for screen readers (the code's accessible name).                                     |
| `copyLabel` | `string` | `"Copy code"` | The copy button's name; say what is copied when a page has several.                                      |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. The messages `copyCode` and `codeCopied` ("Copied") are configurable.

## Slots

| Slot      | Use                                        |
| --------- | ------------------------------------------ |
| `default` | Your own highlighted `<pre><code>` markup. |

## Accessibility

- The `<pre>` is focusable so it scrolls by keyboard; `lang` names it.
- "Copied" is announced politely. If the clipboard is blocked nothing is copied.
- Nothing is highlighted for you; your colours must meet contrast.
