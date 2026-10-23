# ERangePicker

Two date boxes and one calendar popup for choosing a date span, with presets. Use [`EDatePicker`](../DatePicker/README.md) for a single date.

```vue
<ERangePicker v-model:start="from" v-model:end="to" label="Dates" start-name="from" end-name="to" />
```

## Props

<!-- props:start -->

| Prop           | Type                                  | Default                                 | Notes                                                                                                                                                                          |
| -------------- | ------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `start`        | `Value`                               | `null as never`                         | `v-model:start`: the first date of the span: a `Date`, or a `YYYY-MM-DD` string with `valueFormat="iso"`. `null` when empty.                                                   |
| `end`          | `Value`                               | `null as never`                         | `v-model:end`: the last date of the span, in the same form as `start`.                                                                                                         |
| `open`         | `boolean`                             | `false`                                 | `v-model:open`: whether the calendar is open. A disabled field never opens.                                                                                                    |
| `label`        | `string`                              | **Required**                            | The visible label above the field. It also names the group.                                                                                                                    |
| `hideLabel`    | `boolean`                             | `false`                                 | Keeps the label for screen readers and hides it from the page.                                                                                                                 |
| `hint`         | `string`                              | None                                    | Help that stays under the field.                                                                                                                                               |
| `error`        | `string`                              | None                                    | What to fix. Replaces the hint and marks both boxes invalid. A typed span that cannot be used shows its own error.                                                             |
| `required`     | `boolean`                             | `false`                                 | Sets the `required` attribute and adds a word beside the label.                                                                                                                |
| `optional`     | `boolean`                             | `false`                                 | Adds a word beside the label. Use it when most fields in the form are required.                                                                                                |
| `disabled`     | `boolean`                             | `false`                                 | Disables both boxes and the button. A disabled field is not submitted.                                                                                                         |
| `readonly`     | `boolean`                             | `false`                                 | Shows the span but blocks editing. The boxes stay focusable and selectable. The calendar button is disabled and the calendar does not open. The dates are still submitted.     |
| `min`          | `Date`                                | None                                    | The earliest date that can be chosen or typed.                                                                                                                                 |
| `max`          | `Date`                                | None                                    | The latest date that can be chosen or typed.                                                                                                                                   |
| `disabledDate` | `(date: Date) => boolean`             | None                                    | Days that cannot be chosen, in the calendar or by typing.                                                                                                                      |
| `marked`       | `Date[] \| ((date: Date) => boolean)` | None                                    | Days that get a dot in the calendar: a list of dates or a function.                                                                                                            |
| `valueFormat`  | `F`                                   | `"date"`                                | What `v-model:start` and `v-model:end` hold. `date` is a `Date` (a local day at noon). `iso` is a `YYYY-MM-DD` string, or `null` for no date, which has no time zone to shift. |
| `startName`    | `string`                              | None                                    | Submits the first date as `YYYY-MM-DD` with a form, through a hidden input.                                                                                                    |
| `endName`      | `string`                              | None                                    | Submits the last date as `YYYY-MM-DD` with a form, through a hidden input.                                                                                                     |
| `presets`      | `RangePreset[]`                       | `Last 7 days, Last 30 days, This month` | Buttons under the calendar. Each sets the span and closes the calendar. A span is cut to `min` and `max`, and a button whose whole span lies outside them is disabled.         |
| `id`           | `string`                              | `generated`                             | The id of the start box, which the label points at.                                                                                                                            |

<!-- props:end -->

With `valueFormat="iso"`, `start` and `end` are `YYYY-MM-DD` strings. An empty date is `null`, as for every date and number control (string controls use `""`). A disabled field is not submitted; a read-only one is, and its boxes stay focusable.

`class` and `style` land on the wrapper `div`. Other attributes land on the `div` with `role="group"` around the boxes. Exposes `input` (the start box) and `focus()`. Typed dates follow the locale like `EDatePicker`. An unreadable date, one outside `min` or `max` or on a `disabledDate`, or an end before the start shows an error and keeps the old value. A preset is cut to `min` and `max`, and one with nothing left inside them is disabled.

## Accessibility

- The boxes are named "Start date" and "End date" and grouped under the label. Their placeholder is the date format, as in `EDatePicker`.
- The "Choose dates" button opens a dialog. Alt + Down in either box also opens it.
- Escape closes the popup (from the months or years it goes back to the days first).

## Keyboard

| Key              | Does                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| Alt + Arrow Down | Opens the calendar from either box                                   |
| Enter            | Reads the typed dates                                                |
| Escape           | Closes the calendar (from months or years, back to the days first)   |
| Other keys       | See [`ECalendar`](../Calendar/README.md) for moving around the month |

## Related

[`EDatePicker`](../DatePicker/README.md) for one date, [`ECalendar`](../Calendar/README.md) in `range` mode to show the span inline.
