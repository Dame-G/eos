# ESurface

The flat, outlined card that content blocks are built from. Use it for any standalone block of content.

```vue
<ESurface as="article" pad="md">
  <h2>October statement</h2>
  <template #actions><EButton>Pay</EButton></template>
</ESurface>
```

## Props

<!-- props:start -->

| Prop     | Type                   | Default | Notes                                                                              |
| -------- | ---------------------- | ------- | ---------------------------------------------------------------------------------- |
| `as`     | `string`               | `"div"` | The element to render, such as `article`, `section` or `aside` for a real block.   |
| `pad`    | `"sm" \| "md" \| "lg"` | None    | Padding inside the card: `sm`, `md` or `lg`.                                       |
| `raised` | `boolean`              | `false` | The lifted shadow of something floating above the page, such as a Toast.           |
| `clip`   | `boolean`              | `false` | Hides what overflows the rounded corners. Ignored when there is an `actions` slot. |

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
- A surface never changes on hover. For a clickable card, put a link or button inside it.
