# ECurrencyField

An amount of money: an `ENumberField` with the currency symbol in front, two decimals and no negatives.

```vue
<ECurrencyField v-model="amount" label="Payment amount" :max="balance" hint="Up to your balance." />
<ECurrencyField v-model="amount" label="Montant" currency="EUR" locale="fr-FR" />
```

## Props

| Prop         | Type             | Default             | Notes                                             |
| ------------ | ---------------- | ------------------- | ------------------------------------------------- |
| `modelValue` | `number \| null` | `null`              | v-model: the amount; round to the cent in code.   |
| `label`      | `string`         |                     | Required. Say what the amount is for.             |
| `hideLabel`  | `boolean`        |                     | Keeps the label for screen readers only.          |
| `currency`   | `string`         | configured currency | ISO 4217 code. An unknown code falls back to `$`. |
| `locale`     | `string`         | configured locale   | BCP 47 tag used for the symbol.                   |
| `min`        | `number`         | `0`                 | The lowest value, so no negatives by default.     |
| `max`        | `number`         |                     | The highest value.                                |
| `step`       | `number`         | `0.01`              | Decimals shown follow the step.                   |
| `prefix`     | `string`         |                     | Replaces the symbol.                              |
| `suffix`     | `string`         |                     | A unit after the value.                           |
| `name`       | `string`         |                     | Submitted as the number, or empty.                |
| `hint`       | `string`         |                     | Help under the field.                             |
| `error`      | `string`         |                     | Replaces the hint; marks invalid, announced.      |
| `required`   | `boolean`        |                     | The `required` attribute and the word "Required". |
| `optional`   | `boolean`        |                     | The word "Optional".                              |
| `disabled`   | `boolean`        |                     | Disables the field and its buttons.               |
| `id`         | `string`         | generated           | Id of the input.                                  |

As `ENumberField`: `class` and `style` land on the wrapper `div`; other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- The symbol is hidden from screen readers, so the label must say what the amount is.
