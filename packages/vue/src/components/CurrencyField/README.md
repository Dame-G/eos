# ECurrencyField

An amount of money: an [`ENumberField`](../NumberField/README.md) with the currency symbol in front, two decimals and no negatives.

```vue
<ECurrencyField v-model="amount" label="Payment amount" :max="balance" hint="Up to your balance." />
<ECurrencyField v-model="amount" label="Montant" currency="EUR" locale="fr-FR" />
```

## Props

<!-- props:start -->

| Prop         | Type             | Default               | Notes                                                                                                                                     |
| ------------ | ---------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `number \| null` | `null`                | `v-model`: the amount; round to the cent in code.                                                                                         |
| `label`      | `string`         | **Required**          | The visible label, a mono kicker above the field. The symbol is decoration, so say what the amount is for.                                |
| `hideLabel`  | `boolean`        | `false`               | Keep the label for screen readers and remove it from the page.                                                                            |
| `currency`   | `string`         | `configured currency` | ISO 4217 code. An unknown code falls back to the configured currency's symbol.                                                            |
| `locale`     | `string`         | `configured locale`   | BCP 47 tag used for the symbol.                                                                                                           |
| `min`        | `number`         | `0`                   | The lowest value, so no negatives by default.                                                                                             |
| `max`        | `number`         | —                     | The highest value.                                                                                                                        |
| `step`       | `number`         | `0.01`                | The size of one step of the buttons and arrow keys. Decimals shown follow the step.                                                       |
| `prefix`     | `string`         | —                     | Replaces the currency symbol before the value.                                                                                            |
| `suffix`     | `string`         | —                     | A unit after the value.                                                                                                                   |
| `name`       | `string`         | —                     | The name submitted with a form (the number, or empty).                                                                                    |
| `hint`       | `string`         | —                     | Help that stays under the field.                                                                                                          |
| `error`      | `string`         | —                     | What to fix. Replaces the hint, marks the field invalid and is announced.                                                                 |
| `required`   | `boolean`        | `false`               | The `required` attribute and a word beside the label.                                                                                     |
| `optional`   | `boolean`        | `false`               | A word beside the label. Flag whichever is rarer.                                                                                         |
| `disabled`   | `boolean`        | `false`               | Disables the field and its buttons.                                                                                                       |
| `readonly`   | `boolean`        | `false`               | Shows the value but blocks editing. The input stays focusable and selectable. Both buttons and the keys that change the value do nothing. |
| `id`         | `string`         | `generated`           | The id of the input; the label points at it.                                                                                              |

<!-- props:end -->

As `ENumberField`: `class` and `style` land on the wrapper `div`; other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- The symbol is hidden from screen readers, so the label must say what the amount is.
