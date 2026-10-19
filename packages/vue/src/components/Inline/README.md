# EInline

Children in a row that wraps when it runs out of room, for a title with a status, chips or a row of fields. Use `EActions` for a group of buttons.

```vue
<EInline justify="between">
  <EHeading>Statements</EHeading>
  <EStamp status="paid" />
</EInline>
```

## Props

| Prop      | Type                    | Default | Notes                                                    |
| --------- | ----------------------- | ------- | -------------------------------------------------------- |
| `as`      | `string`                | `div`   | The element, for example `ul`.                           |
| `gap`     | `number \| string`      | `2`     | A space token number (1, 2, 3, 4, 6, 8) or a CSS length. |
| `justify` | `"between" \| "end"`    |         | Main-axis placement. Start by default.                   |
| `align`   | `"start" \| "baseline"` |         | Cross-axis alignment. Centred by default.                |
| `nowrap`  | `boolean`               |         | Keeps the children on one line.                          |

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use           |
| --------- | ------------- |
| `default` | The children. |

## Accessibility

- Visual order follows source order; keep the source in reading order.
