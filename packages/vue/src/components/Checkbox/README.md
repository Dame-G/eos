# ECheckbox

A single yes/no choice. Use [`ESwitch`](../Switch/README.md) for a setting that takes effect immediately.

```vue
<ECheckbox v-model="agree" label="I agree to the terms" description="You can change this later." />
```

## Props

<!-- props:start -->

| Prop            | Type      | Default      | Notes                                                                                                    |
| --------------- | --------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| `modelValue`    | `boolean` | `false`      | `v-model`: whether it is checked.                                                                        |
| `label`         | `string`  | **Required** | What the person agrees to or turns on.                                                                   |
| `description`   | `string`  | None         | A line of detail under the label.                                                                        |
| `indeterminate` | `boolean` | `false`      | A mixed state, such as select-all with some rows chosen.                                                 |
| `bare`          | `boolean` | `false`      | Hides the label from the page and keeps it for screen readers, for a table cell. It shows no error text. |
| `disabled`      | `boolean` | `false`      | Disables the checkbox. It cannot take focus and is not submitted.                                        |
| `required`      | `boolean` | `false`      | Sets the `required` attribute.                                                                           |
| `error`         | `string`  | None         | Shows what to fix under the row and sets `aria-invalid`.                                                 |
| `name`          | `string`  | None         | The name submitted with a form.                                                                          |
| `value`         | `string`  | None         | The value submitted with a form when checked.                                                            |
| `id`            | `string`  | `generated`  | The `id` of the input, which the label points at.                                                        |

<!-- props:end -->

`class` and `style` land on the wrapper `div`, which holds the `label` row and the error. It stays the same element when `error` comes and goes, so focus is not lost. Other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- The label is required. With `bare` it stays for screen readers.
- `error` and `description` are linked to the input with `aria-describedby`. The description is not part of the checkbox's name.
- `indeterminate` is the prop's to set: a click checks the box, and the mixed state stays until the prop changes.

## Keyboard

| Key   | Action                                             |
| ----- | -------------------------------------------------- |
| Space | Checks or unchecks the box.                        |
| Tab   | Moves focus to the box. A disabled box is skipped. |

## Related

[`ESwitch`](../Switch/README.md) for a setting that applies at once, [`ERadioGroup`](../RadioGroup/README.md) to choose one of several.
