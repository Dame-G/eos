# ECurrencyField

An amount of money: an `ENumberField` with the currency symbol in front, two decimal places and no negatives.

```vue
<ECurrencyField v-model="amount" label="Payment amount" :max="balance" hint="Up to your balance." />
<ECurrencyField v-model="amount" label="Montant" currency="EUR" locale="fr-FR" />
```

## Props

| Prop        | Type             | Notes                                                              |
| ----------- | ---------------- | ------------------------------------------------------------------ |
| `v-model`   | `number \| null` | The amount, `null` when empty. Leave it off for local state.       |
| `label`     | `string`         | Required. The symbol is decoration, so say what the amount is for. |
| `hideLabel` | `boolean`        | Keeps the label for screen readers.                                |
| `currency`  | `string`         | ISO 4217 code. Default: the configured currency.                   |
| `locale`    | `string`         | BCP 47 tag used for the symbol. Default: the configured locale.    |
| `min`       | `number`         | Default `0`, so no negatives.                                      |
| `max`       | `number`         | The highest amount.                                                |
| `step`      | `number`         | Default `0.01`. The decimals shown follow the step.                |
| `prefix`    | `string`         | Replaces the symbol.                                               |
| `suffix`    | `string`         | A unit after the value.                                            |
| `name`      | `string`         | Submitted with a form as the number, or empty.                     |
| `hint`      | `string`         | Help under the field.                                              |
| `error`     | `string`         | Replaces the hint, marks the field invalid, announced.             |
| `required`  | `boolean`        | The `required` attribute and the word "Required".                  |
| `optional`  | `boolean`        | The word "Optional".                                               |
| `disabled`  | `boolean`        | Disables the field and its buttons.                                |
| `id`        | `string`         | The input's id. Generated when left out.                           |

## Attributes and listeners

As `ENumberField`: `class` and `style` on the wrapper, everything else on the `<input>`. Exposed: `input` and `focus()`.

## Rules

- The symbol is hidden from screen readers and sits next to the value; a click on it puts the cursor in the input.
- Round to the cent in code, not in the display.
- An unknown currency code falls back to `$`.
