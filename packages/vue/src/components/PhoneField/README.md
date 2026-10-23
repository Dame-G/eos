# EPhoneField

A phone number input that groups digits as you type. Attributes behave as on [`ETextField`](../TextField/README.md).

```vue
<EPhoneField v-model="mobile" label="Mobile" hint="We text appointment reminders." />
<EPhoneField v-model="e164" label="Mobile" value-format="e164" name="phone" />
```

## Props

<!-- props:start -->

| Prop          | Type                                | Default                              | Notes                                                                                                                                                                                                                                        |
| ------------- | ----------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`                            | `""`                                 | `v-model`: the number, in the `valueFormat`.                                                                                                                                                                                                 |
| `hideLabel`   | `boolean`                           | `false`                              | Hides the label from the page and keeps it for screen readers.                                                                                                                                                                               |
| `hint`        | `string`                            | None                                 | Help that stays under the control.                                                                                                                                                                                                           |
| `error`       | `string`                            | None                                 | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                                                                                                  |
| `required`    | `boolean`                           | `false`                              | Sets the `required` attribute and shows "Required" beside the label.                                                                                                                                                                         |
| `optional`    | `boolean`                           | `false`                              | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                                                                                                     |
| `disabled`    | `boolean`                           | `false`                              | Disables the control. A disabled control posts nothing.                                                                                                                                                                                      |
| `readonly`    | `boolean`                           | `false`                              | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                                                                                                                                   |
| `id`          | `string`                            | `generated`                          | The id of the control. The label points at it.                                                                                                                                                                                               |
| `size`        | `EFieldSize`                        | `"md"`                               | The height of the box: `sm` and `lg` are a step under and over the control height.                                                                                                                                                           |
| `loading`     | `boolean`                           | `false`                              | Shows a spinner at the end of the box and sets `aria-busy`, while options or a check load. The field stays editable.                                                                                                                         |
| `label`       | `string`                            | `"Phone number"`                     | The field's label.                                                                                                                                                                                                                           |
| `format`      | `"us" \| "e164" \| "none"`          | `us for the en-US locale, else none` | `us` formats as (555) 123-4567, drops a leading 1 (no US area code starts with 1) and keeps ten digits. `e164` keeps a `+` and up to 15 digits for an international number. `none` leaves the text alone. None of them validates.            |
| `placeholder` | `string`                            | None                                 | An example, never the label.                                                                                                                                                                                                                 |
| `valueFormat` | `"formatted" \| "e164" \| "digits"` | `"formatted"`                        | What the model holds. `formatted` is the text as shown. `e164` is `+` and the digits, with the US `+1` added in the `us` format. `digits` is the digits alone. The input always shows the formatted number, and reads any of the three back. |
| `name`        | `string`                            | None                                 | The name submitted with a form: the model, in the `valueFormat`. Posts nothing while disabled.                                                                                                                                               |
| `clearable`   | `boolean`                           | `false`                              | Shows a button that empties the input while it has text.                                                                                                                                                                                     |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `input` element. `type="tel"`, `inputmode="tel"` and `autocomplete="tel"` are defaults you can override. `size`, `loading` and `clearable` are as on [`ETextField`](../TextField/README.md). Exposes `input` and `focus()`.

The input always shows the formatted number. `valueFormat` chooses what the model holds: `formatted` (the default), `e164` (`+15551234567`; the US format adds `+1`) or `digits`. The model is read back in any of the three. With `e164` or `digits`, `name` posts the model through a hidden input and a disabled field posts nothing. Nothing is validated.

## Accessibility

- Formatting keeps the caret next to the digit just typed, even when editing in the middle.
- `type="tel"` shows the number pad on phones and lets the browser autofill.

## Keyboard

| Key | Action                    |
| --- | ------------------------- |
| Tab | Moves focus to the input. |

## Related

[`ETextField`](../TextField/README.md) for other text, [`ECurrencyField`](../CurrencyField/README.md) for money.
