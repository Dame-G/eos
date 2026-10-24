# ECombobox

An input that filters a list as you type and only accepts an option from it. `freeform` accepts any typed text and `multiple` keeps several values as tags. [`ESelect`](../Select/README.md) suits a short list.

```vue
<ECombobox
  v-model="practitioner"
  label="Practitioner"
  clearable
  :options="['Amara Singh', 'Marcus Webb', 'Priya Nair']"
/>

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

| Prop          | Type                                          | Default                               | Notes                                                                                                                                                                                                                                              |
| ------------- | --------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string \| string[]`                          | `"" or []`                            | `v-model`: the `value` of the chosen option, empty for nothing. With `multiple` it holds the chosen values in the order chosen (replaced, not mutated). With `freeform` it is the typed text, updated on every key.                                |
| `open`        | `boolean`                                     | `false`                               | `v-model:open`: whether the list is open. Setting it moves no focus, and a disabled or readonly field never opens.                                                                                                                                 |
| `hideLabel`   | `boolean`                                     | `false`                               | Hides the label from the page and keeps it for screen readers.                                                                                                                                                                                     |
| `ariaLabel`   | `string`                                      | None                                  | The accessible name when `bare`.                                                                                                                                                                                                                   |
| `label`       | `string`                                      | None                                  | The visible label above the control. It also names the list. Required unless `bare` with an `ariaLabel`.                                                                                                                                           |
| `bare`        | `boolean`                                     | `false`                               | Renders only the control, with no label, hint or error. Needs `label` or `ariaLabel`. For dense places such as table filters.                                                                                                                      |
| `hint`        | `string`                                      | None                                  | Help that stays under the control.                                                                                                                                                                                                                 |
| `error`       | `string`                                      | None                                  | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                                                                                                        |
| `required`    | `boolean`                                     | `false`                               | Sets the `required` attribute and shows "Required" beside the label.                                                                                                                                                                               |
| `optional`    | `boolean`                                     | `false`                               | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                                                                                                           |
| `disabled`    | `boolean`                                     | `false`                               | Disables the control. A disabled control posts nothing.                                                                                                                                                                                            |
| `readonly`    | `boolean`                                     | `false`                               | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                                                                                                                                         |
| `id`          | `string`                                      | `generated`                           | The id of the control. The label points at it.                                                                                                                                                                                                     |
| `size`        | `"sm" \| "md" \| "lg"`                        | `"md"`                                | The height of the box: `sm` and `lg` are a step under and over the control height.                                                                                                                                                                 |
| `multiple`    | `boolean`                                     | `false`                               | Lets people choose several options. `v-model` is a `string[]` shown as removable tags, the list stays open while choosing, `placeholder` shows only while nothing is chosen, and `name` submits one hidden input per value.                        |
| `freeform`    | `boolean`                                     | `false`                               | Accepts any typed text, not only an option. `v-model` is the text, options are suggestions and choosing one puts its `label` in the field. There is no Show options button, and the list stays closed when nothing matches. `multiple` ignores it. |
| `options`     | `readonly EOptionInput[]`                     | **Required**                          | Strings, or `{ value, label, description, icon, group, disabled }` as in `ESelect`. A value is never an empty string.                                                                                                                              |
| `placeholder` | `string`                                      | None                                  | An example, never the label.                                                                                                                                                                                                                       |
| `name`        | `string`                                      | None                                  | Submits the value with a form, through a hidden input.                                                                                                                                                                                             |
| `loading`     | `boolean`                                     | `false`                               | Shows the Searching spinner in the list in place of the options while a server answers.                                                                                                                                                            |
| `emptyText`   | `string`                                      | `"No matches"`                        | What the list says when nothing matches.                                                                                                                                                                                                           |
| `clearable`   | `boolean`                                     | `false`                               | Shows a clear button while there is something to clear.                                                                                                                                                                                            |
| `filter`      | `(option: EOption, query: string) => boolean` | `label or description contains query` | Replaces the default match, which ignores case and accents. `query` is trimmed, lower case and without accents. Return `true` when the server filters.                                                                                             |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Events

| Event         | Payload        | Notes                                                                                      |
| ------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `inputChange` | `text: string` | The input text changed by typing, choosing or clearing. Use it to fetch options.           |
| `clear`       | None           | The person cleared the field, with the clear button or Escape. The model is already empty. |

## Accessibility

- Empty is `""` for a single value and `[]` with `multiple`; the model is typed `string[]` when `multiple` is set. A date or number control uses `null` instead.
- `disabled` posts nothing through the hidden inputs.

- Focus stays in the input, and the highlighted row is `aria-activedescendant`.
- Matching ignores case and accents: "cafe" finds "Café". `readonly` keeps the value and the focus but never opens the list.
- With `multiple` the listbox is `aria-multiselectable`, each tag has a Remove button ("Remove Text"). Removing a tag announces "Removed Text" and puts focus in the input.
- With `freeform`, typed text stays when focus leaves and Arrow Down reopens the suggestions.
- An empty or loading list is announced through a status region.

## Keyboard

| Key                  | Action                                                      |
| -------------------- | ----------------------------------------------------------- |
| Arrow Down, Arrow Up | Opens the list and moves the highlighted row.               |
| Enter                | Chooses the highlighted row.                                |
| Escape               | Closes the list. A second press clears the field.           |
| Backspace            | In an empty `multiple` field, removes the last tag.         |
| Home, End            | Moves the text cursor.                                      |
| Tab                  | Leaves the field. The text snaps back to the chosen option. |

## Related

[`ESelect`](../Select/README.md) for a short list with no typing, [`ECommandPalette`](../CommandPalette/README.md) to run commands.
