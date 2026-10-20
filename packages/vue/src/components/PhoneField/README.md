# EPhoneField

A phone number input that groups digits as you type. Attributes behave as on `ETextField`.

```vue
<EPhoneField v-model="mobile" label="Mobile" hint="We text appointment reminders." />
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string` | `""` | `v-model`: the formatted number. |
| `label` | `string` | `"Phone number"` | The field's label. |
| `hideLabel` | `boolean` | `false` | Keep the label for screen readers and remove it from the page. |
| `format` | `"us" \| "none"` | `us for the en-US locale, else none` | `us` gives (555) 123-4567, drops a leading 1 and keeps ten digits. No validation. |
| `hint` | `string` | — | Help that stays under the input. |
| `error` | `string` | — | What to fix. Replaces the hint, marks the input invalid and is announced. |
| `placeholder` | `string` | — | An example, never the label. |
| `required` | `boolean` | `false` | The `required` attribute and a word beside the label. |
| `optional` | `boolean` | `false` | A word beside the label. Flag whichever is rarer. |
| `disabled` | `boolean` | `false` | Disables the field. |
| `name` | `string` | — | The name submitted with a form. |
| `id` | `string` | `generated` | The id of the input; the label points at it. |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `input` element. `type="tel"`, `inputmode="tel"` and `autocomplete="tel"` are defaults you can override. Exposes `input` and `focus()`.

## Accessibility

- `type="tel"` shows the number pad on phones and lets the browser autofill.
