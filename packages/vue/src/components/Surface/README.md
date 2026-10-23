# ESurface

The flat, outlined card that content blocks are built from. Use it for any standalone block of content. It is padded; `flush` removes the padding for a table or image that runs edge to edge. Use [`EDrawer`](../Drawer/README.md) or [`EDialog`](../Dialog/README.md) for content that opens over the page.

```vue
<ESurface as="article" large>
  <h2>October statement</h2>
  <template #actions><EButton>Pay</EButton></template>
</ESurface>
```

## Props

<!-- props:start -->

| Prop     | Type                   | Default | Notes                                                                              |
| -------- | ---------------------- | ------- | ---------------------------------------------------------------------------------- |
| `as`     | `string`               | `"div"` | The element to render, such as `article`, `section` or `aside` for a real block.   |
| `small`  | `boolean`              | `false` | Tighter padding.                                                                   |
| `large`  | `boolean`              | `false` | Roomier padding.                                                                   |
| `flush`  | `boolean`              | `false` | No padding, so a table, an image or a list can run edge to edge.                   |
| `pad`    | `"sm" \| "md" \| "lg"` | None    | Deprecated: use `small`, `large` or `flush`. `sm`, `md` and `lg` still work.       |
| `paper`  | `boolean`              | `false` | Warm paper ground and a pressed edge, for a statement or receipt.                  |
| `raised` | `boolean`              | `false` | The lifted shadow of something floating above the page, such as a Toast.           |
| `clip`   | `boolean`              | `false` | Hides what overflows the rounded corners. Ignored when there is an `actions` slot. |

<!-- props:end -->

`class`, `style`, `id`, `role`, `aria-*` and `data-*` land on the rendered element.

## Slots

| Slot      | Use                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | The content.                                                                                                                                   |
| `actions` | Buttons in an edge-to-edge bar at the foot (`EActions`). Cards in a row end level. The bar is a `footer` for `article`, `section` and `aside`. |

The `pad` prop (`sm`, `md`, `lg`) is deprecated: use `small`, `large` or `flush`.

## Accessibility

- Put a heading in every standalone surface so screen reader users can jump to it.
- Give a `section` or `aside` that has a role needing a name an `aria-label` or `aria-labelledby`.
- A surface never changes on hover. For a clickable card, put a link or button inside it.

## Keyboard

Not focusable and takes no keys. Controls inside it keep their own.

## Related

[`EGrid`](../Grid/README.md) lays cards out in columns and [`EStack`](../Stack/README.md) in a column.
