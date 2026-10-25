# EFieldset

Related controls in a bordered box. Use it, not a bare label, whenever two or more controls answer one question. [`ECheckboxGroup`](../CheckboxGroup/README.md) and [`ERadioGroup`](../RadioGroup/README.md) bring their own.

```vue
<EFieldset legend="Home address" required hint="Where we send statements.">
  <ETextField label="Street" autocomplete="street-address" />
  <ETextField label="City" autocomplete="address-level2" />
</EFieldset>
```

## Props

<!-- props:start -->

| Prop          | Type                            | Default     | Notes                                                                                                                                                                                                                                     |
| ------------- | ------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `legend`      | `string`                        | None        | The question the controls answer. Names the group for screen readers. A group without one needs an `aria-label` or `aria-labelledby`, and warns in development when it has none.                                                          |
| `variant`     | `"box" \| "plain" \| "section"` | `"box"`     | How the group is drawn: `box` outlines it with the legend on the line, `plain` shows the legend as a label above the controls (as `ERadioGroup` does), `section` is a titled form section with a rule above and the hint under the title. |
| `hint`        | `string`                        | None        | Help that is announced with the group.                                                                                                                                                                                                    |
| `error`       | `string`                        | None        | What to fix. Replaces the hint and is announced with the group.                                                                                                                                                                           |
| `required`    | `boolean`                       | `false`     | Shows "Required" at the end of the legend.                                                                                                                                                                                                |
| `optional`    | `boolean`                       | `false`     | Shows "Optional" at the end of the legend. Only the rarer of required and optional needs a flag.                                                                                                                                          |
| `disabled`    | `boolean`                       | `false`     | Disables every control inside.                                                                                                                                                                                                            |
| `legendClass` | `string`                        | None        | Classes added to the legend.                                                                                                                                                                                                              |
| `hideLegend`  | `boolean`                       | `false`     | Hides the legend from the page and keeps it for screen readers.                                                                                                                                                                           |
| `id`          | `string`                        | `generated` | The id of the `fieldset`, which an `EForm` summary links to. The hint and error ids are built from it.                                                                                                                                    |

<!-- props:end -->

`class`, `style` and attributes land on the `fieldset` element, which carries `id`. Inside an [`EForm`](../Form/README.md), `error` is listed in the summary by the legend, and its link focuses the first control.

## Slots

| Slot      | Use           |
| --------- | ------------- |
| `default` | The controls. |

## Accessibility

- The legend names the group, so the fields drop the repeated word ("Street", not "Street address", under "Home address").
- A group needs a name: give it a `legend`, or an `aria-label` or `aria-labelledby`. A group with neither warns in development.
- `hint` is linked with `aria-describedby`. `error` describes the group and is announced when it appears; `aria-invalid` belongs to the controls inside, which set it themselves.

## Keyboard

| Key | Action                                                          |
| --- | --------------------------------------------------------------- |
| Tab | Moves through the controls inside. A disabled group is skipped. |

## Related

[`ECheckbox`](../Checkbox/README.md) for one choice, [`EField`](../Field/README.md) for one control.
