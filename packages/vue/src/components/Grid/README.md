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

| Prop      | Type                                                      | Default   | Notes                                                                                                                                                                                      |
| --------- | --------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`      | `ElementTag`                                              | `"div"`   | The element to render, such as `ul` with `li` children. `ul` and `ol` lose their bullets and padding and keep their list role.                                                             |
| `min`     | `string`                                                  | `"16rem"` | The narrowest a column may be, as a CSS length. One column below that.                                                                                                                     |
| `gap`     | `GapToken \| string`                                      | `"loose"` | `tight`, `snug`, `base`, `loose` or `section` (the gap tokens), or a space token number (1 to 8, 10, 12 or 16) for `var(--e-space-N)`. A string is used as given, so any CSS length works. |
| `align`   | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | None      | Aligns each item inside its row. Items stretch to the tallest by default. Not used with `masonry`.                                                                                         |
| `justify` | `"start" \| "center" \| "end" \| "stretch"`               | None      | Places each item inside its column when it is narrower than the column. Items fill the column by default. Not used with `masonry`.                                                         |
| `masonry` | `boolean`                                                 | `false`   | Packs cards of uneven height into columns with no gaps under the short ones. Items flow top to bottom within each column.                                                                  |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element. The default `gap` is `loose` (16px); `gap` takes the same values as on [`EStack`](../Stack/README.md). `min` is the narrowest a column may be: columns fill the width and drop to fewer as the grid narrows. `align` and `justify` place each item inside its cell and are ignored with `masonry`.

With `masonry` the grid is CSS multi-column: `min` is the column width, the gap applies between columns and between rows, and items keep their own height. Items flow top to bottom within each column, then on to the next, so the visual order is column by column, not row by row. Put the most important cards first.

## Slots

| Slot      | Use        |
| --------- | ---------- |
| `default` | The cards. |

## Accessibility

- Layout only, with no role. The DOM order is the reading and focus order, so do not rely on visual position to convey sequence.
- Give each card its own heading or accessible name.
- For a list of items use `as="ul"` with `li` children so the count is announced. The bullets and padding are removed and `role="list"` is set, so Safari keeps the list semantics.

## Keyboard

| Key | Action                                                                         |
| --- | ------------------------------------------------------------------------------ |
| Tab | The grid is layout only and adds no tab stops; focus follows the source order. |

## Related

[`EStack`](../Stack/README.md) for a column, [`EInline`](../Inline/README.md) for a row.
