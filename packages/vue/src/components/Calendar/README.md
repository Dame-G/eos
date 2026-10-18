# ECalendar

The month grid behind the date pickers, usable alone: choose a day, or a span, with the keyboard or the pointer. Custom (no date library, no native date input); names, week start and date order follow the configured locale.

```vue
<ECalendar v-model="day" :min="today" />
<ECalendar mode="range" v-model:start="from" v-model:end="to" />
<ECalendar v-model="day" :disabled-date="(d) => d.getDay() === 0" :marked="openDays" mark-label="times available" />
```

## Props

| Prop                           | Type                                | Notes                                                                                                  |
| ------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `v-model`                      | `Date \| null`                      | The chosen day (single mode). Leave it off for local state.                                            |
| `v-model:start`, `v-model:end` | `Date \| null`                      | The span (range mode).                                                                                 |
| `mode`                         | `"single" \| "range"`               | Default `single`.                                                                                      |
| `min`, `max`                   | `Date`                              | Days outside are faded and cannot be focused or chosen; the month arrows, months and years stop there. |
| `month`                        | `Date`                              | The month to open on when nothing is chosen. Changing it moves the view.                               |
| `disabledDate`                 | `(date: Date) => boolean`           | Days with nothing to book: faded, disabled, skipped by the arrow keys.                                 |
| `marked`                       | `Date[] \| (date: Date) => boolean` | Days that get a dot (days with open times). Pair it with `ESlotPicker`.                                |
| `markLabel`                    | `string`                            | What screen readers hear on a marked day. Default "times available".                                   |
| `footer`                       | `boolean`                           | `false` hides Today and Clear. Default shown.                                                          |

## Events

| Event         | Payload                                      | Notes                                                                    |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| `rangeChange` | `{ start: Date \| null, end: Date \| null }` | Range mode, after every click that changes the span.                     |
| `clear`       | none                                         | The Clear button. It is only shown when a `@clear` listener is attached. |

Exposed: `view` (`days`, `months` or `years`) and `focusDay()`. `class`, `style` and other attributes land on the root `div.e-cal`.

## Views

One button in the header shows the month and year ("October 2026"). It opens the years; choosing a year opens that year's months; choosing a month opens its days. A date of birth is year, month, day, and the month is never set before the year. Each step has a Back button and a plain title ("Choose a year", "Choose a month in 2026"). Back goes up one step and Escape returns to the days, with focus on the day.

## Keyboard

| Key                | Days                                     | Months and years        |
| ------------------ | ---------------------------------------- | ----------------------- |
| Arrows             | Day and week (mirrored in right to left) | Cell, three columns     |
| Home, End          | First and last day of the week           | First and last          |
| Page Up, Page Down | Month; with Shift, year                  | Years: twelve at a time |
| Enter, Space       | Choose                                   | Choose                  |
| Escape             | Left to the caller (a popup closes)      | Back to the days        |

Arrows, Home, End and the Page keys step over days that cannot be chosen. One day is in the tab order (the focused one); the grid uses a roving tabindex.

## Marks

Today has a black ring, the chosen day is filled `primary` and bold, days inside a range are tinted, open days carry a dot, unavailable days are faded and disabled. Days are 44px square. In forced-colors mode the selected day uses `Highlight`.

Range mode adds a line under the grid, announced politely: what to do next, then the range and its length ("Oct 4 to Oct 18 (15 days)"). The first click sets the start, the second the end; clicking before the start restarts. Moving over days previews the span.

## Accessibility

- A `role="grid"` table with column headers (`abbr` carries the full weekday). Each day is a button named in full ("Thursday, October 22, 2026, today"); marked days add the mark label, and selected days set `aria-selected` on their cell.
- The title is a polite live region, so a changed month or year is announced. The month and year button is named "Choose year and month, now October 2026".
- Months and years are `aria-pressed` buttons in a labelled group; the current one has `aria-current="date"`. A month button shows three letters and is named in full.
- Movement respects `prefers-reduced-motion`.

## Rules

- Words come from `useMessages` (`today`, `clear`, `prevMonth`, `nextMonth`, `chooseAYear` and the rest); names and order come from `useLocale`, so `createEos({ locale })` re-renders them. With `createEos({ dir: "rtl" })` the grid mirrors and ArrowRight goes to the previous day.
- Dates are local days held at noon, so daylight saving never shifts a day.
