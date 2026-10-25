# ENumberField

A number input with decrease and increase buttons, for quantities. Use [`ECurrencyField`](../CurrencyField/README.md) for money.

```vue
<ENumberField v-model="visits" label="Visits" :min="0" :max="10" />
<ENumberField v-model="hours" label="Hours" :step="0.25" suffix="h" />
```

## Props

<!-- props:start -->

| Prop         | Type                   | Default             | Notes                                                                                                                   |
| ------------ | ---------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `number \| null`       | `null`              | `v-model`: the number, or `null` when empty.                                                                            |
| `hideLabel`  | `boolean`              | `false`             | Hides the label from the page and keeps it for screen readers.                                                          |
| `hint`       | `string`               | None                | Help that stays under the control.                                                                                      |
| `error`      | `string`               | None                | What to fix. Replaces the hint, marks the control invalid and is announced.                                             |
| `required`   | `boolean`              | `false`             | Sets the `required` attribute and shows "Required" beside the label.                                                    |
| `optional`   | `boolean`              | `false`             | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                |
| `disabled`   | `boolean`              | `false`             | Disables the control. A disabled control posts nothing.                                                                 |
| `readonly`   | `boolean`              | `false`             | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.              |
| `id`         | `string`               | `generated`         | The id of the control. The label points at it.                                                                          |
| `size`       | `"sm" \| "md" \| "lg"` | `"md"`              | The height of the box: `sm` and `lg` are a step under and over the control height.                                      |
| `label`      | `string`               | **Required**        | The visible label above the field.                                                                                      |
| `min`        | `number`               | None                | The lowest value. The value clamps to it and the decrease button dims there.                                            |
| `max`        | `number`               | None                | The highest value. The value clamps to it and the increase button dims there.                                           |
| `step`       | `number`               | `1`                 | The amount one step of the buttons and arrow keys changes the value. Decimals shown follow the step (`0.25` shows two). |
| `prefix`     | `string`               | None                | A unit before the value. Read with the value by screen readers.                                                         |
| `suffix`     | `string`               | None                | A unit after the value, such as visits. Read with the value by screen readers.                                          |
| `name`       | `string`               | None                | The name submitted with a form (the number, or empty). Posts nothing while disabled.                                    |
| `locale`     | `string`               | `configured locale` | BCP 47 tag the number is written and read in: its decimal and group separators.                                         |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `input` element. Exposes `input` and `focus()`. The model follows the typed text as soon as it reads as a number, even outside `min` and `max`, and empty gives `null`. On blur or Enter the text is tidied: it clamps to the range, the group separator is ignored and unreadable text reverts. The posted value (`name`) is updated at the same moment, so Enter submits the clamped number. A disabled field posts nothing. Numbers show every decimal they have (at least as many as `step`) with grouping for the locale. Holding a button repeats the step. A step lands on `min` plus a whole number of steps (zero when there is no `min`), so a value between two lands on the next one. A unit sits next to the value with one space between them. When the field is narrow (under 10rem, or 13rem with a `prefix` or `suffix`), the buttons are hidden and the value is left-aligned, but the arrow keys still step.

## Accessibility

- `role="spinbutton"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`. With a `prefix` or `suffix`, `aria-valuetext` reads the value with its unit.
- At `min` or `max` the button is `aria-disabled`, not `disabled`, so a press that reaches the end keeps focus.
- Typing follows the configured locale: a decimal comma in French or German, with spaces or the group separator ignored. A `.` also reads as the decimal point, except in locales that group with a dot (German, Spanish), where `1.5` means 15.
- The buttons are named "Decrease" and "Increase" and are not in the tab order: from the keyboard the arrow keys step, as in any spin button.

## Keyboard

| Key                             | Action                           |
| ------------------------------- | -------------------------------- |
| Arrow Up, Arrow Down            | Adds or takes away one `step`.   |
| Shift+Arrow, Page Up, Page Down | Steps by ten.                    |
| Home, End                       | Goes to `min` or `max` when set. |
| Enter                           | Commits the typed text.          |
| Tab                             | Moves into the field and out.    |

## Related

[`ETextField`](../TextField/README.md) for free text.
