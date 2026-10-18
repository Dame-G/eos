# ETimeline

A list of events, newest first. Each row has a source chip (You, Practice or Automatic), a sentence and when it happened.

```vue
<ETimeline
  :items="[
    { kind: 'you', note: 'You paid $40.00 by card.', source: 'Oct 12, 9:41 am, online' },
    { kind: 'system', note: 'A reminder was sent.', source: 'Oct 8, 6:00 am' },
  ]"
/>
```

## Props

| Prop    | Type           | Notes  |
| ------- | -------------- | ------ |
| `items` | `{ kind: "you" | "team" | "system" | "you" | "team" | "system" | "you" | "team" | "system"; note: string; source: string }[]` | Newest first. `system` reads as "Automatic". |

The chip words come from the messages `you`, `team` and `automatic`.

## Accessibility

- A real ordered list (`ol`, one `li` per event) named "Activity, newest first" (the `activity` message). Pass `aria-label` to name it differently.
- `class`, `style`, `id` and other attributes fall through to the `ol`.

## Rules

- Always say who did it and when. Never leave an event without a source.
- Inside a statement, put it behind a disclosure (EStatementCard and EStatementRow do).
