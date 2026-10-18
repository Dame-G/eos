# EAutocomplete

A text input that offers suggestions but accepts anything typed. A variant of `ECombobox`: the same props, events, attributes, keyboard and rules (read `../Combobox/README.md`), with these differences.

```vue
<EAutocomplete
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
- Use it for addresses and names that may not be in your list; use `ECombobox` when only listed values are valid.

`v-model:open` (`boolean`) says whether the list is open. Set it to open the list from outside or to start open; it follows the person's typing, choosing and Escape. Opening or closing it from outside moves no focus, and a disabled field never opens.

Props: `label`, `options`, `placeholder`, `hideLabel`, `hint`, `error`, `required`, `optional`, `disabled`, `name`, `loading`, `emptyText`, `clearable`, `filter`, `id`. Event: `inputChange(text)`. Exposed: `input()` and `focus()`.

See also `ECombobox`, whose model is the `value` of a chosen option: use it when the answer must come from the list.
