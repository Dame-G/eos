# EDatePicker

A date field with a text box in the locale's order and a button that opens an `ECalendar` popup. There is no native date input.

```vue
<EDatePicker v-model="born" label="Date of birth" name="dob" required :max="today" />
```

## Props

| Prop         | Type           | Default   | Notes                                                                                                      |
| ------------ | -------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `modelValue` | `Date \| null` | `null`    | v-model: the chosen date.                                                                                  |
| `open`       | `boolean`      | `false`   | v-model:open: whether the calendar is open. Setting it moves no focus; a disabled field never opens.       |
| `label`      | `string`       |           | Required.                                                                                                  |
| `hideLabel`  | `boolean`      |           | Keeps the label for screen readers only.                                                                   |
| `hint`       | `string`       |           | Help under the field.                                                                                      |
| `error`      | `string`       |           | Replaces the hint; marks invalid. An unusable typed date shows its own error (`dateError`, `dateBetween`). |
| `required`   | `boolean`      |           | The `required` attribute and the word "Required".                                                          |
| `optional`   | `boolean`      |           | The word "Optional".                                                                                       |
| `disabled`   | `boolean`      |           |                                                                                                            |
| `min`        | `Date`         |           | Earliest date, typed or chosen.                                                                            |
| `max`        | `Date`         |           | Latest date, typed or chosen.                                                                              |
| `name`       | `string`       |           | Submits `YYYY-MM-DD` through a hidden input.                                                               |
| `id`         | `string`       | generated | Id of the text box.                                                                                        |

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the text `input` element. Exposes `input` and `focus()`. The box accepts the locale's order (set by `createEos({ locale })`) with slashes, dashes, dots or spaces, needs four-digit years, and reformats on blur or Enter; an invalid entry leaves the value alone.

## Accessibility

- Alt + Down opens the calendar; for its keys see `ECalendar`. Escape closes it and returns focus to the text box, as does choosing a day.
- The button is named "Choose date" with `aria-haspopup="dialog"` and `aria-expanded`; the popup is a `dialog` in the portal target.
- Error text is `role="alert"` and joined to the box with `aria-describedby`.
