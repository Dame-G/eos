# EPhoneField

A phone number input that groups digits as you type. Attributes behave as on [`ETextField`](../TextField/README.md).

```vue
<EPhoneField v-model="mobile" label="Mobile" hint="We text appointment reminders." />
```

## Props

<!-- props:start -->

| Prop          | Type             | Default                              | Notes                                                                                         |
| ------------- | ---------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`         | `""`                                 | `v-model`: the formatted number.                                                              |
| `label`       | `string`         | `"Phone number"`                     | The field's label.                                                                            |
| `hideLabel`   | `boolean`        | `false`                              | Hides the label from the page and keeps it for screen readers.                                |
| `format`      | `"us" \| "none"` | `us for the en-US locale, else none` | `us` formats as (555) 123-4567, drops a leading 1 and keeps ten digits. It does not validate. |
| `hint`        | `string`         | None                                 | Help that stays under the input.                                                              |
| `error`       | `string`         | None                                 | What to fix. Replaces the hint, marks the input invalid and is announced.                     |
| `placeholder` | `string`         | None                                 | An example, never the label.                                                                  |
| `required`    | `boolean`        | `false`                              | Sets the `required` attribute and shows "Required" beside the label.                          |
| `optional`    | `boolean`        | `false`                              | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.      |
| `disabled`    | `boolean`        | `false`                              | Disables the field.                                                                           |
| `name`        | `string`         | None                                 | The name submitted with a form.                                                               |
| `id`          | `string`         | `generated`                          | The id of the input. The label points at it.                                                  |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `input` element. `type="tel"`, `inputmode="tel"` and `autocomplete="tel"` are defaults you can override. Exposes `input` and `focus()`.

## Accessibility

- `type="tel"` shows the number pad on phones and lets the browser autofill.
