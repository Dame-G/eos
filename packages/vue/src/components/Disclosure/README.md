# AeDisclosure

A section that opens and closes, on the native `details` element so it works without script. The chevron turns when it is open.

```vue
<AeDisclosure title="History (4)">
  <AeTimeline :items="history" />
</AeDisclosure>
```

## Props

| Prop           | Type              | Default | Notes                                                                                      |
| -------------- | ----------------- | ------- | ------------------------------------------------------------------------------------------ |
| `title`        | `string`          |         | The summary line.                                                                          |
| `variant`      | `"row" \| "card"` | `row`   | `row` is flush, with a divider above and a mono title. `card` is a roomy row for stacking. |
| `meta`         | `string`          |         | A short note at the right of the summary. Card variant only.                               |
| `group`        | `string`          |         | Rows that share a group open one at a time (the native `name` of `details`).               |
| `v-model:open` | `boolean`         |         | Whether it is open. Set it once to start open. Without a binding it keeps its own state.   |

`class`, `style` and attributes fall through to the `details` element. The default slot is the content.

## Accessibility

- Native `details`: the summary is a button for the keyboard (Enter and Space) and the open state is announced by the browser.
- The summary has the shared focus ring.
- The chevron does not move under `prefers-reduced-motion: reduce`.

## Rules

- A StatementCard uses it for History. Use AeAccordion for a stack of them.
