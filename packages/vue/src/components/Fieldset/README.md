# EFieldset

Related controls in a bordered box. Use it, not a bare label, whenever two or more controls answer one question.

```vue
<EFieldset legend="Home address" required hint="Where we send statements.">
  <ETextField label="Street" autocomplete="street-address" />
  <ETextField label="City" autocomplete="address-level2" />
</EFieldset>
```

## Props

<!-- props:start -->

| Prop          | Type      | Default     | Notes                                                                                                                                                                            |
| ------------- | --------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `legend`      | `string`  | None        | The question the controls answer. Names the group for screen readers. A group without one needs an `aria-label` or `aria-labelledby`, and warns in development when it has none. |
| `bare`        | `boolean` | `false`     | Removes the box and shows the legend as a plain label above the controls, as `ERadioGroup` does.                                                                                 |
| `hint`        | `string`  | None        | Help that is announced with the group.                                                                                                                                           |
| `error`       | `string`  | None        | What to fix. Replaces the hint and is announced with the group.                                                                                                                  |
| `required`    | `boolean` | `false`     | Shows "Required" at the end of the legend.                                                                                                                                       |
| `optional`    | `boolean` | `false`     | Shows "Optional" at the end of the legend. Only the rarer of required and optional needs a flag.                                                                                 |
| `section`     | `boolean` | `false`     | Makes a titled form section without a box, with the hint under the legend.                                                                                                       |
| `disabled`    | `boolean` | `false`     | Disables every control inside.                                                                                                                                                   |
| `legendClass` | `string`  | None        | Classes added to the legend.                                                                                                                                                     |
| `hideLegend`  | `boolean` | `false`     | Hides the legend from the page and keeps it for screen readers.                                                                                                                  |
| `id`          | `string`  | `generated` | The id the hint and error ids are built from.                                                                                                                                    |

<!-- props:end -->

`class`, `style` and attributes land on the `fieldset` element.

## Slots

| Slot      | Use           |
| --------- | ------------- |
| `default` | The controls. |

## Accessibility

- The legend names the group, so the fields drop the repeated word ("Street", not "Street address", under "Home address").
- A group needs a name: give it a `legend`, or an `aria-label` or `aria-labelledby`. A group with neither warns in development.
- `hint` is linked with `aria-describedby`. `error` is announced with `role="alert"` and described with the group; `aria-invalid` belongs to the controls inside, which set it themselves.

## Keyboard

| Key | Action                                                          |
| --- | --------------------------------------------------------------- |
| Tab | Moves through the controls inside. A disabled group is skipped. |

## Related

[`ERadioGroup`](../RadioGroup/README.md) and [`ECheckbox`](../Checkbox/README.md) for a group of choices, [`EField`](../Field/README.md) for one control.
