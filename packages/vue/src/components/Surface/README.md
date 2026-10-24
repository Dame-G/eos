# ESurface

The flat, outlined card that content blocks are built from. Use it for any standalone block of content. It is padded; `flush` removes the padding for a table or image that runs edge to edge. Use [`EDrawer`](../Drawer/README.md) or [`EDialog`](../Dialog/README.md) for content that opens over the page.

```vue
<ESurface as="article" size="lg">
  <h2>October statement</h2>
  <template #actions><EButton>Pay</EButton></template>
</ESurface>
```

## Props

<!-- props:start -->

| Prop      | Type                                                                                                                 | Default | Notes                                                                                                                                                                                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`      | `string`                                                                                                             | `"div"` | The element to render, such as `article`, `section` or `aside` for a real block.                                                                                                                                                                                                     |
| `padding` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 10 \| 12 \| 16 \| "tight" \| "snug" \| "base" \| "loose" \| "section" \| string` | None    | The padding as a gap token (`tight` to `section`), a space token number or a CSS length. This is the way to set the padding; `size` is a shorthand for three presets, and `padding` wins over it.                                                                                    |
| `size`    | `"sm" \| "md" \| "lg"`                                                                                               | `"md"`  | A padding preset: `sm`, `md` or `lg`.                                                                                                                                                                                                                                                |
| `flush`   | `boolean`                                                                                                            | `false` | No padding, so a table, an image or a list can run edge to edge.                                                                                                                                                                                                                     |
| `variant` | `"paper" \| "raised" \| "outline" \| "tinted"`                                                                       | None    | `paper` is a warm ground and a pressed edge, for a statement or receipt. `raised` is the lifted shadow of something floating above the page, such as a Toast. `outline` has no fill, so the page shows through. `tinted` is a tinted ground for a block that sits beside plain ones. |
| `clip`    | `boolean`                                                                                                            | `false` | Hides what overflows the rounded corners. Ignored when there is an `actions` slot.                                                                                                                                                                                                   |

<!-- props:end -->

`class`, `style`, `id`, `role`, `aria-*` and `data-*` land on the rendered element.

## Slots

| Slot      | Use                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | The content.                                                                                                                                   |
| `actions` | Buttons in an edge-to-edge bar at the foot (`EActions`). Cards in a row end level. The bar is a `footer` for `article`, `section` and `aside`. |

`padding` is the way to set the padding: a gap token, a space token number or a CSS length. `size` (`sm`, `md`, `lg`) is a shorthand for three presets, and `flush` removes it.

`variant` is `paper`, `raised`, `outline` (no fill) or `tinted` (a tinted ground).

## Accessibility

- Put a heading in every standalone surface so screen reader users can jump to it.
- Give a `section` or `aside` that has a role needing a name an `aria-label` or `aria-labelledby`.
- A surface never changes on hover. For a card that is one link, use [`ELinkCard`](../LinkCard/README.md); otherwise put a link or button inside it.

Not focusable.

## Related

[`EGrid`](../Grid/README.md) lays cards out in columns and [`EStack`](../Stack/README.md) in a column.
