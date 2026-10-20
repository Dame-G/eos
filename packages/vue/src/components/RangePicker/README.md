# ERangePicker

Two date boxes and one calendar popup for choosing a date span, with presets. Use `EDatePicker` for a single date.

```vue
<ERangePicker v-model:start="from" v-model:end="to" label="Dates" start-name="from" end-name="to" />
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `start` | `Date \| null` | `null` | `v-model:start`: the first date of the span. |
| `end` | `Date \| null` | `null` | `v-model:end`: the last date of the span. |
| `open` | `boolean` | `false` | `v-model:open`: whether the calendar is open. A disabled field never opens. |
| `label` | `string` | **Required** | The visible label, a mono kicker above the field. It also names the group. |
| `hideLabel` | `boolean` | `false` | Keep the label for screen readers and remove it from the page. |
| `hint` | `string` | — | Help that stays under the field. |
| `error` | `string` | — | What to fix. Replaces the hint and marks both boxes invalid. A typed span that cannot be used shows its own error. |
| `required` | `boolean` | `false` | The `required` attribute and a word beside the label. |
| `optional` | `boolean` | `false` | A word beside the label. Flag whichever is rarer. |
| `disabled` | `boolean` | `false` | Disables both boxes and the button. |
| `min` | `Date` | — | The earliest date that can be chosen or typed. |
| `max` | `Date` | — | The latest date that can be chosen or typed. |
| `startName` | `string` | — | Submits the first date as `YYYY-MM-DD` with a form, through a hidden input. |
| `endName` | `string` | — | Submits the last date as `YYYY-MM-DD` with a form, through a hidden input. |
| `presets` | `RangePreset[]` | `Last 7 days, Last 30 days, This month` | Buttons under the calendar; one sets the span and closes. |
| `id` | `string` | `generated` | The id of the start box; the label points at it. |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes land on the `div` with `role="group"` around the boxes. Exposes `input` (the start box) and `focus()`. Typed dates follow the locale like `EDatePicker`. An unreadable date, one outside `min` or `max`, or an end before the start shows an error and keeps the old value.

## Accessibility

- The boxes are named "Start date" and "End date" and grouped under the label.
- The "Choose dates" button opens a dialog; Alt + Down in either box also opens it.
- Escape closes the popup (from the months or years it goes back to the days first).
