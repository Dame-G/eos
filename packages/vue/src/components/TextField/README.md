# ETextField

A labelled single-line text input with hint, error and optional unit.

```vue
<ETextField v-model="email" label="Email" type="email" required autocomplete="email" hint="We send receipts here." />
<ETextField v-model="amount" label="Payment amount" prefix="$" suffix="USD" inputmode="decimal" />
```

## Props

| Prop          | Type      | Default   | Notes                                                            |
| ------------- | --------- | --------- | ---------------------------------------------------------------- |
| `modelValue`  | `string`  | `""`      | v-model: the text.                                               |
| `label`       | `string`  |           | Required. The placeholder is an example, never the label.        |
| `hideLabel`   | `boolean` |           | Keeps the label for screen readers only.                         |
| `hint`        | `string`  |           | Help under the input.                                            |
| `error`       | `string`  |           | Replaces the hint, marks the input invalid and is announced.     |
| `placeholder` | `string`  |           | An example.                                                      |
| `type`        | `string`  | `text`    | The input type.                                                  |
| `prefix`      | `string`  |           | Unit before the value, such as `$`. Hidden from screen readers.  |
| `suffix`      | `string`  |           | Unit after the value, such as `USD`. Hidden from screen readers. |
| `required`    | `boolean` |           | The `required` attribute and the word "Required".                |
| `optional`    | `boolean` |           | The word "Optional". Flag whichever is rarer.                    |
| `disabled`    | `boolean` |           |                                                                  |
| `id`          | `string`  | generated | Id of the input.                                                 |

`class` and `style` land on the wrapper `div`; other attributes and listeners (`name`, `autocomplete`, `inputmode`, `maxlength`, `readonly`, `aria-*`, `@blur`) land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- Set `autocomplete` on every personal detail (`given-name`, `email`, `tel`, `postal-code`) so browsers can fill it (WCAG 1.3.5).
- An `aria-describedby` of your own is joined to the hint or error id.
