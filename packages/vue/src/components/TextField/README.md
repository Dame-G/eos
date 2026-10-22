# ETextField

A labelled single-line text input with hint, error and optional unit.

```vue
<ETextField v-model="email" label="Email" type="email" required autocomplete="email" hint="We send receipts here." />
<ETextField v-model="amount" label="Payment amount" prefix="$" suffix="USD" inputmode="decimal" />
```

## Props

<!-- props:start -->

| Prop          | Type      | Default      | Notes                                                                           |
| ------------- | --------- | ------------ | ------------------------------------------------------------------------------- |
| `modelValue`  | `string`  | `""`         | `v-model`: the text.                                                            |
| `label`       | `string`  | **Required** | The visible label above the input. A placeholder never replaces it.             |
| `hideLabel`   | `boolean` | `false`      | Keeps the label for screen readers and hides it from the page.                  |
| `hint`        | `string`  | None         | Help that stays under the input.                                                |
| `error`       | `string`  | None         | What to fix. Replaces the hint, marks the input invalid and is announced.       |
| `placeholder` | `string`  | None         | An example, never the label.                                                    |
| `type`        | `string`  | `"text"`     | The input type.                                                                 |
| `prefix`      | `string`  | None         | A unit before the value, such as `$`. Hidden from screen readers.               |
| `suffix`      | `string`  | None         | A unit after the value, such as `USD`. Hidden from screen readers.              |
| `required`    | `boolean` | `false`      | Sets the `required` attribute and adds a word beside the label.                 |
| `optional`    | `boolean` | `false`      | Adds a word beside the label. Use it when most fields in the form are required. |
| `disabled`    | `boolean` | `false`      | Disables the field.                                                             |
| `readonly`    | `boolean` | `false`      | Shows the value but blocks editing. The input stays focusable and selectable.   |
| `id`          | `string`  | `generated`  | The id of the input, which the label points at.                                 |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners (`name`, `autocomplete`, `inputmode`, `maxlength`, `aria-*`, `@blur`) land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- Set `autocomplete` on every personal detail (`given-name`, `email`, `tel`, `postal-code`) so browsers can fill it (WCAG 1.3.5).
- An `aria-describedby` of your own is joined to the hint or error id.
