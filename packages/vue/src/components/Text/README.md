# EText

Running text in three sizes (body, `sm`, `lg`), capped at a readable line length. Use [`EHeading`](../Heading/README.md) for titles and [`EKicker`](../Kicker/README.md) for a small label above a value.

```vue
<EText size="lg">You paid in full on 3 September.</EText>
<EText size="sm" tone="muted">Receipts are kept for seven years.</EText>
<EText truncate :measure="false">A long file name in a narrow cell</EText>
```

## Props

<!-- props:start -->

| Prop       | Type                                                      | Default | Notes                                                                                                                                       |
| ---------- | --------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`     | `"sm" \| "md" \| "lg"`                                    | `"md"`  | `sm` for captions and fine print, `lg` for the one-sentence reading of a statement. `textScale` rescales both.                              |
| `tone`     | `"muted" \| "info" \| "success" \| "warning" \| "danger"` | None    | The colour of the text. Left out, it is the ink colour. `muted` is the quieter colour of secondary copy.                                    |
| `align`    | `"start" \| "center" \| "end"`                            | None    | Aligns the lines. `start` and `end` follow the writing direction.                                                                           |
| `weight`   | `"medium" \| "strong"`                                    | None    | The weight, instead of the regular one.                                                                                                     |
| `mono`     | `boolean`                                                 | `false` | Sets the text in the mono font, for codes and amounts.                                                                                      |
| `truncate` | `boolean`                                                 | `false` | Keeps the text to one line and ends it with an ellipsis where it does not fit. Give the element a width to cut it to. `lines` wins over it. |
| `lines`    | `number`                                                  | None    | Cuts the text after this many lines with an ellipsis.                                                                                       |
| `measure`  | `boolean`                                                 | `true`  | Caps the line at the reading measure (`--e-measure`). `false` lets it fill its cell, as in a flex or grid layout.                           |
| `as`       | `string`                                                  | `"p"`   | The element to render.                                                                                                                      |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use       |
| --------- | --------- |
| `default` | The text. |

## Accessibility

- Muted text meets contrast but should not carry anything a person must act on.

Not focusable.

## Related

[`EHighlight`](../Highlight/README.md) to set off a word inside it.
