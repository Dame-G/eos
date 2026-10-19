# ENumberField

A number input with decrease and increase buttons, for quantities. Use `ECurrencyField` for money.

```vue
<ENumberField v-model="visits" label="Visits" :min="0" :max="10" />
<ENumberField v-model="hours" label="Hours" :step="0.25" suffix="h" />
```

## Props

| Prop         | Type             | Default   | Notes                                                       |
| ------------ | ---------------- | --------- | ----------------------------------------------------------- |
| `modelValue` | `number \| null` | `null`    | v-model: the number; `null` when empty.                     |
| `label`      | `string`         |           | Required.                                                   |
| `hideLabel`  | `boolean`        |           | Keeps the label for screen readers only.                    |
| `min`        | `number`         |           | The value clamps to it; the decrease button disables there. |
| `max`        | `number`         |           | The value clamps to it; the increase button disables there. |
| `step`       | `number`         | `1`       | Decimals shown follow the step (`0.25` shows two).          |
| `prefix`     | `string`         |           | Unit before the value.                                      |
| `suffix`     | `string`         |           | Unit after the value.                                       |
| `name`       | `string`         |           | Submitted with a form: the number, or empty.                |
| `hint`       | `string`         |           | Help under the field.                                       |
| `error`      | `string`         |           | Replaces the hint; marks invalid, announced.                |
| `required`   | `boolean`        |           | The `required` attribute and the word "Required".           |
| `optional`   | `boolean`        |           | The word "Optional".                                        |
| `disabled`   | `boolean`        |           | Disables the input and both buttons.                        |
| `id`         | `string`         | generated | Id of the input.                                            |

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `input` element. Exposes `input` and `focus()`. Typed text commits on blur or Enter: it clamps, commas are ignored, unreadable text reverts, empty gives `null`. A unit sits next to the value with one word-space between them. When the field is narrow (under 10rem, or 13rem with a `prefix` or `suffix`), the buttons are hidden and the value is left-aligned; the arrow keys still step.

## Accessibility

- `role="spinbutton"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`.
- ArrowUp and ArrowDown step; Shift steps by ten.
- The buttons are named "Decrease" and "Increase" and are in the tab order.
