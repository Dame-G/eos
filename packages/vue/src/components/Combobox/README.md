# ECombobox

An input that filters a list as you type and only accepts an option from it. `freeform` accepts any typed text and `multiple` keeps several values as tags. [`ESelect`](../Select/README.md) suits a short list.

```vue
<ECombobox v-model="practitioner" label="Practitioner" :options="['Amara Singh', 'Marcus Webb', 'Priya Nair']" />

<!-- free text, with the options as suggestions -->
<ECombobox v-model="street" freeform label="Street" :options="suggestions" />

<!-- several values, shown as tags -->
<ECombobox v-model="ways" multiple label="Remind me by" name="remind" :options="['Text', 'Email', 'Call']" />

<!-- fetch options from a server as people type -->
<ECombobox
  v-model="clinic"
  label="Clinic"
  :options="found"
  :loading="searching"
  :filter="() => true"
  @input-change="search"
/>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string \| string[]` | `"" or []` | `v-model`: the `value` of the chosen option, empty for nothing. With `multiple` it holds the chosen values in the order chosen (replaced, not mutated). With `freeform` it is the typed text, updated on every key. |
| `open` | `boolean` | `false` | `v-model:open`: whether the list is open. Setting it moves no focus, and a disabled field never opens. |
| `hideLabel` | `boolean` | `false` | Hides the label from the page and keeps it for screen readers. |
| `ariaLabel` | `string` | None | The accessible name when `bare`. |
| `label` | `string` | None | The visible label above the control. It also names the list. Required unless `bare` with an `ariaLabel`. |
| `bare` | `boolean` | `false` | Renders only the control, with no label, hint or error. Needs `label` or `ariaLabel`. For dense places such as table filters. |
| `multiple` | `boolean` | `false` | Lets people choose several options. `v-model` is a `string[]` shown as removable tags, the list stays open while choosing, `placeholder` shows only while nothing is chosen, and `name` submits one hidden input per value. |
| `freeform` | `boolean` | `false` | Accepts any typed text, not only an option. `v-model` is the text, options are suggestions and choosing one puts its `label` in the field. There is no Show options button, and the list stays closed when nothing matches. `multiple` ignores it. |
| `options` | `readonly EOptionInput[]` | **Required** | Strings, or `{ value, label, description, icon, group, disabled }` as in `ESelect`. A value is never an empty string. |
| `placeholder` | `string` | None | An example, never the label. |
| `hint` | `string` | None | Shows help text under the field. |
| `error` | `string` | None | Shows what to fix in place of the hint, marks the input `aria-invalid` and is announced. |
| `required` | `boolean` | `false` | Sets the `required` attribute and shows a word beside the label. A chosen value satisfies it. |
| `optional` | `boolean` | `false` | Shows a word beside the label. Use it on whichever of required and optional is rarer. |
| `disabled` | `boolean` | `false` | Disables the field. A disabled field never opens. |
| `name` | `string` | None | Submits the value with a form, through a hidden input. |
| `loading` | `boolean` | `false` | Shows the Searching spinner in the list in place of the options while a server answers. |
| `emptyText` | `string` | `"No matches"` | What the list says when nothing matches. |
| `clearable` | `boolean` | `true` | Shows a clear button when there is something to clear. |
| `filter` | `(option: EOption, query: string) => boolean` | `label or description contains query` | Replaces the default match. `query` is trimmed and lower case. Return `true` when the server filters. |
| `id` | `string` | `generated` | The `id` of the input, which the label points at. |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Events

| Event         | Payload        | Notes                                                                            |
| ------------- | -------------- | -------------------------------------------------------------------------------- |
| `inputChange` | `text: string` | The input text changed by typing, choosing or clearing. Use it to fetch options. |

## Accessibility

- Focus stays in the input. Arrow Down and Arrow Up open the list and move the highlighted row (`aria-activedescendant`), and Enter chooses it.
- Escape closes the list and a second Escape clears the field. Home and End move the text cursor.
- When focus leaves, the text snaps back to the chosen option.
- With `multiple` the listbox is `aria-multiselectable`, each tag has a Remove button ("Remove Text") and Backspace in an empty field removes the last tag. Removing a tag announces "Removed Text" and puts focus in the input.
- With `freeform`, typed text stays when focus leaves and Arrow Down reopens the suggestions.
- An empty or loading list is announced through a status region.
