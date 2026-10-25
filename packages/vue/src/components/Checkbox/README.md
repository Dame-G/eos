# ECheckbox

A single yes/no choice. Use [`ESwitch`](../Switch/README.md) for a setting that takes effect immediately.

```vue
<ECheckbox v-model="agree" label="I agree to the terms" description="You can change this later." />
```

## Props

<!-- props:start -->

| Prop            | Type      | Default      | Notes                                                                                                      |
| --------------- | --------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `modelValue`    | `boolean` | `false`      | `v-model`: whether it is checked.                                                                          |
| `hideLabel`     | `boolean` | `false`      | Hides the label from the page and keeps it for screen readers.                                             |
| `hint`          | `string`  | None         | Help that stays under the control.                                                                         |
| `error`         | `string`  | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                |
| `required`      | `boolean` | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                       |
| `optional`      | `boolean` | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                   |
| `disabled`      | `boolean` | `false`      | Disables the control. A disabled control posts nothing.                                                    |
| `readonly`      | `boolean` | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value. |
| `id`            | `string`  | `generated`  | The id of the control. The label points at it.                                                             |
| `label`         | `string`  | **Required** | What the person agrees to or turns on.                                                                     |
| `description`   | `string`  | None         | A line of detail under the label.                                                                          |
| `indeterminate` | `boolean` | `false`      | A mixed state, such as select-all with some rows chosen.                                                   |
| `name`          | `string`  | None         | The name submitted with a form.                                                                            |
| `value`         | `string`  | None         | The value submitted with a form when checked.                                                              |

<!-- props:end -->

`class` and `style` land on the wrapper `div`, which holds the `label` row and the error. It stays the same element when `error` comes and goes, so focus is not lost. Other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- The label is required. With `hideLabel` it stays for screen readers, as in a table cell, and the hint or error still shows.
- `readonly` sets `aria-readonly`, keeps the box focusable and blocks the toggle. `hint`, `error` and `description` are linked to the input with `aria-describedby`. The description is not part of the checkbox's name.
- `indeterminate` is the prop's to set: a click checks the box, and the mixed state stays until the prop changes.

## Keyboard

| Key   | Action                                             |
| ----- | -------------------------------------------------- |
| Space | Checks or unchecks the box.                        |
| Tab   | Moves focus to the box. A disabled box is skipped. |

## Related

[`ECheckboxGroup`](../CheckboxGroup/README.md) for several related boxes, [`ERadioGroup`](../RadioGroup/README.md) to choose one of several.
