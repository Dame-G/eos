# EStack

Children in a column with an even gap. Use it instead of margins. Use [`EInline`](../Inline/README.md) for a row.

```vue
<EStack gap="loose" align="center">...</EStack>
<EStack as="ul" divider>...</EStack>
<EStack wrap-below="30rem">...</EStack>
```

## Props

<!-- props:start -->

| Prop        | Type                                                                                                                 | Default  | Notes                                                                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`        | `string`                                                                                                             | `"div"`  | The element to render, such as `ul` (with `li` children). `ul` and `ol` lose their bullets and padding.                                                                                       |
| `gap`       | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 10 \| 12 \| 16 \| "tight" \| "snug" \| "base" \| "loose" \| "section" \| string` | `"base"` | `tight`, `snug`, `base`, `loose` or `section` (the gap tokens), or a space token number (1 to 6, 8, 10, 12 or 16) for `var(--e-space-N)`. A string is used as given, so any CSS length works. |
| `align`     | `"start" \| "center" \| "end" \| "stretch" \| "baseline"`                                                            | None     | Aligns the children across the column. Stretched by default.                                                                                                                                  |
| `justify`   | `"start" \| "center" \| "end" \| "between"`                                                                          | None     | Places the children down the column when the stack is taller than they are. Left out, they sit at the start.                                                                                  |
| `divider`   | `boolean`                                                                                                            | `false`  | Draws a hairline between the children, centred in the gap. Not used with `wrapBelow`.                                                                                                         |
| `wrapBelow` | `string`                                                                                                             | None     | A CSS length. Lays the children side by side, each as wide as the stack allows, and stacks them into one column once the stack is narrower than this. Left out, the children always stack.    |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element. The default `gap` is `base` (12px). `divider` draws a hairline in the middle of each gap. `wrapBelow` lays the children side by side and stacks them when the stack itself is narrower than the length, whatever the viewport.

`gap` is typed `GapToken` (`SpaceToken` or a `GapName`); `EInline`, `EGrid` and `ESurface` `padding` take the same values.

## Slots

| Slot      | Use           |
| --------- | ------------- |
| `default` | The children. |

## Accessibility

- Layout only: no role. Children keep their DOM order, and `align` changes position across the column, never the reading or focus order.
- With `as="ul"` (or `ol`) and `li` children it is a list, announced with its item count. The bullets are removed and `role="list"` is set, so Safari keeps the list semantics.
- Spacing is not a substitute for structure. Use headings and landmarks inside it as the content needs.

Not focusable.

## Related

[`EInline`](../Inline/README.md) for a row, [`EGrid`](../Grid/README.md) for columns that fill the width.
