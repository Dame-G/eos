# ENumberField

A number input with decrease and increase buttons, for quantities. An amount of money is `CurrencyField`.

```vue
<ENumberField v-model="visits" label="Visits" :min="0" :max="10" />
<ENumberField v-model="hours" label="Hours" :step="0.25" suffix="h" />
```

## Props

| Prop               | Type             | Notes                                                                  |
| ------------------ | ---------------- | ---------------------------------------------------------------------- |
| `v-model`          | `number \| null` | `null` when the field is empty. Leave it off for local state.          |
| `label`            | `string`         | Required.                                                              |
| `hideLabel`        | `boolean`        | Keeps the label for screen readers only.                               |
| `min`, `max`       | `number`         | The value clamps; the buttons disable at the limits.                   |
| `step`             | `number`         | Default 1. The decimals shown follow the step (`0.25` shows two).      |
| `prefix`, `suffix` | `string`         | A unit beside the value, hidden from screen readers.                   |
| `name`             | `string`         | Submitted with a form as a hidden input holding the number (or empty). |
| `hint`, `error`    | `string`         | As on `ETextField`.                                                    |
| `required`         | `boolean`        | The `required` attribute and the word "Required".                      |
| `optional`         | `boolean`        | The word "Optional".                                                   |
| `disabled`         | `boolean`        | Disables the input and both buttons.                                   |
| `id`               | `string`         | The input's id. Generated when left out.                               |

`class` and `style` stay on the wrapper; other attributes and listeners (`autocomplete`, `aria-*`, `data-*`, `@blur`, `@keydown`) land on the `<input>` and run alongside the component's own handlers. Exposed: `input` and `focus()`.

## Rules

- Arrow Up and Down step; Shift steps by ten. Typed text commits on blur or Enter: it clamps, commas are ignored, unreadable text goes back to the last number, empty text gives `null`.
- The input is `role="spinbutton"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`. The buttons are named "Decrease" and "Increase" (configurable messages) and are in the tab order.
- With a prefix or suffix the symbol sits beside the value and the pair is centred between the buttons.
- The whole well is 48px tall; the buttons are 48px squares.
