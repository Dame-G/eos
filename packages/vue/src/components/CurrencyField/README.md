# ECurrencyField

An amount of money: an [`ENumberField`](../NumberField/README.md) with the currency symbol in front, two decimals and no negatives.

```vue
<ECurrencyField v-model="amount" label="Payment amount" :max="balance" hint="Up to your balance." />
<ECurrencyField v-model="amount" label="Montant" currency="EUR" locale="fr-FR" />
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `number \| null` | `null` | `v-model`: the amount. Round to the cent in code. |
| `label` | `string` | **Required** | The visible label. The symbol is decoration, so say what the amount is for. |
| `hideLabel` | `boolean` | `false` | Keeps the label for screen readers and hides it from the page. |
| `currency` | `string` | `configured currency` | ISO 4217 code. An unknown code falls back to the configured currency's symbol. |
| `locale` | `string` | `configured locale` | BCP 47 tag used for the symbol. |
| `min` | `number` | `0` | The lowest value. Use a negative number to allow negative amounts. |
| `max` | `number` | None | The highest value. |
| `step` | `number` | `0.01` | The size of one step of the buttons and arrow keys. Decimals shown follow the step. |
| `prefix` | `string` | None | Replaces the currency symbol before the value. |
| `suffix` | `string` | None | A unit after the value. |
| `name` | `string` | None | The name submitted with a form (the number, or empty). |
| `hint` | `string` | None | Shows help text under the field. |
| `error` | `string` | None | Shows what to fix in place of the hint, marks the field invalid and is announced. |
| `required` | `boolean` | `false` | Sets the `required` attribute and shows a word beside the label. |
| `optional` | `boolean` | `false` | Shows a word beside the label. Use it on whichever of required and optional is rarer. |
| `disabled` | `boolean` | `false` | Disables the field and its buttons. |
| `readonly` | `boolean` | `false` | Shows the value but blocks editing. The input stays focusable and selectable. Both buttons and the keys that change the value do nothing. |
| `id` | `string` | `generated` | The `id` of the input, which the label points at. |

<!-- props:end -->

As `ENumberField`: `class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- The symbol is hidden from screen readers, so the label must say what the amount is.
