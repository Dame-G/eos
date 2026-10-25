# ESurface

The flat, outlined card that content blocks are built from, for any standalone block of content. Use [`EDrawer`](../Drawer/README.md) or [`EDialog`](../Dialog/README.md) for content that opens over the page.

```vue
<ESurface as="article" padding="section">
  <h2>October statement</h2>
  <template #actions><EButton>Pay</EButton></template>
</ESurface>
```

## Props

<!-- props:start -->

| Prop      | Type                                                                                                                 | Default    | Notes                                                                                                                                                                                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`      | `string`                                                                                                             | `"div"`    | The element to render, such as `article`, `section` or `aside` for a real block.                                                                                                                                                                                                     |
| `padding` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 10 \| 12 \| 16 \| "tight" \| "snug" \| "base" \| "loose" \| "section" \| string` | `pad-card` | The padding: a gap name (`tight`, `snug`, `base`, `loose`, `section`), a space token number or a CSS length. Left out, it is the card padding (`pad-card`).                                                                                                                          |
| `flush`   | `boolean`                                                                                                            | `false`    | No padding (`padding="0"`), so a table, an image or a list can run edge to edge.                                                                                                                                                                                                     |
| `variant` | `"paper" \| "raised" \| "outline" \| "tinted"`                                                                       | None       | `paper` is a warm ground and a pressed edge, for a statement or receipt. `raised` is the lifted shadow of something floating above the page, such as a Toast. `outline` has no fill, so the page shows through. `tinted` is a tinted ground for a block that sits beside plain ones. |
| `clip`    | `boolean`                                                                                                            | `false`    | Hides what overflows the rounded corners. Ignored when there is an `actions` slot.                                                                                                                                                                                                   |

<!-- props:end -->

`class`, `style`, `id`, `role`, `aria-*` and `data-*` land on the rendered element.

## Slots

| Slot      | Use                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | The content.                                                                                                                                   |
| `actions` | Buttons in an edge-to-edge bar at the foot (`EActions`). Cards in a row end level. The bar is a `footer` for `article`, `section` and `aside`. |

## Accessibility

- Put a heading in every standalone surface so screen reader users can jump to it.
- Give a `section` or `aside` that has a role needing a name an `aria-label` or `aria-labelledby`.
- A surface never changes on hover. For a card that is one link, use [`ELinkCard`](../LinkCard/README.md); otherwise put a link or button inside it.

Not focusable.

## Related

[`EGrid`](../Grid/README.md) lays cards out in columns and [`EStack`](../Stack/README.md) in a column.
