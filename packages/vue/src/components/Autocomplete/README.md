# EAutocomplete

A text input that offers suggestions but accepts anything typed, for addresses and names that may not be in your list. Use `ECombobox` when only listed values are valid.

```vue
<EAutocomplete
  v-model="street"
  label="Street"
  autocomplete="address-line1"
  :options="suggestions"
  @input-change="fetchSuggestions"
/>
```

## Props

Takes the props of `ECombobox` (`label`, `options`, `placeholder`, `hideLabel`, `bare`, `ariaLabel`, `hint`, `error`, `required`, `optional`, `disabled`, `name`, `loading`, `emptyText`, `clearable`, `filter`, `id`), with these differences.

| Prop         | Type      | Default | Notes                                                                                                      |
| ------------ | --------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`  | `""`    | v-model: the text, updated on every key. Choosing a suggestion puts its `label` in it, not its `value`.    |
| `open`       | `boolean` | `false` | v-model:open: whether the list is open. Follows typing, choosing and Escape; a disabled field never opens. |
| `clearable`  | `boolean` | `true`  | The clear button.                                                                                          |
| `name`       | `string`  |         | Submits the text in one hidden input.                                                                      |

`class`, `style` and attributes land as on `ECombobox`. Exposes `input()` and `focus()`.

## Events

| Event         | Payload        | Notes                                                                                 |
| ------------- | -------------- | ------------------------------------------------------------------------------------- |
| `inputChange` | `text: string` | The text changed, by typing or by choosing a suggestion. Use it to fetch suggestions. |

## Accessibility

- Same keyboard as `ECombobox`, without a Show options button: suggestions appear as people type and ArrowDown reopens them.
- The list stays closed when nothing matches, so typed text that is not in the list never shows "No matches". Typed text stays when focus leaves.
