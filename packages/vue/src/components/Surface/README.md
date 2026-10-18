# ESurface

The flat, outlined card that every content block is made of: StatementCard, AppointmentCard, Panel, the totals box and Toast all render a Surface.

```vue
<ESurface as="article" pad="md">
  <h2>October statement</h2>
  <template #actions><EButton>Pay</EButton></template>
</ESurface>
```

## Props

| Prop   | Type                             | Default   | Notes                                                                                     |
| ------ | -------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `as`   | `string`                         | `div`     | The element. Use `article`, `section` or `aside` for a real block.                        |
| `pad`  | `"sm" \| "md" \| "lg"`           | none      | Padding. Omit for none.                                                                   |
| `tone` | `"default" \| "tint" \| "float"` | `default` | `tint` is the tinted look; `float` is the lifted look of a Toast.                         |
| `clip` | `boolean`                        |           | Hides what overflows the rounded corners. Not needed with `actions`, which already clips. |

`class`, `style`, `id`, `role`, `aria-*` and `data-*` fall through to the root element.

## Slots

| Slot      | Use                                                                    |
| --------- | ---------------------------------------------------------------------- |
| `default` | The content.                                                           |
| `actions` | Buttons for a bar at the foot of the card, edge to edge. See EActions. |

With the `actions` slot the Surface renders `.e-surface--actions`: a column with an `.e-surface-body` (which takes the remaining height and carries `pad`) followed by the bar. In a Grid, cards in a row end level and each bar sits at the foot. The bar is a `footer` when `as` is `article`, `section` or `aside`, and a `div` otherwise.

## Rules

- A Surface never lifts or highlights on hover: depth means "you can click this". If the whole card is clickable, build it from a link or a button inside, not by adding hover to the Surface.
- Put a heading in every Surface that stands alone, so screen reader users can jump to it.
- When it is a `section` or `aside` with a role that needs a name, give it `aria-label` or `aria-labelledby`.
- In print the shadow is replaced by a 1px black border and the card does not break across pages.
