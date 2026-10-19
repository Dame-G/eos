# EFieldset

Related controls in a bordered box. Use it, not a bare label, whenever two or more controls answer one question.

```vue
<EFieldset legend="Home address" required hint="Where we send statements.">
  <ETextField label="Street" autocomplete="street-address" />
  <ETextField label="City" autocomplete="address-level2" />
</EFieldset>
```

## Props

| Prop              | Type      | Default   | Notes                                                        |
| ----------------- | --------- | --------- | ------------------------------------------------------------ |
| `legend`          | `string`  |           | The question the controls answer; names the group.           |
| `bare`            | `boolean` |           | No box; the legend becomes a small label above the controls. |
| `hint`            | `string`  |           | Announced with the group.                                    |
| `error`           | `string`  |           | Replaces the hint; announced with the group.                 |
| `required`        | `boolean` |           | "Required" at the end of the legend.                         |
| `optional`        | `boolean` |           | "Optional" at the end of the legend.                         |
| `disabled`        | `boolean` |           | Disables every control inside.                               |
| `legendClassName` | `string`  |           | Extra classes for the legend.                                |
| `id`              | `string`  | generated | Hint and error ids are built from it.                        |

`class`, `style` and attributes land on the `fieldset` element.

## Slots

| Slot      | Use           |
| --------- | ------------- |
| `default` | The controls. |

## Accessibility

- The legend names the group, so the fields drop the repeated word ("Street", not "Street address", under "Home address").
- `hint` is linked with `aria-describedby`; `error` sets `aria-invalid` and is announced with `role="alert"`.
