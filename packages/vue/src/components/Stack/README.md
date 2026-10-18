# AeStack

Children in a column with an even gap. Use it instead of margins: space belongs to the parent, so a child never needs to know what is beside it.

```vue
<AeStack :gap="6" align="center">...</AeStack>
```

## Props

| Prop    | Type                | Default | Notes                                                                                                                |
| ------- | ------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `gap`   | `number \| string`  | `4`     | A space token number (1, 2, 3, 4, 6, 8) becomes `var(--space-N)`; a string is used as given. Set through `--ae-gap`. |
| `align` | `"center" \| "end"` | stretch | Aligns children across the column.                                                                                   |
| `as`    | `string`            | `div`   | The element, for example `ul`.                                                                                       |

`class`, `style` and attributes fall through to the root. The default slot holds the children.

## Notes

- The reference README says the default gap is 3; its code uses 4, and so does this component. The CSS fallback `var(--ae-gap, var(--ae-space-3))` only applies when `--ae-gap` is unset by other means.
- Landmarks and roles are the consumer's: use `as="ul"` with `li` children for a real list.
