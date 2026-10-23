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

| Prop      | Type                                                      | Default | Notes                                                                                                                            |
| --------- | --------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `as`      | `string`                                                  | `"div"` | The element to render, for example `ul`.                                                                                         |
| `gap`     | `InlineGap \| string`                                     | `2`     | A space token number (1 to 8, 10, 12 or 16) becomes `var(--e-space-N)`. A string is used as given, so any CSS length works.      |
| `justify` | `"start" \| "center" \| "end" \| "between"`               | None    | Main-axis placement. `between` spreads the children apart. Left out, they sit at the start.                                      |
| `align`   | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | None    | Cross-axis alignment. `start` aligns the top edges and `baseline` aligns the text baselines. Left out, the children are centred. |
| `nowrap`  | `boolean`                                                 | `false` | Keeps the children on one line instead of wrapping.                                                                              |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

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
