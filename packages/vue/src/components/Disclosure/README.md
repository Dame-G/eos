# EDisclosure

A section that opens and closes, for secondary detail. Use `EAccordion` for a stack of them.

```vue
<EDisclosure title="History (4)">
  <ETimeline :items="history" />
</EDisclosure>
```

## Props

| Prop      | Type              | Default | Notes                                                                       |
| --------- | ----------------- | ------- | --------------------------------------------------------------------------- |
| `title`   | `string`          |         | Required. The summary line.                                                 |
| `variant` | `"row" \| "card"` | `row`   | `row` is flush with a divider above; `card` is a roomy row for stacking.    |
| `meta`    | `string`          |         | A short note at the right of the summary. `card` only.                      |
| `group`   | `string`          |         | Rows sharing a group open one at a time (the native `name` of `details`).   |
| `open`    | `boolean`         |         | v-model:open: whether it is open. Without a binding it keeps its own state. |

`class`, `style` and attributes land on the `details` element. Stacked `card` disclosures are 8px apart; inside an `EAccordion` they sit flush.

## Slots

| Slot      | Use                    |
| --------- | ---------------------- |
| `default` | What opens and closes. |

## Accessibility

- A native `details`: the summary is keyboard operable (Enter, Space) and the open state is announced.
