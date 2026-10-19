# EStatementCard

One statement as a flat card: lead amount with the status stamp at the end of the row, a one-sentence reason, label and text parts, a collapsible history, then actions. Use `EStatementRow` for lists of statements.

```vue
<EStatementCard
  title="October statement"
  subtitle="Oct 1 to Oct 31"
  status="due"
  detail="Oct 22"
  :amount="162.4"
  amount-label="You owe"
  reason="This covers your visit on Oct 3. Pay by Oct 22 to avoid a late fee."
  :parts="[{ label: 'How to pay', text: 'Online, by phone or at the desk' }]"
  :activity="[{ kind: 'team', note: 'Statement sent.', source: 'Oct 1' }]"
>
  <template #actions>
    <EButton>Pay now</EButton>
    <EButton variant="outline">Download</EButton>
  </template>
</EStatementCard>
```

## Props

| Prop            | Type                         | Default    | Notes                                                                      |
| --------------- | ---------------------------- | ---------- | -------------------------------------------------------------------------- |
| `title`         | `string`                     |            | Required. In a heading.                                                    |
| `subtitle`      | `string`                     |            | Such as the period covered.                                                |
| `status`        | `StampStatus`                |            | Stamp preset (see `EStamp`).                                               |
| `tone`          | `StampTone`                  |            | Overrides the status's tone.                                               |
| `label`         | `string`                     |            | Overrides the status's word.                                               |
| `detail`        | `string`                     |            | A date or day count after the stamp's word.                                |
| `amount`        | `number`                     |            | Required. The lead amount.                                                 |
| `amountLabel`   | `string`                     |            | What the amount is, such as "You owe".                                     |
| `details`       | `AmountDetail[]`             |            | Lines under the amount (see `EAmount`).                                    |
| `reason`        | `string`                     |            | What this is and what to do, in one sentence.                              |
| `parts`         | `DescriptionItem[]`          |            | Label and text rows (see `EDescriptionList`).                              |
| `activity`      | `TimelineItem[]`             |            | Events, newest first, behind a "History (n)" disclosure (see `ETimeline`). |
| `activityTitle` | `string`                     | `History`  | The disclosure's title.                                                    |
| `currency`      | `string`                     | configured | ISO 4217 code for this card's amounts.                                     |
| `locale`        | `string`                     | configured | BCP 47 tag for this card's amounts.                                        |
| `headingLevel`  | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`        | Heading level of the title.                                                |

`class`, `style` and attributes land on the `article` element.

## Slots

| Slot      | Use                                                       |
| --------- | --------------------------------------------------------- |
| `actions` | Buttons for the foot bar, primary first. No slot, no bar. |

## Accessibility

- An `article` whose title is a heading. Set `headingLevel` so it fits the page's outline.
- The status stamp is a `role="img"` named by its word plus `detail` ("Due, Oct 22"), so status is read as text, not colour.
- The history sits in a native `details` with a `summary` that includes the count, for example "History (3)". It opens with Enter or Space.
- The lead amount is not a live region. Buttons in `actions` need distinct names when several cards are on one page ("Pay October statement").
