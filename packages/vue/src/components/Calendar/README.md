# ECalendar

A month grid to choose a day or a span, with names, week start and date order from the configured locale.

```vue
<ECalendar v-model="day" :min="today" />
<ECalendar mode="range" v-model:start="from" v-model:end="to" />
<ECalendar v-model="day" :disabled-date="(d) => d.getDay() === 0" :marked="openDays" mark-label="times available" />
```

## Props

<!-- props:start -->

| Prop           | Type                                  | Default             | Notes                                                                                                                                                                                        |
| -------------- | ------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`   | `Date \| null`                        | `null`              | `v-model`: the chosen day (`single` mode).                                                                                                                                                   |
| `start`        | `Date \| null`                        | `null`              | `v-model:start`: the first day of the span (`range` mode).                                                                                                                                   |
| `end`          | `Date \| null`                        | `null`              | `v-model:end`: the last day of the span (`range` mode).                                                                                                                                      |
| `mode`         | `"single" \| "range"`                 | `"single"`          | `single` chooses one day (`v-model`). `range` chooses a span (`v-model:start` and `v-model:end`): the first click sets the start, the second the end, and a click before the start restarts. |
| `disabledDate` | `(date: Date) => boolean`             | None                | Days that cannot be chosen or focused, such as days with nothing to book. Arrow keys skip them.                                                                                              |
| `marked`       | `Date[] \| ((date: Date) => boolean)` | None                | Days that get a dot: a list of dates or a function. Screen readers hear `markLabel`.                                                                                                         |
| `markLabel`    | `string`                              | `"times available"` | What screen readers hear on a marked day.                                                                                                                                                    |
| `min`          | `Date`                                | None                | The earliest day that can be chosen. Earlier days cannot be focused or chosen, and navigation stops there.                                                                                   |
| `max`          | `Date`                                | None                | The latest day that can be chosen. Later days cannot be focused or chosen, and navigation stops there.                                                                                       |
| `month`        | `Date`                                | None                | The month to open on, when nothing is chosen. Changing it moves the view.                                                                                                                    |
| `footer`       | `boolean`                             | `true`              | Shows the Today button and, with `clearable`, the Clear button. `false` hides both.                                                                                                          |
| `clearable`    | `boolean`                             | `false`             | Shows the Clear button in the footer. It emits `clear`.                                                                                                                                      |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. Dates are local days held at noon. Exposes `view` (`days`, `months`, `years`) and `focusDay()`. The header button steps year, then month, then day (a date of birth is year, month, day). "Today" is read again at midnight.

## Events

| Event          | Payload                                      | Notes                                                                                                                                                                      |
| -------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rangeChange`  | `{ start: Date \| null, end: Date \| null }` | `range` mode, after every click that changes the span.                                                                                                                     |
| `clear`        |                                              | The Clear button was pressed.                                                                                                                                              |
| `update:month` | `Date`                                       | The visible month changed (arrows, keys, pickers or the `month` prop). The payload is its first day: load `marked` or `disabledDate` data for it, or bind `v-model:month`. |

## Accessibility

- A `role="grid"` with one day in the tab order (roving tabindex), never a disabled day. Each day is named in full, today has `aria-current="date"`, and marked days add `markLabel`.
- A polite live region announces the month when it changes. `range` mode announces the range and its length.
- Month and date order, names and the week start follow the configured locale. Direction is `createEos({ dir })`, else the locale's (right to left mirrors the grid and the arrow keys).

## Keyboard

| Key                | Days                                     | Months and years        |
| ------------------ | ---------------------------------------- | ----------------------- |
| Arrows             | Day and week (mirrored in right to left) | Cell, three columns     |
| Home, End          | First and last day of the week           | First and last          |
| Page Up, Page Down | Month, or year with Shift                | Years: twelve at a time |
| Enter, Space       | Choose                                   | Choose                  |
| Escape             | Left to the caller (a popup closes)      | Back to the days        |

Arrow keys step over disabled days.

## Related

[`EDatePicker`](../DatePicker/README.md) and [`ERangePicker`](../RangePicker/README.md) put it in a field with a popup.
