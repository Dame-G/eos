# ESearchBar

The single search box for a page: an outlined field with a submit button inside. Show what it finds in [`ESearchResults`](../SearchResults/README.md), and use [`ECombobox`](../Combobox/README.md) to pick a value in a form.

```vue
<ESearchBar v-model="query" placeholder="Search statements and visits" clearable @submit="search" />
```

## Props

<!-- props:start -->

| Prop          | Type                   | Default    | Notes                                                                                                                                                                                                                                                     |
| ------------- | ---------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`               | `""`       | `v-model`: the text.                                                                                                                                                                                                                                      |
| `size`        | `"sm" \| "md" \| "lg"` | `"md"`     | The height of the box: `sm` and `lg` are a step under and over the control height.                                                                                                                                                                        |
| `loading`     | `boolean`              | `false`    | Shows a spinner at the end of the box and sets `aria-busy`, while options or a check load. The field stays editable.                                                                                                                                      |
| `label`       | `string`               | `"Search"` | Names the box and the search landmark. It is not shown on the page.                                                                                                                                                                                       |
| `placeholder` | `string`               | `"Search"` | Hint text in the empty box that says what can be searched.                                                                                                                                                                                                |
| `action`      | `string`               | `"Search"` | The text on the button.                                                                                                                                                                                                                                   |
| `hideAction`  | `boolean`              | `false`    | Leaves out the button, for a box that filters or searches as you type. Enter still submits.                                                                                                                                                               |
| `clearable`   | `boolean`              | `true`     | Shows the clear button while there is text. Off by default in every field; ESearchBar and ECombobox still show it when the prop is left out, and warn in development, until the next minor release. Pass `clearable` to keep it, or `:clearable="false"`. |
| `name`        | `string`               | None       | The name the text is posted under when the bar sits inside a form of your own. There is no default: the bar is not a form.                                                                                                                                |
| `disabled`    | `boolean`              | `false`    | Disables the box and button. Pair it with an `ENotice` that says why.                                                                                                                                                                                     |

<!-- props:end -->

The bar is a `div` with `role="search"`, not a form, so it can sit inside one. `class` and `style` land on it. Other attributes and listeners land on the `input` element. Enter in the box and the button both emit `submit` and never submit an enclosing form. `name` is not set unless you pass it, for a bar inside a form of your own that should post the text. `size` is as on [`ETextField`](../TextField/README.md); `loading` shows a spinner on the button (or in the box with `hideAction`). Exposes `input` and `focus()`. Hidden in print.

## Events

| Event    | Payload  | Notes                                                     |
| -------- | -------- | --------------------------------------------------------- |
| `submit` | `string` | The text, on Enter or the button.                         |
| `clear`  |          | The clear button was pressed. The model is already empty. |

## Accessibility

- The bar is a `search` landmark named by `label`. Give each search on a page a distinct label.
- On a phone the keyboard's Enter key reads "search" (`enterkeyhint`).

## Keyboard

| Key          | Action                                                          |
| ------------ | --------------------------------------------------------------- |
| Tab          | Moves from the box to the clear button, then the search button. |
| Enter        | Submits the text.                                               |
| Enter, Space | On the clear button, empties the box and returns focus to it.   |

## Related

[`ESearchResults`](../SearchResults/README.md) lists matches under it, [`ETextField`](../TextField/README.md) for a plain input, [`ECommandPalette`](../CommandPalette/README.md) to search commands.
