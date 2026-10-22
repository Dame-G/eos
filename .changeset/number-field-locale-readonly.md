---
"@eos-ui/vue": minor
---

ENumberField and ECurrencyField read and write numbers with the configured locale, so a decimal comma works in French and German instead of being dropped (`1,5` no longer becomes 15). The number spinbutton also answers Home and End (min and max) and PageUp and PageDown (steps of ten).

ETextField, EPasswordField, ETextarea, ENumberField, ECurrencyField and EDatePicker have a `readonly` prop. The input is readonly, the number buttons and keys and the date calendar do nothing, and the prefix and suffix wrap gets the same tinted look as a bare readonly input.
