# EGrid

Cards in as many equal columns as fit, responding to its container's width rather than the screen.

```vue
<EGrid min="15rem" :gap="3">
  <ESurface>...</ESurface>
  <ESurface>...</ESurface>
</EGrid>
```

## Props

| Prop  | Type               | Default | Notes                                                              |
| ----- | ------------------ | ------- | ------------------------------------------------------------------ |
| `as`  | `string`           | `div`   | The element, for example `ul` with `li` children.                  |
| `min` | `string`           | `16rem` | Narrowest a column may be, as a CSS length; one column below that. |
| `gap` | `number \| string` | `4`     | A space token number (1, 2, 3, 4, 6, 8) or a CSS length.           |

`class`, `style` and attributes land on the rendered element. Items stretch to the tallest in their row.

## Slots

| Slot      | Use        |
| --------- | ---------- |
| `default` | The cards. |

## Accessibility

- Layout only: no role, no landmark, and the DOM order is the reading and focus order. Columns wrap by CSS alone, so the order never changes; do not rely on visual position to convey sequence.
- Items are children you supply; give each card its own heading or accessible name.
- For a list of items use `as="ul"` with `li` children so the count is announced.
