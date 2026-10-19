# EMultiSelect

A combobox that keeps several choices as removable tags. It has the same props, events and rules as `ECombobox`.

```vue
<EMultiSelect v-model="ways" label="Remind me by" name="remind" :options="['Text', 'Email', 'Call']" />
```

## Props

| Prop         | Type       | Default | Notes                                                                      |
| ------------ | ---------- | ------- | -------------------------------------------------------------------------- |
| `modelValue` | `string[]` | `[]`    | v-model: chosen option values, in the order chosen. Replaced, not mutated. |
| `open`       | `boolean`  | `false` | v-model:open: whether the list is open. A disabled field never opens.      |
| `clearable`  | `boolean`  | `true`  | Clear button empties all tags.                                             |

Other props as `ECombobox`: `label`, `options`, `placeholder`, `hideLabel`, `hint`, `error`, `required`, `optional`, `disabled`, `name`, `loading`, `emptyText`, `filter`, `id`. `name` submits one hidden input per chosen value; `placeholder` shows only while nothing is chosen. The list stays open while choosing. Attributes land as on `ECombobox`. Exposes `input()` and `focus()`.

## Events

| Event         | Payload        | Notes                                                                  |
| ------------- | -------------- | ---------------------------------------------------------------------- |
| `inputChange` | `text: string` | The input text changed by typing or choosing. Use it to fetch options. |

## Accessibility

- The listbox is `aria-multiselectable`.
- Each tag has a Remove button ("Remove Text"); Backspace in an empty field removes the last tag.
