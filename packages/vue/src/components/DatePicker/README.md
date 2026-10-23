# EDatePicker

A date field with a text box in the locale's order and a button that opens an [`ECalendar`](../Calendar/README.md) popup. There is no native date input. Use [`ERangePicker`](../RangePicker/README.md) for a span of dates.

```vue
<EDatePicker v-model="born" label="Date of birth" name="dob" required :max="today" />
```

## Props

<!-- props:start -->

| Prop           | Type                                  | Default         | Notes                                                                                                                                                   |
| -------------- | ------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`   | `Date \| null \| string`              | `null as never` | `v-model`: the chosen date: a `Date`, or a `YYYY-MM-DD` string with `valueFormat="iso"`. `null` when empty.                                             |
| `open`         | `boolean`                             | `false`         | `v-model:open`: whether the calendar is open. Setting it moves no focus, and a disabled field never opens.                                              |
| `hideLabel`    | `boolean`                             | `false`         | Hides the label from the page and keeps it for screen readers.                                                                                          |
| `hint`         | `string`                              | None            | Help that stays under the control.                                                                                                                      |
| `error`        | `string`                              | None            | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                             |
| `required`     | `boolean`                             | `false`         | Sets the `required` attribute and shows "Required" beside the label.                                                                                    |
| `optional`     | `boolean`                             | `false`         | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                |
| `disabled`     | `boolean`                             | `false`         | Disables the control. A disabled control posts nothing.                                                                                                 |
| `readonly`     | `boolean`                             | `false`         | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                                              |
| `id`           | `string`                              | `generated`     | The id of the control. The label points at it.                                                                                                          |
| `size`         | `"sm" \| "md" \| "lg"`                | `"md"`          | The height of the box: `sm` and `lg` are a step under and over the control height.                                                                      |
| `label`        | `string`                              | **Required**    | The visible label.                                                                                                                                      |
| `min`          | `Date`                                | None            | The earliest date that can be chosen or typed.                                                                                                          |
| `max`          | `Date`                                | None            | The latest date that can be chosen or typed.                                                                                                            |
| `disabledDate` | `(date: Date) => boolean`             | None            | Days that cannot be chosen, in the calendar or by typing, such as days with nothing to book.                                                            |
| `marked`       | `Date[] \| ((date: Date) => boolean)` | None            | Days that get a dot in the calendar: a list of dates or a function.                                                                                     |
| `footer`       | `boolean`                             | `true`          | Shows the calendar's Today and Clear buttons.                                                                                                           |
| `valueFormat`  | `"date" \| "iso"`                     | `"date"`        | What `v-model` holds. `date` is a `Date` (a local day at noon). `iso` is a `YYYY-MM-DD` string, or `null` for no date, which has no time zone to shift. |
| `name`         | `string`                              | None            | Submits the date as `YYYY-MM-DD` with a form, through a hidden input. A disabled field is not submitted.                                                |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the text `input` element. Exposes `input` and `focus()`. `disabledDate`, `marked` and `footer` go to the calendar, and a typed date that is disabled or outside `min` and `max` shows an error. The box accepts the locale's order (set by `createEos({ locale })`) with slashes, dashes, dots or spaces, needs four-digit years, and reformats on blur or Enter. An invalid entry shows its own error (`dateError`, `dateBetween`), leaves the value alone and posts nothing until it is fixed. `disabled` and `readonly` also disable the calendar button, so the calendar does not open.

With `valueFormat="iso"` the model is a `YYYY-MM-DD` string with no time zone to shift. An empty date is `null`, as for every date and number control (string controls use `""`). A disabled field is not submitted; a read-only one is. The calendar follows the locale's direction, or `createEos({ dir })`.

## Accessibility

- Escape or choosing a day closes the calendar and returns focus to the text box.
- The button is named "Choose date" with `aria-haspopup="dialog"` and `aria-expanded`. The popup is a `dialog` in the portal target.
- Error text is `role="alert"` and joined to the box with `aria-describedby`.

## Keyboard

| Key              | Action                                                                |
| ---------------- | --------------------------------------------------------------------- |
| Alt + Arrow Down | Opens the calendar on the chosen day.                                 |
| Enter            | Reads the typed date.                                                 |
| Escape           | Closes the calendar (from months or years, back to the days first).   |
| Other keys       | See [`ECalendar`](../Calendar/README.md) for moving around the month. |

## Related

[`ERangePicker`](../RangePicker/README.md) for a span, [`ECalendar`](../Calendar/README.md) to show the month inline.
