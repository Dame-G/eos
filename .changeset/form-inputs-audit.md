---
"@eos-ui/vue": minor
---

Form inputs audit.

- `EForm` checks every control on submit. `ECheckbox`, `ESwitch`, `ESegmented`, `EFieldset` (and so `ECheckboxGroup` and `ERadioGroup`) and `ESignaturePad` register their `error`. An empty required `ESelect` or `ESignaturePad` stops the submit with the browser's own message. An empty required `ERadioGroup` is listed once, by its label. `useFormField` takes a `check` for a custom control.
- `ENumberField` has `locale`, and `ECurrencyField` passes its `locale` on, so the separators and reading typed text follow it, not only the symbol.
- `ESelect`, `ECombobox`, `EDatePicker` and `ERangePicker` take `size`. `ECheckboxGroup` and `ERadioGroup` take `id` and `orientation`. `ECombobox` emits `clear`. `ETextarea` documents `name`.
- `clearable` is off by default in every field, `ESearchBar` and `ECombobox` included: pass `clearable` to show the button.
- `EUpload`: the `files` event is removed (it repeated `v-model`). The prompt is one message, `dropFile`, with `{choose}`, in place of `dragHere`.
- `EDatePicker` and `ERangePicker` post nothing while the typed date cannot be used, and keep the consumer's `form` attribute, as does `ESignatureField`. `ERangePicker`'s placeholders show the date format.
- `@focus` and `@blur` on `EOtpField`, `ERangePicker` and `ESegmented` fire as focus enters and leaves the field (`useFieldAttrs().group()`).
- `EOtpField`'s arrow keys follow the boxes in a right-to-left page. `ESegmented` does not smooth-scroll under reduced motion (`useReducedMotion`, shared with `ETabs`) and always renders one wrapper (`.e-seg-field`), which takes `class` and `style`.
- A read-only `ESelect` looks read-only and has no arrow. The rows of a disabled `ECheckboxGroup`, `ERadioGroup` or `ESignatureField` look disabled. `ERadioGroup` describes an option with its `description` instead of folding it into the name.
- Invalid ARIA removed: `aria-readonly` on `ECheckboxGroup`'s fieldset and `EUpload`'s file input (described as "Read only" instead), `aria-invalid` on `ESignaturePad`'s image.
- `ECombobox` only keeps the field open for its own list, and the multi-select input height comes from the tokens. `ESignatureField`'s Type and Draw switch is read-only, not disabled. `ESlider` keeps the last tick with a decimal step.
