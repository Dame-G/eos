# ECalendar

A month grid to choose a day or a span, with names, week start and date order from the configured locale.

```vue
<ECalendar v-model="day" :min="today" />
<ECalendar mode="range" v-model:start="from" v-model:end="to" />
<ECalendar v-model="day" :disabled-date="(d) => d.getDay() === 0" :marked="openDays" mark-label="times available" />
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `Date \| null` | `null` | `v-model`: the chosen day (`single` mode). |
| `start` | `Date \| null` | `null` | `v-model:start`: the first day of the span (`range` mode). |
| `end` | `Date \| null` | `null` | `v-model:end`: the last day of the span (`range` mode). |
| `mode` | `"single" \| "range"` | `"single"` | `single` chooses one day (`v-model`); `range` chooses a span (`v-model:start` and `v-model:end`): the first click sets the start, the second the end, and a click before the start restarts. |
| `disabledDate` | `(date: Date) => boolean` | — | Days that cannot be chosen or focused, such as days with nothing to book. Arrow keys skip them. |
| `marked` | `Date[] \| ((date: Date) => boolean)` | — | Days that get a dot: a list of dates or a function. Screen readers hear `markLabel`. |
| `markLabel` | `string` | `times available` | What screen readers hear on a marked day. |
| `min` | `Date` | — | The earliest day that can be chosen. Earlier days cannot be focused or chosen; navigation stops there. |
| `max` | `Date` | — | The latest day that can be chosen. Later days cannot be focused or chosen; navigation stops there. |
| `month` | `Date` | — | The month to open on, when nothing is chosen. Changing it moves the view. |
| `footer` | `boolean` | `true` | `false` hides the Today and Clear buttons. |
| `clearable` | `boolean` | — | Forces the Clear button on or off. Left out, it shows when a `@clear` listener is attached. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. Dates are local days held at noon. Exposes `view` (`days`, `months`, `years`) and `focusDay()`. The header button steps year, then month, then day (a date of birth is year, month, day).

## Events

| Event         | Payload                                      | Notes                                                  |
| ------------- | -------------------------------------------- | ------------------------------------------------------ |
| `rangeChange` | `{ start: Date \| null, end: Date \| null }` | `range` mode, after every click that changes the span. |
| `clear`       |                                              | The Clear button.                                      |

## Accessibility

| Key                | Days                                     | Months and years        |
| ------------------ | ---------------------------------------- | ----------------------- |
| Arrows             | Day and week (mirrored in right to left) | Cell, three columns     |
| Home, End          | First and last day of the week           | First and last          |
| Page Up, Page Down | Month; with Shift, year                  | Years: twelve at a time |
| Enter, Space       | Choose                                   | Choose                  |
| Escape             | Left to the caller (a popup closes)      | Back to the days        |

- A `role="grid"` with one day in the tab order (roving tabindex); each day is named in full, and marked days add `markLabel`.
- The title is a polite live region; `range` mode announces the range and its length.
