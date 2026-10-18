# ECombobox

An input that filters a list as you type and only accepts an option from it. Built on `EField` and Reka UI's Combobox. `EAutocomplete` and `EMultiSelect` are variants of it, sharing one implementation (`EComboboxBase.vue`) and the same props.

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

| Prop           | Type                         | Notes                                                                                                                                                                                                                                           |
| -------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `v-model`      | `string`                     | The `value` of the chosen option. An empty string is nothing chosen. Leave it off for local state.                                                                                                                                              |
| `v-model:open` | `boolean`                    | Whether the list is open. Set it to open it from outside, or to start open; it follows the person's own opening and closing. Leave it off for local state. Opening or closing it from outside moves no focus, and a disabled field never opens. |
| `label`        | `string`                     | Required. The mono kicker above the field; it also names the list.                                                                                                                                                                              |
| `options`      | `(string \| EOption)[]`      | Required. Same shape as `ESelect` (`EOption` is exported from there): `{ value, label, description, icon, group, disabled }`.                                                                                                                   |
| `placeholder`  | `string`                     | An example, never the label. Hidden in `EMultiSelect` once something is chosen.                                                                                                                                                                 |
| `hideLabel`    | `boolean`                    | Keeps the label for screen readers and removes it from the page.                                                                                                                                                                                |
| `hint`         | `string`                     | Help under the field, 8px away.                                                                                                                                                                                                                 |
| `error`        | `string`                     | Replaces the hint, turns the edge `danger`, marks the input `aria-invalid`.                                                                                                                                                                     |
| `required`     | `boolean`                    | The word "Required" and the `required` attribute. A chosen value satisfies it.                                                                                                                                                                  |
| `optional`     | `boolean`                    | The word "Optional".                                                                                                                                                                                                                            |
| `disabled`     | `boolean`                    | Dashed and tinted; the buttons inside go too.                                                                                                                                                                                                   |
| `name`         | `string`                     | Submits the value (a hidden input per chosen value).                                                                                                                                                                                            |
| `loading`      | `boolean`                    | Shows a Searching spinner in the list instead of the options while a server answers.                                                                                                                                                            |
| `emptyText`    | `string`                     | What the list says when nothing matches. Default "No matches".                                                                                                                                                                                  |
| `clearable`    | `boolean`                    | The clear button, shown when there is something to clear. On by default.                                                                                                                                                                        |
| `filter`       | `(option, query) => boolean` | Replaces the default match (the text appears in the label or description). `query` is trimmed and lower case. Return `true` for everything when the server does the filtering.                                                                  |
| `id`           | `string`                     | The input's id; the label points at it. Generated when left out.                                                                                                                                                                                |

## Events

| Event         | Payload        | Notes                                                                                    |
| ------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `inputChange` | `text: string` | The text in the input changed, by typing, choosing or clearing. Use it to fetch options. |

Exposed: `input()` (the `<input>` element) and `focus()`.

## Attributes and listeners

`inheritAttrs` is off. `class` and `style` stay on the wrapper (`div.e-field`); everything else lands on the `<input>`: `autocomplete` (default `off`), `inputmode`, `aria-*`, `data-*`, and listeners such as `@focus` and `@blur`. An `aria-describedby` of your own is joined to the hint or error id.

## Behaviour

- Matching text in a row is bold and underlined. Rows show a `description` as a second line, and the description is searched too.
- When focus leaves, the text snaps back to the chosen option, so the field never holds something that is not a valid choice. A value set from outside (a form reset, a loaded record) replaces the text; a label that arrives late (options fetched after the value) is picked up.
- `Escape` closes the list, a second `Escape` clears the field.
- The list opens on typing, on `ArrowDown` and `ArrowUp`, and with the Show options button (out of the tab order, since `ArrowDown` does the same). It does not open on focus or on a click in the text.
- A mouse press on a row keeps the focus in the input.

## Keyboard

| Key                | Does                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| ArrowDown, ArrowUp | Opens the list, then moves the highlighted row. The input keeps focus and `aria-activedescendant` names the row. |
| Enter              | Chooses the highlighted row (the first match after typing) and closes the list.                                  |
| Escape             | Closes the list; when it is already closed, clears the text.                                                     |
| Home, End          | Move the cursor in the text, as in any text field. The list moves with the arrows.                               |
| Tab                | Leaves; the text snaps back to the chosen option. The Clear button is reached with Tab.                          |

## Rules

- Use `EAutocomplete` when any text is allowed, `EMultiSelect` for several choices, `ESelect` when the list is short.
- The list renders in the portal target and carries `e-root`, so a scoped theme reaches it. It is as wide as the field and flips above when there is no room.
- When nothing matches or the list is loading, the list holds one disabled row that says so, and a visually hidden `role="status"` beside the field announces it. While loading the listbox is `aria-busy`.
- The field is 48px tall, like `ETextField`. The shared panel and option styles are in `../Select/panel.css`.
- Every word (`Show options`, `Clear`, `Searching`, `No matches`) goes through `useMessages()`.
- Deliberate difference from the reference: Home and End move the text cursor instead of the list (the reference did not handle them, so the browser did the same).

See also `EAutocomplete`, whose model is the typed text rather than a chosen value: use it when the person may enter something that is not in the list.
