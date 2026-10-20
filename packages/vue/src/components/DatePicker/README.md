# EDatePicker

A date field with a text box in the locale's order and a button that opens an [`ECalendar`](../Calendar/README.md) popup. There is no native date input.

```vue
<EDatePicker v-model="born" label="Date of birth" name="dob" required :max="today" />
```

## Props

<!-- props:start -->

| Prop         | Type           | Default      | Notes                                                                                                                                          |
| ------------ | -------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `Date \| null` | `null`       | `v-model`: the chosen date.                                                                                                                    |
| `open`       | `boolean`      | `false`      | `v-model:open`: whether the calendar is open. Setting it moves no focus; a disabled field never opens.                                         |
| `label`      | `string`       | **Required** | The visible label, a mono kicker above the field.                                                                                              |
| `hideLabel`  | `boolean`      | `false`      | Keep the label for screen readers and remove it from the page.                                                                                 |
| `hint`       | `string`       | —            | Help that stays under the field.                                                                                                               |
| `error`      | `string`       | —            | What to fix. Replaces the hint and marks the field invalid. A typed date that cannot be used shows its own error (`dateError`, `dateBetween`). |
| `required`   | `boolean`      | `false`      | The `required` attribute and a word beside the label.                                                                                          |
| `optional`   | `boolean`      | `false`      | A word beside the label. Flag whichever is rarer.                                                                                              |
| `disabled`   | `boolean`      | `false`      | Disables the field and its calendar button.                                                                                                    |
| `min`        | `Date`         | —            | The earliest date that can be chosen or typed.                                                                                                 |
| `max`        | `Date`         | —            | The latest date that can be chosen or typed.                                                                                                   |
| `name`       | `string`       | —            | Submits the date as `YYYY-MM-DD` with a form, through a hidden input.                                                                          |
| `id`         | `string`       | `generated`  | The id of the text box; the label points at it.                                                                                                |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the text `input` element. Exposes `input` and `focus()`. The box accepts the locale's order (set by `createEos({ locale })`) with slashes, dashes, dots or spaces, needs four-digit years, and reformats on blur or Enter; an invalid entry leaves the value alone.

## Accessibility

- Alt + Down opens the calendar; for its keys see `ECalendar`. Escape closes it and returns focus to the text box, as does choosing a day.
- The button is named "Choose date" with `aria-haspopup="dialog"` and `aria-expanded`; the popup is a `dialog` in the portal target.
- Error text is `role="alert"` and joined to the box with `aria-describedby`.
