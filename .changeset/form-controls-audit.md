---
"@eos-ui/vue": minor
---

Form controls: consistent names, one field button, quieter errors and a round of fixes.

Breaking renames (update your templates):

- `ESlider`: `format` is now `valueText`.
- `EPhoneField`: `format` is now `display`, and `valueFormat` is now `modelAs`.
- `EOtpField`: `inputmode` is now `charset`, with `"text"` now `"alphanumeric"`; `autoFocus` is now `autofocus`.
- `EFieldset`: `bare` is now `variant="plain"` and `section` is now `variant="section"` (`variant` defaults to `"box"`).
- `ECheckbox`: `bare` is now `hideLabel`, which keeps the hint or error visible.
- `ETextField`: the internal `submitValue` prop is gone.
- Types: `RadioOption` and `CheckboxOption` are now one `ChoiceOption`. `ECombobox` is generic in its option values, as `ESelect` is, so a `v-model` typed `string` still works and literal options narrow it.
- CSS: `.e-combo-btn` is gone; every button inside a field box is `.e-input-btn`. The shared stylesheets moved to `styles/controls/` (the old `TextField/input.css` and `Select/panel.css` paths still resolve). `.e-choice--bare` is now `.e-choice--label-hidden`.

Behaviour:

- A field's error is no longer an assertive alert on first render. One that appears or changes later is announced once; inside an `EForm`, a failed submit is announced by the summary alone.
- `ESelect` with a bare `multiple` attribute works (it was read as off), and its clear button emits `clear`. `EPhoneField` declares `clear` too.
- `ESegmented` with no `v-model` shows its first option as active without checking its radio, so a form posts nothing and `required` can fail until the person chooses.
- `EDatePicker`, `ERangePicker` and `EColorField` emit `invalid` (text, message) when typed text cannot be used; the model keeps its value. The date pickers' `min` and `max` take a `YYYY-MM-DD` string. `ERangePicker` reads the span when focus leaves both boxes, shows no presets row for `presets: []`, and gains `footer` (Today and Clear, on by default as in `EDatePicker`).
- `ENumberField` and `ECurrencyField`: the stepper buttons leave the tab order (the arrow keys step); a step lands on `min` plus a whole number of steps; a step such as `1e-7` keeps its decimals.
- `ECombobox` shows the loading spinner in the box with `aria-busy` on the input, folds options once per change, takes `limit`, and a `bare` one joins the `EForm` around it.
- `ESlider` spreads `marks: true` over the whole track (about a hundred ticks at most), drops `aria-required`, and a click on its label focuses the first thumb.
- `ESignaturePad` shows read-only and disabled as fields do, and takes `label`, `hideLabel`, `optional`, `name` and a CSS length for `height`. `ESignatureField`'s `required` also requires the agreement, and says "Required" once.
- `EPasswordField` is described by a count of the rules met, and `mode` defaults to `new` when it has `rules`.
- `EUpload`'s hint shows `maxSize` and `maxFiles`, and names MIME types by kind ("PNG", "image/*").
- A disabled checkbox or radio uses `--e-disabled-fill`, like other controls.

New:

- `useFormField` is exported, for a custom control that joins an `EForm`.
- `ESegmented`: `id`, `size` (`sm` is compact) and `showLabel`. `ESearchBar`: `id` and `readonly`. `ESwitch`: `hideLabel`.
- Messages: `fileSizeLimit`, `fileCountLimit`, `passwordRulesMet`.
