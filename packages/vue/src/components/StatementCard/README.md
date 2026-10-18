# EStatementCard

One statement as a flat card (the card is not clickable; its Buttons are): a stamp, the lead amount, a one-sentence reason, label and text parts, a History disclosure, then the actions. It is an ESurface (`article`) with an EStamp, EAmount, EDescriptionList, EDisclosure and ETimeline.

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

| Prop                 | Type                  | Notes                                                            |
| -------------------- | --------------------- | ---------------------------------------------------------------- |
| `title`              | `string`              | In a heading. Required.                                          |
| `subtitle`           | `string`              | Under the title, such as the period covered.                     |
| `status`             | `StampStatus`         | A preset for the stamp (see EStamp). Or give `tone` and `label`. |
| `tone`, `label`      | `StampTone`, `string` | Override the status's tone and word.                             |
| `detail`             | `string`              | A due date or day count after the stamp's word.                  |
| `amount`             | `number`              | The lead amount. Required.                                       |
| `amountLabel`        | `string`              | What the amount is ("You owe", "Paid").                          |
| `details`            | `{ label, value }[]`  | Lines under the amount. See EAmount.                             |
| `reason`             | `string`              | What this is and what to do, in one plain sentence.              |
| `parts`              | `{ label, text }[]`   | What it covers, how to pay, when it is due. Up to three.         |
| `activity`           | `TimelineItem[]`      | Events, newest first, behind a "History (n)" disclosure.         |
| `activityTitle`      | `string`              | The disclosure's title. Default "History".                       |
| `currency`, `locale` | `string`              | Override the configured currency and locale for this card.       |
| `headingLevel`       | `1 \| 2 \| 3 \| 4`    | Default 3.                                                       |

## Slots

| Slot      | Use                                                                             |
| --------- | ------------------------------------------------------------------------------- |
| `actions` | Buttons for the bar at the foot: Pay now first, then Download. No slot, no bar. |

`class`, `style`, `id` and other attributes fall through to the `article`.

## Rules

- The reason comes first: what this is and what to do, in plain words.
- One lead amount, up to three parts, history behind the disclosure.
- Lay statements out in an EGrid, most urgent first. A status is never folded into a score.
- In print the card keeps a 1px border, does not break across pages and the actions are hidden.
