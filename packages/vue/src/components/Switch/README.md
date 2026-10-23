# ESwitch

A switch for a setting that takes effect the moment it is flipped. Use [`ECheckbox`](../Checkbox/README.md) for a choice submitted later with a form.

```vue
<ESwitch v-model="reminders" label="Text reminders" description="The day before a visit." />
```

## Props

<!-- props:start -->

| Prop          | Type      | Default      | Notes                                                                                                      |
| ------------- | --------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `boolean` | `false`      | `v-model`: on or off.                                                                                      |
| `hint`        | `string`  | None         | Help that stays under the control.                                                                         |
| `error`       | `string`  | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                |
| `required`    | `boolean` | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                       |
| `optional`    | `boolean` | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                   |
| `disabled`    | `boolean` | `false`      | Disables the control. A disabled control posts nothing.                                                    |
| `readonly`    | `boolean` | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value. |
| `id`          | `string`  | `generated`  | The id of the control. The label points at it.                                                             |
| `label`       | `string`  | **Required** | The setting, named by what it does.                                                                        |
| `description` | `string`  | None         | A line of detail under the label.                                                                          |
| `name`        | `string`  | None         | The name submitted with a form.                                                                            |
| `value`       | `string`  | None         | The value submitted with a form when on.                                                                   |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- `description`, `hint` and `error` are linked with `aria-describedby`, not folded into the name. `readonly` sets `aria-readonly` and blocks the flip.
- A checkbox with `role="switch"`: Space toggles it and the state is announced as on or off.
- State never depends on colour alone: the knob sits at the end when on.

## Keyboard

| Key   | Does                          |
| ----- | ----------------------------- |
| Tab   | Moves to and from the switch. |
| Space | Turns it on or off.           |

## Related

[`ECheckbox`](../Checkbox/README.md) for a choice made when the form is submitted, rather than a setting that applies at once.
