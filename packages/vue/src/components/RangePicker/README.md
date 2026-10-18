# ERangePicker

Two date boxes and one calendar for choosing a span. Typing in either box works like `EDatePicker`; the calendar sits in a popup (Reka UI's Popover) with presets under it. Built on `EField`.

```vue
<ERangePicker v-model:start="from" v-model:end="to" label="Dates" start-name="from" end-name="to" />
```

## Props

| Prop                           | Type                                             | Notes                                                                                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `v-model:start`, `v-model:end` | `Date \| null`                                   | The span. Leave them off for local state.                                                                                                                                                                                                           |
| `v-model:open`                 | `boolean`                                        | Whether the calendar is open. Set it to open it from outside, or to start open; it follows the person's own opening and closing. Leave it off for local state. Opening or closing it from outside moves no focus, and a disabled field never opens. |
| `label`                        | `string`                                         | Required. A mono kicker above the field; the field is a group named by it.                                                                                                                                                                          |
| `hideLabel`                    | `boolean`                                        | Keeps the label for screen readers and removes it from the page.                                                                                                                                                                                    |
| `hint`                         | `string`                                         | Help under the field, 8px below it.                                                                                                                                                                                                                 |
| `error`                        | `string`                                         | Replaces the hint and marks both boxes invalid.                                                                                                                                                                                                     |
| `required`, `optional`         | `boolean`                                        | The word beside the label.                                                                                                                                                                                                                          |
| `disabled`                     | `boolean`                                        | Both boxes and the button.                                                                                                                                                                                                                          |
| `min`, `max`                   | `Date`                                           | Earliest and latest date, typed or chosen.                                                                                                                                                                                                          |
| `startName`, `endName`         | `string`                                         | Submit the two dates as `YYYY-MM-DD` through hidden inputs.                                                                                                                                                                                         |
| `presets`                      | `{ label: string, get: () => { start, end } }[]` | Buttons under the calendar. Defaults: Last 7 days, Last 30 days, This month.                                                                                                                                                                        |
| `id`                           | `string`                                         | The start box's id; the label points at it.                                                                                                                                                                                                         |

Exposed: `input` (the start box) and `focus()`. `class` and `style` stay on the wrapper (`div.e-field`); other attributes land on the boxed control (`div.e-input-wrap`).

## Choosing

The first click in the calendar sets the start, the second sets the end and closes the popup; clicking before the start restarts the range. A line under the grid says what to do next, then the span and its length. Escape closes (from the months or years it goes back to the days first). A preset sets the span and closes.

## Typing

Each box takes the locale's order like `EDatePicker`. On blur or Enter both are read: a date that cannot be read shows `datesError`, one outside `min` and `max` shows `dateBetween`, and an end before the start shows `endBeforeStart`. The value stays as it was.

## Accessibility

- The boxes are named "Start date" and "End date" (`startDate`, `endDate`) and grouped under the label; the "to" between them is hidden from screen readers.
- The button is "Choose dates", `aria-haspopup="dialog"`; the popup is a dialog in the portal target with the class `e-root`.
- Alt + Down in either box opens the calendar.
