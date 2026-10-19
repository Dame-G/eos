# ETimeline

A newest-first list of events, each with a source chip, a sentence and when it happened. Use it for an activity history.

```vue
<ETimeline
  :items="[
    { kind: 'you', note: 'You paid $40.00 by card.', source: 'Oct 12, 9:41 am, online' },
    { kind: 'system', note: 'A reminder was sent.', source: 'Oct 8, 6:00 am' },
  ]"
/>
```

## Props

| Prop    | Type             | Default | Notes                                                                                                                                                                                              |
| ------- | ---------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items` | `TimelineItem[]` |         | Required. `{ kind: "you" \| "team" \| "system", note: string, source: string }`, newest first. `kind` sets the chip (`system` reads as automatic); `source` is when and from where, never omit it. |

`class`, `style` and attributes land on the `ol` element. Chip words come from the `you`, `team` and `automatic` messages.

## Accessibility

- An ordered list named by the `activity` message ("Activity, newest first"); pass `aria-label` to rename it.
