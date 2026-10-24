# ECurrencyField

An amount of money: an [`ENumberField`](../NumberField/README.md) with the currency symbol in front, the currency's own decimals and no negatives.

```vue
<ECurrencyField v-model="amount" label="Payment amount" :max="balance" hint="Up to your balance." />
<ECurrencyField v-model="amount" label="Montant" currency="EUR" locale="fr-FR" />
```

## Props

<!-- props:start -->

| Prop         | Type                   | Default                                                      | Notes                                                                                                      |
| ------------ | ---------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `modelValue` | `number \| null`       | `null`                                                       | `v-model`: the amount. Round to the cent in code.                                                          |
| `hideLabel`  | `boolean`              | `false`                                                      | Hides the label from the page and keeps it for screen readers.                                             |
| `hint`       | `string`               | None                                                         | Help that stays under the control.                                                                         |
| `error`      | `string`               | None                                                         | What to fix. Replaces the hint, marks the control invalid and is announced.                                |
| `required`   | `boolean`              | `false`                                                      | Sets the `required` attribute and shows "Required" beside the label.                                       |
| `optional`   | `boolean`              | `false`                                                      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                   |
| `disabled`   | `boolean`              | `false`                                                      | Disables the control. A disabled control posts nothing.                                                    |
| `readonly`   | `boolean`              | `false`                                                      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value. |
| `id`         | `string`               | `generated`                                                  | The id of the control. The label points at it.                                                             |
| `size`       | `"sm" \| "md" \| "lg"` | `"md"`                                                       | The height of the box: `sm` and `lg` are a step under and over the control height.                         |
| `label`      | `string`               | **Required**                                                 | The visible label. The symbol is decoration, so say what the amount is for.                                |
| `currency`   | `string`               | `configured currency`                                        | ISO 4217 code. An unknown code falls back to the configured currency's symbol.                             |
| `locale`     | `string`               | `configured locale`                                          | BCP 47 tag for the symbol, the separators the amount is written with and how typed text is read.           |
| `min`        | `number`               | `0`                                                          | The lowest value. Use a negative number to allow negative amounts.                                         |
| `max`        | `number`               | None                                                         | The highest value.                                                                                         |
| `step`       | `number`               | `the currency's smallest unit (0.01 for dollars, 1 for yen)` | The size of one step of the buttons and arrow keys. Decimals shown follow the step.                        |
| `prefix`     | `string`               | None                                                         | Replaces the currency symbol before the value.                                                             |
| `suffix`     | `string`               | None                                                         | A unit after the value.                                                                                    |
| `name`       | `string`               | None                                                         | The name submitted with a form (the number, or empty). Posts nothing while disabled.                       |

<!-- props:end -->

As `ENumberField` (including `size` and the posting of `name`): `class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- The symbol is hidden from screen readers, so the label must say what the amount is.

## Keyboard

| Key                               | Action                                            |
| --------------------------------- | ------------------------------------------------- |
| Arrow Up, Arrow Down              | Step by the currency's smallest unit (or `step`). |
| Shift + Arrow, Page Up, Page Down | Step by ten.                                      |
| Home, End                         | Go to `min` and `max` when they are set.          |

## Related

[`ENumberField`](../NumberField/README.md) for any other number, [`ETextField`](../TextField/README.md) for text.
