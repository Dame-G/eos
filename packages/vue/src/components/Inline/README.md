# EInline

Children in a row that wraps when it runs out of room. Use it for a title with a status, a list of chips, a row of fields. For a group of Buttons use EActions, which also lines them up the same way everywhere.

```vue
<EInline justify="between">...</EInline>
```

## Props

| Prop      | Type                    | Default | Notes                                                                           |
| --------- | ----------------------- | ------- | ------------------------------------------------------------------------------- |
| `gap`     | `number \| string`      | `2`     | A space token number (1, 2, 3, 4, 6, 8) or a CSS length. Set through `--e-gap`. |
| `justify` | `"between" \| "end"`    | start   | Main-axis placement.                                                            |
| `align`   | `"start" \| "baseline"` | centre  | Cross-axis alignment.                                                           |
| `nowrap`  | `boolean`               |         | Keeps the children on one line.                                                 |
| `as`      | `string`                | `div`   | The element, for example `ul`.                                                  |

`class`, `style` and attributes fall through to the root. The default slot holds the children.

## Notes

- Visual order follows source order, so keep the source in reading order.
