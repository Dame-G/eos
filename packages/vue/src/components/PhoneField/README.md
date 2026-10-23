# EPhoneField

A phone number input that groups digits as you type. Attributes behave as on [`ETextField`](../TextField/README.md).

```vue
<EPhoneField v-model="mobile" label="Mobile" hint="We text appointment reminders." />
```

## Props

<!-- props:start -->

| Prop          | Type                       | Default                              | Notes                                                                                                                                                                                                                             |
| ------------- | -------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`                   | `""`                                 | `v-model`: the formatted number.                                                                                                                                                                                                  |
| `hideLabel`   | `boolean`                  | `false`                              | Hides the label from the page and keeps it for screen readers.                                                                                                                                                                    |
| `hint`        | `string`                   | None                                 | Help that stays under the control.                                                                                                                                                                                                |
| `error`       | `string`                   | None                                 | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                                                                                       |
| `required`    | `boolean`                  | `false`                              | Sets the `required` attribute and shows "Required" beside the label.                                                                                                                                                              |
| `optional`    | `boolean`                  | `false`                              | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                                                                                          |
| `disabled`    | `boolean`                  | `false`                              | Disables the control.                                                                                                                                                                                                             |
| `id`          | `string`                   | `generated`                          | The id of the control. The label points at it.                                                                                                                                                                                    |
| `label`       | `string`                   | `"Phone number"`                     | The field's label.                                                                                                                                                                                                                |
| `format`      | `"us" \| "e164" \| "none"` | `us for the en-US locale, else none` | `us` formats as (555) 123-4567, drops a leading 1 (no US area code starts with 1) and keeps ten digits. `e164` keeps a `+` and up to 15 digits for an international number. `none` leaves the text alone. None of them validates. |
| `placeholder` | `string`                   | None                                 | An example, never the label.                                                                                                                                                                                                      |
| `name`        | `string`                   | None                                 | The name submitted with a form.                                                                                                                                                                                                   |
| `readonly`    | `boolean`                  | `false`                              | Shows the value but blocks editing. The input stays focusable and selectable.                                                                                                                                                     |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `input` element. `type="tel"`, `inputmode="tel"` and `autocomplete="tel"` are defaults you can override. Exposes `input` and `focus()`.

## Accessibility

- Formatting keeps the caret next to the digit just typed, even when editing in the middle.
- `type="tel"` shows the number pad on phones and lets the browser autofill.

## Keyboard

| Key | Action                    |
| --- | ------------------------- |
| Tab | Moves focus to the input. |

## Related

[`ETextField`](../TextField/README.md) for other text, [`ECurrencyField`](../CurrencyField/README.md) for money.
