# EPhoneField

A phone number input that groups digits as you type. Attributes behave as on `ETextField`.

```vue
<EPhoneField v-model="mobile" label="Mobile" hint="We text appointment reminders." />
```

## Props

| Prop          | Type             | Default                                  | Notes                                                                             |
| ------------- | ---------------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| `modelValue`  | `string`         | `""`                                     | v-model: the formatted number.                                                    |
| `label`       | `string`         | `Phone number`                           | The field's label.                                                                |
| `hideLabel`   | `boolean`        |                                          | Keeps the label for screen readers only.                                          |
| `format`      | `"us" \| "none"` | `us` for the `en-US` locale, else `none` | `us` gives (555) 123-4567, drops a leading 1 and keeps ten digits. No validation. |
| `hint`        | `string`         |                                          | Help under the field.                                                             |
| `error`       | `string`         |                                          | Replaces the hint, marks the input invalid.                                       |
| `placeholder` | `string`         |                                          | An example, never the label.                                                      |
| `required`    | `boolean`        |                                          | The `required` attribute and the word "Required".                                 |
| `optional`    | `boolean`        |                                          | The word "Optional".                                                              |
| `disabled`    | `boolean`        |                                          |                                                                                   |
| `id`          | `string`         | generated                                | Id of the input.                                                                  |

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `input` element. `type="tel"`, `inputmode="tel"` and `autocomplete="tel"` are defaults you can override. Add `name` for forms. Exposes `input` and `focus()`.

## Accessibility

- `type="tel"` shows the number pad on phones and lets the browser autofill.
