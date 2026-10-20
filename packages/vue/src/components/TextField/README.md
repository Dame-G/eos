# ETextField

A labelled single-line text input with hint, error and optional unit.

```vue
<ETextField v-model="email" label="Email" type="email" required autocomplete="email" hint="We send receipts here." />
<ETextField v-model="amount" label="Payment amount" prefix="$" suffix="USD" inputmode="decimal" />
```

## Props

<!-- props:start -->

| Prop          | Type      | Default      | Notes                                                                                             |
| ------------- | --------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`  | `""`         | `v-model`: the text.                                                                              |
| `label`       | `string`  | **Required** | The visible label, a mono kicker above the input. The placeholder is an example, never the label. |
| `hideLabel`   | `boolean` | `false`      | Keep the label for screen readers and remove it from the page.                                    |
| `hint`        | `string`  | —            | Help that stays under the input.                                                                  |
| `error`       | `string`  | —            | What to fix. Replaces the hint, marks the input invalid and is announced.                         |
| `placeholder` | `string`  | —            | An example, never the label.                                                                      |
| `type`        | `string`  | `"text"`     | The input type.                                                                                   |
| `prefix`      | `string`  | —            | A unit before the value, such as `$`. Hidden from screen readers.                                 |
| `suffix`      | `string`  | —            | A unit after the value, such as `USD`. Hidden from screen readers.                                |
| `required`    | `boolean` | `false`      | The `required` attribute and a word beside the label.                                             |
| `optional`    | `boolean` | `false`      | A word beside the label. Flag whichever is rarer.                                                 |
| `disabled`    | `boolean` | `false`      | Disables the field.                                                                               |
| `id`          | `string`  | `generated`  | The id of the input; the label points at it.                                                      |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes and listeners (`name`, `autocomplete`, `inputmode`, `maxlength`, `readonly`, `aria-*`, `@blur`) land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- Set `autocomplete` on every personal detail (`given-name`, `email`, `tel`, `postal-code`) so browsers can fill it (WCAG 1.3.5).
- An `aria-describedby` of your own is joined to the hint or error id.
