# EInline

Children in a row that wraps when it runs out of room, for a title with a status, chips or a row of fields. Use [`EActions`](../Actions/README.md) for a group of buttons.

```vue
<EInline justify="between">
  <EHeading>Statements</EHeading>
  <EStamp status="paid" />
</EInline>
```

## Props

<!-- props:start -->

| Prop      | Type                                                                                                                      | Default  | Notes                                                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`      | `string`                                                                                                                  | `"div"`  | The element to render, such as `ul` (with `li` children). `ul` and `ol` lose their bullets and padding and keep their list role.                                                           |
| `gap`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 10 \| 12 \| 16 \| "tight" \| "snug" \| "base" \| "loose" \| "section" \| string` | `"snug"` | `tight`, `snug`, `base`, `loose` or `section` (the gap tokens), or a space token number (1 to 8, 10, 12 or 16) for `var(--e-space-N)`. A string is used as given, so any CSS length works. |
| `justify` | `"start" \| "center" \| "end" \| "between"`                                                                               | None     | Main-axis placement. `between` spreads the children apart. Left out, they sit at the start.                                                                                                |
| `align`   | `"start" \| "center" \| "end" \| "stretch" \| "baseline"`                                                                 | None     | Cross-axis alignment. `start` aligns the top edges and `baseline` aligns the text baselines. Left out, the children are centred.                                                           |
| `wrap`    | `boolean`                                                                                                                 | `true`   | Wraps the children onto further lines when they run out of room. `false` keeps them on one line.                                                                                           |
| `nowrap`  | `boolean`                                                                                                                 | `false`  | **Deprecated.** Use `:wrap="false"`.                                                                                                                                                       |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element. The default `gap` is `snug` (8px); `gap` takes the same values as on [`EStack`](../Stack/README.md). `nowrap` is deprecated: use `:wrap="false"`. With `as="ul"` or `as="ol"` the bullets and padding go and the list keeps its role, as in [`EStack`](../Stack/README.md).

## Slots

| Slot      | Use           |
| --------- | ------------- |
| `default` | The children. |

## Accessibility

- Visual order follows source order, so keep the source in reading order.

## Keyboard

| Key | Action                                        |
| --- | --------------------------------------------- |
| Tab | The row is layout only and adds no tab stops. |

## Related

[`EStack`](../Stack/README.md) for a column, [`EGrid`](../Grid/README.md) for cards in columns.
