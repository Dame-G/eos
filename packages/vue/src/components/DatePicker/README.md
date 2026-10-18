# AeDatePicker

A date field with a calendar. A text box that takes the locale's order, and a button that opens `AeCalendar` in a popup (Reka UI's Popover: positioned, focus-managed, dismissed with Escape or a click outside). There is no native date input. Built on `AeField`.

```vue
<AeDatePicker v-model="born" label="Date of birth" name="dob" required :max="today" />
```

## Props

| Prop         | Type           | Notes                                                                                        |
| ------------ | -------------- | -------------------------------------------------------------------------------------------- |
| `v-model`    | `Date \| null` | The chosen date. Leave it off for local state.                                               |
| `label`      | `string`       | Required. A mono kicker above the field.                                                     |
| `hideLabel`  | `boolean`      | Keeps the label for screen readers and removes it from the page.                             |
| `hint`       | `string`       | Help under the field, 8px below it.                                                          |
| `error`      | `string`       | Replaces the hint and marks the box invalid. A typed date that cannot be used shows its own. |
| `required`   | `boolean`      | The `required` attribute and the word "Required".                                            |
| `optional`   | `boolean`      | The word "Optional".                                                                         |
| `disabled`   | `boolean`      | Dashed and tinted; the calendar cannot open.                                                 |
| `min`, `max` | `Date`         | Earliest and latest date, typed or chosen.                                                   |
| `name`       | `string`       | Submits the date as `YYYY-MM-DD` through a hidden input.                                     |
| `id`         | `string`       | The text box's id. Generated when left out.                                                  |

Exposed: `input` and `focus()`. `class` and `style` stay on the wrapper (`div.ae-field`); every other attribute and listener lands on the text `<input>` (`autocomplete` is `off` and `inputmode` is `numeric` unless you set them).

## Typing

- The box takes the locale's order with slashes, dashes, dots or spaces (`MM/DD/YYYY` for en-US, `DD.MM.YYYY` for de-DE, `DD/MM/YYYY` for en-GB) and rewrites it in the standard form on blur or Enter. The placeholder is that format; the `dateFormat` message overrides it.
- An invalid or out-of-range entry shows an error (`dateError`, `dateBetween`) and leaves the value alone. Typing clears the error; emptying the box clears the value.
- Years need four digits. Digits of other scripts (Arabic-Indic, for example) are read as typed.

## Keyboard

Alt + Down opens the calendar on the selected day (or today). In the calendar see `AeCalendar`. Escape in the months or years goes back to the days; Escape on the days closes the popup and puts focus back in the text box, as does choosing a day. Today and Clear are in the calendar's footer.

## Accessibility

- The text box is named by the label. The button is named "Choose date" (`chooseDate`) and carries `aria-haspopup="dialog"` and `aria-expanded`.
- The popup is a `dialog` named "Choose date", rendered in the portal target from `createAegis({ portalTarget })` with the class `ae-root`, so a scoped theme reaches it.
- Error text is `role="alert"` and joined to the box with `aria-describedby`.

## Rules

- Names, week start, order and separator come from `useLocale`; change `createAegis({ locale })` and the text, placeholder and calendar follow.
- The popup is never taller than the viewport and flips above the field when there is no room below.
