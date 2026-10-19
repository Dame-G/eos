# EStatementRow

A one-line statement (stamp, title, amount) that opens to its breakdown. Use it for lists of statements; use `EStatementCard` for one statement on its own.

```vue
<EStatementRow
  title="October statement"
  subtitle="Oct 1 to Oct 31"
  status="due"
  :amount="162.4"
  amount-label="You owe"
  :details="[
    { label: 'Charges', value: 242.4 },
    { label: 'Insurance paid', value: -80 },
  ]"
  reason="Pay by Oct 22 to avoid a late fee."
>
  <template #actions><EButton>Pay now</EButton></template>
</EStatementRow>
```

## Props

Takes the props of `EStatementCard` (`title`, `subtitle`, `status`, `tone`, `label`, `detail`, `amount`, `amountLabel`, `details`, `reason`, `parts`, `activity`, `activityTitle`, `currency`, `locale`), except `headingLevel`. Here `details` are the lines above the total, and `amountLabel` names the total (default `Amount`).

`class`, `style` and attributes land on the `details` element: `open` starts it open, and a shared `name` makes rows in a group open one at a time.

## Slots

| Slot      | Use                                     |
| --------- | --------------------------------------- |
| `actions` | Buttons for the foot of the opened row. |

## Accessibility

- A native `details` with a `summary`: Tab focuses the summary, Enter or Space toggles it.
- The stamp is a `role="img"` named by the status.
