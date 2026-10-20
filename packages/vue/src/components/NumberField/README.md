# ENumberField

A number input with decrease and increase buttons, for quantities. Use [`ECurrencyField`](../CurrencyField/README.md) for money.

```vue
<ENumberField v-model="visits" label="Visits" :min="0" :max="10" />
<ENumberField v-model="hours" label="Hours" :step="0.25" suffix="h" />
```

## Props

<!-- props:start -->

| Prop         | Type             | Default      | Notes                                                                                                                   |
| ------------ | ---------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `number \| null` | `null`       | `v-model`: the number; `null` when empty.                                                                               |
| `label`      | `string`         | **Required** | The visible label, a mono kicker above the field.                                                                       |
| `hideLabel`  | `boolean`        | `false`      | Keep the label for screen readers and remove it from the page.                                                          |
| `min`        | `number`         | —            | The lowest value. The value clamps to it and the decrease button disables there.                                        |
| `max`        | `number`         | —            | The highest value. The value clamps to it and the increase button disables there.                                       |
| `step`       | `number`         | `1`          | The amount one step of the buttons and arrow keys changes the value. Decimals shown follow the step (`0.25` shows two). |
| `prefix`     | `string`         | —            | A unit before the value.                                                                                                |
| `suffix`     | `string`         | —            | A unit after the value, such as visits.                                                                                 |
| `name`       | `string`         | —            | The name submitted with a form (the number, or empty).                                                                  |
| `hint`       | `string`         | —            | Help that stays under the field.                                                                                        |
| `error`      | `string`         | —            | What to fix. Replaces the hint, marks the field invalid and is announced.                                               |
| `required`   | `boolean`        | `false`      | The `required` attribute and a word beside the label.                                                                   |
| `optional`   | `boolean`        | `false`      | A word beside the label. Flag whichever is rarer.                                                                       |
| `disabled`   | `boolean`        | `false`      | Disables the input and both buttons.                                                                                    |
| `id`         | `string`         | `generated`  | The id of the input; the label points at it.                                                                            |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `input` element. Exposes `input` and `focus()`. Typed text commits on blur or Enter: it clamps, commas are ignored, unreadable text reverts, empty gives `null`. A unit sits next to the value with one word-space between them. When the field is narrow (under 10rem, or 13rem with a `prefix` or `suffix`), the buttons are hidden and the value is left-aligned; the arrow keys still step.

## Accessibility

- `role="spinbutton"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`.
- ArrowUp and ArrowDown step; Shift steps by ten.
- The buttons are named "Decrease" and "Increase" and are in the tab order.
