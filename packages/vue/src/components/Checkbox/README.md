# ECheckbox

A single yes/no choice. Use `ESwitch` for a setting that takes effect immediately.

```vue
<ECheckbox v-model="agree" label="I agree to the terms" description="You can change this later." />
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | `v-model`: whether it is checked. |
| `label` | `string` | **Required** | What the person agrees to or turns on. |
| `description` | `string` | — | A line of detail under the label. |
| `indeterminate` | `boolean` | `false` | A mixed state, such as select-all with some rows chosen. |
| `bare` | `boolean` | `false` | Hide the label visually but keep it for screen readers, for a table cell. No error text. |
| `disabled` | `boolean` | `false` | Disables the checkbox. |
| `required` | `boolean` | `false` | The `required` attribute. |
| `error` | `string` | — | What to fix. Shown under the row; sets `aria-invalid`. |
| `name` | `string` | — | The name submitted with a form. |
| `value` | `string` | — | The value submitted with a form when checked. |
| `id` | `string` | `generated` | The id of the input; the label points at it. |

<!-- props:end -->

`class` and `style` land on the row (the `label`, or the wrapper `div` when there is an error); other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- The label is required; with `bare` it stays for screen readers.
- `error` is linked to the input with `aria-describedby`.
