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

| Prop      | Type                    | Default | Notes                                                                                                                            |
| --------- | ----------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `as`      | `string`                | `"div"` | The element to render, for example `ul`.                                                                                         |
| `gap`     | `number \| string`      | `2`     | A space token number (1, 2, 3, 4, 6, 8), or any CSS length as a string.                                                          |
| `justify` | `"between" \| "end"`    | —       | Main-axis placement. `between` spreads the children apart and `end` packs them at the end. Left out, they sit at the start.      |
| `align`   | `"start" \| "baseline"` | —       | Cross-axis alignment. `start` aligns the top edges and `baseline` aligns the text baselines. Left out, the children are centred. |
| `nowrap`  | `boolean`               | `false` | Keeps the children on one line instead of wrapping.                                                                              |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use           |
| --------- | ------------- |
| `default` | The children. |

## Accessibility

- Visual order follows source order, so keep the source in reading order.
