# EChip

A pill label. Its backdrop is the soft tint of its tone and its text is the `-strong` shade, so it reads at 7:1.

```vue
<EChip tone="success">Paid</EChip>
```

## Props

| Prop   | Type                                                                 | Default | Notes                                                                                                                                                                                                         |
| ------ | -------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone` | `"neutral" \| "ink" \| "success" \| "info" \| "warning" \| "danger"` | neutral | `success` (green: paid, confirmed, signed), `info` (blue: due, scheduled, pending), `warning` (amber: needs your attention), `danger` (red: overdue, cancelled, failed). `neutral` and `ink` add no modifier. |

## Slots

| Slot      | What                                                         |
| --------- | ------------------------------------------------------------ |
| `default` | The word. Write sentence case; the chip sets it in capitals. |

Native attributes (`class`, `id`, `data-*`, `aria-*`) land on the `<span>`.

## Rules

- The word carries the meaning; the colour only backs it up.
- Uppercase is automatic. Write sentence case.
- A chip is not interactive. For something that can be pressed, use a Button.

## Accessibility

- A plain `<span>`: it is read as text. Forced colours and print give it a solid outline.
- All tones keep the word at 7:1 or better on their tint (axe checked in the tests).
