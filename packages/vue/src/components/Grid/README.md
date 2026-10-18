# EGrid

Cards in as many equal columns as fit. It responds to the width of its own container (no media query), so the same Grid is three columns on the page and one in a drawer. Use it for lists of StatementCards or AppointmentCards.

```vue
<EGrid min="15rem" :gap="3"><ESurface>...</ESurface></EGrid>
```

## Props

| Prop  | Type               | Default | Notes                                                                           |
| ----- | ------------------ | ------- | ------------------------------------------------------------------------------- |
| `min` | `string`           | `16rem` | The narrowest a column may be. One column below that. Set through `--e-min`.    |
| `gap` | `number \| string` | `4`     | A space token number (1, 2, 3, 4, 6, 8) or a CSS length. Set through `--e-gap`. |
| `as`  | `string`           | `div`   | The element, for example `ul` with `li` children.                               |

`class`, `style` and attributes fall through to the root. The default slot holds the cards.

## Rules

- Items stretch to the tallest card in their row, so a card whose name wraps never leaves its neighbours short, and each card's actions bar stays level at the foot (see ESurface `actions`).
- Not to be confused with the DataGrid; this class is `e-grid-layout`.
