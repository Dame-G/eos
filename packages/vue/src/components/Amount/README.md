# EAmount

One amount in mono tabular figures, with an optional label and detail lines, for statements and balances.

```vue
<EAmount label="You owe" :amount="162.4" :details="[{ label: 'Insurance paid', value: 80 }]" />
```

## Props

| Prop       | Type                                           | Default | Notes                                                           |
| ---------- | ---------------------------------------------- | ------- | --------------------------------------------------------------- |
| `amount`   | `number`                                       |         | Required. The lead amount, always two decimals.                 |
| `label`    | `string`                                       |         | What it is ("You owe", "Paid"), shown small above.              |
| `currency` | `string`                                       |         | ISO 4217 code; overrides the configured currency.               |
| `locale`   | `string`                                       |         | BCP 47 tag; overrides the configured locale.                    |
| `details`  | `{ label: string; value: number \| string }[]` |         | Lines under the amount. A number is shown as money, text as is. |

`class`, `style` and attributes land on the `div` element. Formatting uses `Intl.NumberFormat` with the currency and locale from `createEos`. Show one lead amount per statement and do not repeat it in `details`.

## Accessibility

- Plain text in `span`s with no role and no live region. A change to the amount is not announced; announce it with `useToast` or your own live region.
- The label and the figure are separate spans and read in order ("You owe", then the amount). Pass a `label` when the figure is not clear from the surrounding heading.
- Detail lines read as "label amount" with no separator; keep each label short.
- Meaning comes from the text, never from colour or size.
