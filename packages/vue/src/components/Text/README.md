# EText

Running text in three sizes (body, `sm`, `lg`), capped at a readable line length. Use [`EHeading`](../Heading/README.md) for titles and [`EKicker`](../Kicker/README.md) for a small label above a value.

```vue
<EText size="lg">You paid in full on 3 September.</EText>
<EText size="sm" tone="neutral">Receipts are kept for seven years.</EText>
<EText truncate :measure="false">A long file name in a narrow cell</EText>
```

## Props

<!-- props:start -->

| Prop       | Type                                                                   | Default | Notes                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `size`     | `"sm" \| "md" \| "lg"`                                                 | None    | `sm` for captions and fine print, `lg` for the one-sentence reading of a statement. `textScale` rescales both.                                         |
| `tone`     | `"neutral" \| "info" \| "success" \| "warning" \| "danger" \| "muted"` | None    | The colour of the text. Left out, it is the ink colour. `neutral` is the quieter colour of secondary copy. `muted` is a deprecated name for `neutral`. |
| `align`    | `"start" \| "center" \| "end"`                                         | None    | Aligns the lines. `start` and `end` follow the writing direction.                                                                                      |
| `weight`   | `"medium" \| "strong"`                                                 | None    | The weight, instead of the regular one.                                                                                                                |
| `mono`     | `boolean`                                                              | `false` | Sets the text in the mono font, for codes and amounts.                                                                                                 |
| `truncate` | `boolean`                                                              | `false` | Keeps the text to one line and ends it with an ellipsis where it does not fit. Give the element a width to cut it to.                                  |
| `lines`    | `number`                                                               | None    | Cuts the text after this many lines with an ellipsis.                                                                                                  |
| `measure`  | `boolean`                                                              | `true`  | Caps the line at the reading measure (`--e-measure`). `false` lets it fill its cell, as in a flex or grid layout.                                      |
| `as`       | `string`                                                               | `"p"`   | The element to render.                                                                                                                                 |
| `small`    | `boolean`                                                              | `false` | **Deprecated.** Use `size="sm"`.                                                                                                                       |
| `large`    | `boolean`                                                              | `false` | **Deprecated.** Use `size="lg"`.                                                                                                                       |
| `muted`    | `boolean`                                                              | `false` | **Deprecated.** Use `tone="neutral"`.                                                                                                                  |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element. The line length is the `--e-measure` token; `measure="false"` lifts it for text in a flex or grid cell. `tone="neutral"` is the quieter colour of secondary copy. `small`, `large`, `muted` and `tone="muted"` are deprecated: use `size` and `tone="neutral"`. `truncate` needs a width to cut to, and `lines` cuts after that many lines.

## Slots

| Slot      | Use       |
| --------- | --------- |
| `default` | The text. |

## Accessibility

- Neutral text meets contrast but should not carry anything a person must act on.

Not focusable.

## Related

[`EHeading`](../Heading/README.md) for headings, [`EKicker`](../Kicker/README.md) for a small label above one.
