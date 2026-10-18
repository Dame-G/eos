# AeMultiSelect

A combobox that keeps several choices, shown as removable tags in the field. A variant of `AeCombobox`: the same props, events, attributes and rules (read `../Combobox/README.md`), with these differences.

```vue
<AeMultiSelect v-model="ways" label="Remind me by" name="remind" :options="['Text', 'Email', 'Call']" />
```

- `v-model` is an array of option values, in the order they were chosen (`string[]`). The array is replaced, not mutated.
- The list stays open while choosing; chosen options show a check and a click or Enter toggles them. The text is cleared after each choice.
- Each tag has its own Remove button, named "Remove Text" (the `removeItem` message). `Backspace` in an empty field removes the last tag; with text in the field it edits the text.
- The clear button empties them all. `name` submits one hidden input per chosen value, and nothing when none is chosen.
- `placeholder` shows only while nothing is chosen. `required` is satisfied by a chosen value.
- A one-row field is 48px tall like `AeTextField` and `AeSelect`; more tags wrap inside the field and make it taller.
- The listbox is `aria-multiselectable`.

Props: `label`, `options`, `placeholder`, `hideLabel`, `hint`, `error`, `required`, `optional`, `disabled`, `name`, `loading`, `emptyText`, `clearable`, `filter`, `id`. Event: `inputChange(text)`. Exposed: `input()` and `focus()`.
