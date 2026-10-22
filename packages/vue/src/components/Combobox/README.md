# ECombobox

An input that filters a list as you type and only accepts an option from it. `freeform` accepts any typed text and `multiple` keeps several values as tags; [`ESelect`](../Select/README.md) suits a short list.

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

| Prop          | Type                                          | Default                               | Notes                                                                                                                                                                                                                                          |
| ------------- | --------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string \| string[]`                          | `"" or []`                            | `v-model`: the `value` of the chosen option, empty for nothing; with `multiple` the chosen values in the order chosen (replaced, not mutated); with `freeform` the typed text, updated on every key.                                           |
| `open`        | `boolean`                                     | `false`                               | `v-model:open`: whether the list is open. Setting it moves no focus; a disabled field never opens.                                                                                                                                             |
| `hideLabel`   | `boolean`                                     | `false`                               | Keep the label for screen readers and remove it from the page.                                                                                                                                                                                 |
| `ariaLabel`   | `string`                                      | —                                     | The accessible name when `bare`.                                                                                                                                                                                                               |
| `label`       | `string`                                      | —                                     | The visible label, a mono kicker above the control. It also names the list. Required unless `bare` with an `ariaLabel`.                                                                                                                        |
| `bare`        | `boolean`                                     | `false`                               | Only the control, no label, hint or error. Give it `label` or `ariaLabel`. For dense places such as table filters.                                                                                                                             |
| `multiple`    | `boolean`                                     | `false`                               | Choose several: `v-model` is a `string[]`, shown as removable tags. The list stays open while choosing, `placeholder` shows only while nothing is chosen, and `name` submits one hidden input per value.                                       |
| `freeform`    | `boolean`                                     | `false`                               | Accept any typed text, not only an option: `v-model` is the text and options are suggestions, and choosing one puts its `label` in the field. No Show options button, and the list stays closed when nothing matches. Ignored with `multiple`. |
| `options`     | `readonly EOptionInput[]`                     | **Required**                          | Strings, or `{ value, label, description, icon, group, disabled }` as in `ESelect`. A value is never an empty string.                                                                                                                          |
| `placeholder` | `string`                                      | —                                     | An example, never the label.                                                                                                                                                                                                                   |
| `hint`        | `string`                                      | —                                     | Help that stays under the field.                                                                                                                                                                                                               |
| `error`       | `string`                                      | —                                     | What to fix. Replaces the hint, marks the input `aria-invalid` and is announced.                                                                                                                                                               |
| `required`    | `boolean`                                     | `false`                               | The `required` attribute and a word beside the label. A chosen value satisfies it.                                                                                                                                                             |
| `optional`    | `boolean`                                     | `false`                               | A word beside the label. Flag whichever is rarer.                                                                                                                                                                                              |
| `disabled`    | `boolean`                                     | `false`                               | Disables the field; a disabled field never opens.                                                                                                                                                                                              |
| `name`        | `string`                                      | —                                     | Submits the value with a form, through a hidden input.                                                                                                                                                                                         |
| `loading`     | `boolean`                                     | `false`                               | Show the Searching spinner in the list instead of the options, while a server answers.                                                                                                                                                         |
| `emptyText`   | `string`                                      | `"No matches"`                        | What the list says when nothing matches.                                                                                                                                                                                                       |
| `clearable`   | `boolean`                                     | `true`                                | The clear button, shown when there is something to clear.                                                                                                                                                                                      |
| `filter`      | `(option: EOption, query: string) => boolean` | `label or description contains query` | Replaces the default match (the typed text appears in the label or description). `query` is trimmed and lower case. Return `true` when the server filters.                                                                                     |
| `id`          | `string`                                      | `generated`                           | The id of the input; the label points at it.                                                                                                                                                                                                   |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Events

| Event         | Payload        | Notes                                                                            |
| ------------- | -------------- | -------------------------------------------------------------------------------- |
| `inputChange` | `text: string` | The input text changed by typing, choosing or clearing. Use it to fetch options. |

## Accessibility

- Focus stays in the input; ArrowDown and ArrowUp open the list and move the highlighted row (`aria-activedescendant`), Enter chooses it.
- Escape closes the list; a second Escape clears the field. Home and End move the text cursor.
- When focus leaves, the text snaps back to the chosen option.
- With `multiple` the listbox is `aria-multiselectable`, each tag has a Remove button ("Remove Text") and Backspace in an empty field removes the last tag.
- With `freeform`, typed text stays when focus leaves and ArrowDown reopens the suggestions.
- An empty or loading list is announced through a status region.
