---
"@eos-ui/vue": minor
---

Breaking: `EAutocomplete` and `EMultiSelect` are removed; `ECombobox` replaces both. Use `<ECombobox freeform>` where you used `EAutocomplete` (the model is the typed text) and `<ECombobox multiple>` where you used `EMultiSelect` (the model is a `string[]`, shown as tags). `multiple` wins when both are set. `EComboboxProps` gains `multiple` and `freeform`. The internal match-marking helper is renamed so it no longer shares a name with `EHighlight`.

Style sweep over the form controls (Calendar, DataGrid, Combobox, NumberField, ColorField, SearchBar, Select, TextField): stroke, spacing and radius literals use tokens, focus rings use the focus-gap tokens, and forced-colors and reduced-motion are covered.
