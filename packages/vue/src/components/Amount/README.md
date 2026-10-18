# EAmount

One amount in mono tabular figures, with an optional label and, only when they add information, a few lines beneath.

```vue
<EAmount label="You owe" :amount="162.4" :details="[{ label: 'Insurance paid', value: 80 }]" />
```

## Props

| Prop       | Type                                           | Notes                                                                       |
| ---------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| `amount`   | `number`                                       | The lead amount. Required.                                                  |
| `label`    | `string`                                       | What it is: "You owe", "Paid", "Balance". A small uppercase label above it. |
| `details`  | `{ label: string; value: number \| string }[]` | Lines under the amount. A number is shown as money, text as it is.          |
| `currency` | `string`                                       | ISO 4217 code for this figure. Overrides the configured currency.           |
| `locale`   | `string`                                       | BCP 47 tag for this figure. Overrides the configured locale.                |

`class`, `style` and `data-*` attributes fall through to the root element.

## Rules

- Show one lead amount per statement. The label says what it is.
- Money uses `Intl.NumberFormat` with the configured currency and locale (`createEos({ currency: "EUR", locale: "de-DE" })` turns $162.40 into 162,40 €), always with two decimals.
- Add `details` only when they add information. Do not repeat the amount in them.
