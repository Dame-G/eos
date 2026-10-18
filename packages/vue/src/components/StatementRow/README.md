# EStatementRow

A one-line statement: stamp, title and subtitle, amount. It opens to the breakdown. It is a native `details`, clickable, so it has an underside that darkens and a tinted background on hover; what is inside is flat.

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

The same as EStatementCard (`title`, `subtitle`, `status`, `tone`, `label`, `amount`, `amountLabel`, `details`, `reason`, `parts`, `activity`, `activityTitle`, `currency`, `locale`), except that there is no `headingLevel` (the title is not a heading). `detail` is shown in the stamp, as on the card. Here `details` are the lines of the totals box above the total, and `amountLabel` names the total (default "Amount").

## Slots

| Slot      | Use                                                |
| --------- | -------------------------------------------------- |
| `actions` | Buttons for the bar at the foot of the opened row. |

## Attributes

Everything falls through to the `details` element: `class`, `id`, `data-*`, `open` to start it open, `name` to make rows in a group open one at a time.

## Accessibility

- A real `details` and `summary`: Tab focuses the summary, Enter or Space opens and closes it.
- The stamp is an image with the status as its name; the summary reads as stamp, title, subtitle, amount.
- The totals are a description list (`dl`) in a Surface.

## Rules

- Opened, it reads top to bottom: the reason in one sentence, beside (or, when narrow, above) the breakdown that adds up to what is owed; then label and text rows; the history; and the Buttons.
- The amount shows once in the row and once as the total, never as a third big figure.
- Use rows for a list of statements; the stamps and amounts line up down the list.
- The layout of the opened row follows the width of the row (34rem), not of the screen.

## Typed activity

`activity` takes `TimelineItem[]`. An inline array literal is checked in place; an array declared elsewhere needs the type, so `kind` is not widened to `string`:

```ts
import type { TimelineItem } from "@eos-ui/vue";

const activity: TimelineItem[] = [{ kind: "team", note: "Statement sent.", source: "Oct 1" }];
```
