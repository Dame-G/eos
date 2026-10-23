# EDatePicker

A date field with a text box in the locale's order and a button that opens an [`ECalendar`](../Calendar/README.md) popup. There is no native date input.

```vue
<EDatePicker v-model="born" label="Date of birth" name="dob" required :max="today" />
```

## Props

<!-- props:start -->

| Prop           | Type                                              | Default         | Notes                                                                                                                                                   |
| -------------- | ------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`   | `F extends "iso" ? string \| null : Date \| null` | `null as never` | `v-model`: the chosen date: a `Date`, or a `YYYY-MM-DD` string with `valueFormat="iso"`. `null` when empty.                                             |
| `open`         | `boolean`                                         | `false`         | `v-model:open`: whether the calendar is open. Setting it moves no focus, and a disabled field never opens.                                              |
| `label`        | `string`                                          | **Required**    | The visible label.                                                                                                                                      |
| `hideLabel`    | `boolean`                                         | `false`         | Keeps the label for screen readers and hides it from the page.                                                                                          |
| `hint`         | `string`                                          | None            | Shows help text under the field.                                                                                                                        |
| `error`        | `string`                                          | None            | Shows what to fix in place of the hint and marks the field invalid. A typed date that cannot be used shows its own error (`dateError`, `dateBetween`).  |
| `required`     | `boolean`                                         | `false`         | Sets the `required` attribute and shows a word beside the label.                                                                                        |
| `optional`     | `boolean`                                         | `false`         | Shows a word beside the label. Use it on whichever of required and optional is rarer.                                                                   |
| `disabled`     | `boolean`                                         | `false`         | Disables the field and its calendar button.                                                                                                             |
| `readonly`     | `boolean`                                         | `false`         | Shows the date but blocks editing. The input stays focusable and selectable. The calendar button is disabled and the calendar does not open.            |
| `min`          | `Date`                                            | None            | The earliest date that can be chosen or typed.                                                                                                          |
| `max`          | `Date`                                            | None            | The latest date that can be chosen or typed.                                                                                                            |
| `disabledDate` | `(date: Date) => boolean`                         | None            | Days that cannot be chosen, in the calendar or by typing, such as days with nothing to book.                                                            |
| `marked`       | `Date[] \| ((date: Date) => boolean)`             | None            | Days that get a dot in the calendar: a list of dates or a function.                                                                                     |
| `footer`       | `boolean`                                         | `true`          | Shows the calendar's Today and Clear buttons.                                                                                                           |
| `valueFormat`  | `F`                                               | `"date"`        | What `v-model` holds. `date` is a `Date` (a local day at noon). `iso` is a `YYYY-MM-DD` string, or `null` for no date, which has no time zone to shift. |
| `name`         | `string`                                          | None            | Submits the date as `YYYY-MM-DD` with a form, through a hidden input. A disabled field is not submitted.                                                |
| `id`           | `string`                                          | `generated`     | The `id` of the text box, which the label points at.                                                                                                    |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the text `input` element. Exposes `input` and `focus()`. `disabledDate`, `marked` and `footer` go to the calendar, and a typed date that is disabled or outside `min` and `max` shows an error. The box accepts the locale's order (set by `createEos({ locale })`) with slashes, dashes, dots or spaces, needs four-digit years, and reformats on blur or Enter. An invalid entry leaves the value alone.

With `valueFormat="iso"` the model is a `YYYY-MM-DD` string with no time zone to shift. An empty date is `null`, as for every date and number control (string controls use `""`). A disabled field is not submitted; a read-only one is. The calendar follows the locale's direction, or `createEos({ dir })`.

## Accessibility

- Alt + Down opens the calendar. For its keys see `ECalendar`. Escape closes it and returns focus to the text box, as does choosing a day.
- The button is named "Choose date" with `aria-haspopup="dialog"` and `aria-expanded`. The popup is a `dialog` in the portal target.
- Error text is `role="alert"` and joined to the box with `aria-describedby`.

## Keyboard

| Key              | Does                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| Alt + Arrow Down | Opens the calendar on the chosen day                                 |
| Enter            | Reads the typed date                                                 |
| Escape           | Closes the calendar (from months or years, back to the days first)   |
| Other keys       | See [`ECalendar`](../Calendar/README.md) for moving around the month |

## Related

[`ERangePicker`](../RangePicker/README.md) for a span, [`ECalendar`](../Calendar/README.md) to show the month inline.
