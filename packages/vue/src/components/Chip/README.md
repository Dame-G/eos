# EChip

A small non-interactive pill label for a status. Use a button for anything pressable.

```vue
<EChip tone="success">Paid</EChip>
```

## Props

| Prop      | Type                                                                 | Default   | Notes                                                                                                                                  |
| --------- | -------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `tone`    | `"neutral" \| "ink" \| "success" \| "info" \| "warning" \| "danger"` | `neutral` | `success`: paid, confirmed. `info`: due, scheduled. `warning`: needs attention. `danger`: overdue, failed. `ink` looks like `neutral`. |
| `variant` | `"solid" \| "subtle"`                                                | `solid`   | `solid` is a filled badge with light text; `subtle` is a soft tint with a tone-coloured outline and text.                              |

`class`, `style` and attributes land on the `span` element.

## Slots

| Slot      | Use                                                  |
| --------- | ---------------------------------------------------- |
| `default` | The word. Write sentence case; the chip capitalises. |

## Accessibility

- A `span` read as text: the word carries the meaning, colour only backs it up.
