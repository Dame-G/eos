# ECheckbox

A single yes/no choice. Use `ESwitch` for a setting that takes effect immediately.

```vue
<ECheckbox v-model="agree" label="I agree to the terms" description="You can change this later." />
```

## Props

| Prop            | Type      | Default   | Notes                                                      |
| --------------- | --------- | --------- | ---------------------------------------------------------- |
| `modelValue`    | `boolean` | `false`   | v-model: checked or not.                                   |
| `label`         | `string`  |           | Required.                                                  |
| `description`   | `string`  |           | Detail under the label.                                    |
| `indeterminate` | `boolean` |           | Mixed state, such as select-all with some rows set.        |
| `bare`          | `boolean` |           | Hides the label visually, for a table cell. No error text. |
| `error`         | `string`  |           | Shown under the row; sets `aria-invalid`.                  |
| `disabled`      | `boolean` |           |                                                            |
| `required`      | `boolean` |           | The `required` attribute.                                  |
| `name`          | `string`  |           | Submitted with a form.                                     |
| `value`         | `string`  |           | Submitted with a form when checked.                        |
| `id`            | `string`  | generated | Id of the input.                                           |

`class` and `style` land on the row (the `label`, or the wrapper `div` when there is an error); other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- The label is required; with `bare` it stays for screen readers.
- `error` is linked to the input with `aria-describedby`.
