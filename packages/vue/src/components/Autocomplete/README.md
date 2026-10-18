# AeAutocomplete

A text input that offers suggestions but accepts anything typed. A variant of `AeCombobox`: the same props, events, attributes, keyboard and rules (read `../Combobox/README.md`), with these differences.

```vue
<AeAutocomplete
  v-model="street"
  label="Street"
  autocomplete="address-line1"
  :options="suggestions"
  @input-change="fetchSuggestions"
/>
```

- `v-model` is the **text**, a `string`. Typing updates it on every key; choosing a suggestion puts that suggestion's label in it. For an object option the model is its `label`, not its `value`.
- There is no Show options button: suggestions appear as people type, and `ArrowDown` reopens them. The list stays closed when nothing matches (and nothing is loading), so a typed value that is not in your list never shows "No matches".
- When focus leaves, the typed text stays.
- `name` submits the text in one hidden input.
- Use it for addresses and names that may not be in your list; use `AeCombobox` when only listed values are valid.

Props: `label`, `options`, `placeholder`, `hideLabel`, `hint`, `error`, `required`, `optional`, `disabled`, `name`, `loading`, `emptyText`, `clearable`, `filter`, `id`. Event: `inputChange(text)`. Exposed: `input()` and `focus()`.
