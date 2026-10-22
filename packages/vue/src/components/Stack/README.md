# EStack

Children in a column with an even gap. Use it instead of margins.

```vue
<EStack :gap="6" align="center">...</EStack>
```

## Props

<!-- props:start -->

| Prop    | Type                | Default | Notes                                                                                                                   |
| ------- | ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| `as`    | `string`            | `"div"` | The element to render, such as `ul` (with `li` children).                                                               |
| `gap`   | `number \| string`  | `4`     | A space token number (1, 2, 3, 4, 6, 8) becomes `var(--e-space-N)`. A string is used as given, so any CSS length works. |
| `align` | `"center" \| "end"` | None    | Aligns the children across the column: `center` or `end`. Stretched by default.                                         |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use           |
| --------- | ------------- |
| `default` | The children. |

## Accessibility

- Layout only: no role. Children keep their DOM order, and `align` changes position across the column, never the reading or focus order.
- With `as="ul"` (or `ol`) and `li` children it is a list, announced with its item count.
- Spacing is not a substitute for structure. Use headings and landmarks inside it as the content needs.
