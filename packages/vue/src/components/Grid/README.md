# EGrid

Cards in as many equal columns as fit, responding to its container's width rather than the screen.

```vue
<EGrid min="15rem" :gap="3">
  <ESurface>...</ESurface>
  <ESurface>...</ESurface>
</EGrid>
```

## Props

<!-- props:start -->

| Prop      | Type               | Default   | Notes                                                                                                                     |
| --------- | ------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `as`      | `string`           | `"div"`   | The element to render, for example `ul` with `li` children.                                                               |
| `min`     | `string`           | `"16rem"` | The narrowest a column may be, as a CSS length. One column below that.                                                    |
| `gap`     | `number \| string` | `4`       | A space token number (1, 2, 3, 4, 6, 8), or any CSS length as a string.                                                   |
| `masonry` | `boolean`          | `false`   | Packs cards of uneven height into columns with no gaps under the short ones. Items flow top to bottom within each column. |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

With `masonry` the grid is CSS multi-column: `min` is the column width, the gap applies between columns and between rows, and items keep their own height. Items flow top to bottom within each column, then on to the next, so the visual order is column by column, not row by row. Put the most important cards first.

## Slots

| Slot      | Use        |
| --------- | ---------- |
| `default` | The cards. |

## Accessibility

- Layout only, with no role. The DOM order is the reading and focus order, so do not rely on visual position to convey sequence.
- Give each card its own heading or accessible name.
- For a list of items use `as="ul"` with `li` children so the count is announced.
