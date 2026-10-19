# ECombobox

An input that filters a list as you type and only accepts an option from it. `EAutocomplete` (free text) and `EMultiSelect` (several values) share its props; `ESelect` suits a short list.

```vue
<ECombobox v-model="practitioner" label="Practitioner" :options="['Amara Singh', 'Marcus Webb', 'Priya Nair']" />

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

| Prop          | Type                         | Default                             | Notes                                                                                                                           |
| ------------- | ---------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`                     | `""`                                | v-model: the `value` of the chosen option; empty is nothing chosen.                                                             |
| `open`        | `boolean`                    | `false`                             | v-model:open: whether the list is open. Setting it moves no focus; a disabled field never opens.                                |
| `label`       | `string`                     |                                     | Required. Also names the list.                                                                                                  |
| `options`     | `EOptionInput[]`             |                                     | Required. Strings, or `{ value, label, description, icon, group, disabled }` as in `ESelect`. A value is never an empty string. |
| `placeholder` | `string`                     |                                     | An example, never the label.                                                                                                    |
| `hideLabel`   | `boolean`                    |                                     | Keeps the label for screen readers only.                                                                                        |
| `hint`        | `string`                     |                                     | Help under the field.                                                                                                           |
| `error`       | `string`                     |                                     | Replaces the hint; marks the input `aria-invalid`.                                                                              |
| `required`    | `boolean`                    |                                     | The `required` attribute and the word "Required". A chosen value satisfies it.                                                  |
| `optional`    | `boolean`                    |                                     | The word "Optional".                                                                                                            |
| `disabled`    | `boolean`                    |                                     |                                                                                                                                 |
| `name`        | `string`                     |                                     | Submits the value through a hidden input.                                                                                       |
| `loading`     | `boolean`                    |                                     | Shows a Searching row instead of the options while a server answers.                                                            |
| `emptyText`   | `string`                     | `No matches`                        | What the list says when nothing matches.                                                                                        |
| `clearable`   | `boolean`                    | `true`                              | Clear button when there is something to clear.                                                                                  |
| `filter`      | `(option, query) => boolean` | label or description contains query | Replaces the default match. `query` is trimmed and lower case. Return `true` when the server filters.                           |
| `id`          | `string`                     | generated                           | Id of the input.                                                                                                                |

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `input` element. Exposes `input()` and `focus()`.

## Events

| Event         | Payload        | Notes                                                                            |
| ------------- | -------------- | -------------------------------------------------------------------------------- |
| `inputChange` | `text: string` | The input text changed by typing, choosing or clearing. Use it to fetch options. |

## Accessibility

- Focus stays in the input; ArrowDown and ArrowUp open the list and move the highlighted row (`aria-activedescendant`), Enter chooses it.
- Escape closes the list; a second Escape clears the field. Home and End move the text cursor.
- When focus leaves, the text snaps back to the chosen option.
- An empty or loading list is announced through a status region.
