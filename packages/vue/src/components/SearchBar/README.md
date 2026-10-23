# ESearchBar

The single search box for a page: an outlined field with a submit button inside.

```vue
<ESearchBar v-model="query" placeholder="Search statements and visits" @submit="search" />
```

## Props

<!-- props:start -->

| Prop          | Type      | Default    | Notes                                                                                       |
| ------------- | --------- | ---------- | ------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`  | `""`       | `v-model`: the text.                                                                        |
| `label`       | `string`  | `"Search"` | Names the box and the search landmark. It is not shown on the page.                         |
| `placeholder` | `string`  | `"Search"` | Hint text in the empty box that says what can be searched.                                  |
| `action`      | `string`  | `"Search"` | The text on the button.                                                                     |
| `hideAction`  | `boolean` | `false`    | Leaves out the button, for a box that filters or searches as you type. Enter still submits. |
| `clearable`   | `boolean` | `true`     | The clear button, shown when there is text.                                                 |
| `name`        | `string`  | `"q"`      | The name submitted with a form.                                                             |
| `disabled`    | `boolean` | `false`    | Disables the box and button. Pair it with an `ENotice` that says why.                       |

<!-- props:end -->

`class` and `style` land on the `form` element. Other attributes and listeners land on the `input` element. Exposes `input` and `focus()`. Hidden in print.

## Events

| Event    | Payload  | Notes                                                       |
| -------- | -------- | ----------------------------------------------------------- |
| `submit` | `string` | The text, on Enter or the button. The page does not reload. |
| `clear`  |          | The clear button was pressed. The model is already empty.   |

## Accessibility

- The form is a `search` landmark named by `label`. Give each search on a page a distinct label.
- On a phone the keyboard's Enter key reads "search" (`enterkeyhint`).

## Keyboard

| Key         | Does                                                            |
| ----------- | --------------------------------------------------------------- |
| Tab         | Moves from the box to the clear button, then the search button. |
| Enter       | Submits the text.                                               |
| Enter/Space | On the clear button, empties the box and returns focus to it.   |

## Related

[`ESearchResults`](../SearchResults/README.md) lists matches under it, [`ETextField`](../TextField/README.md) for a plain input, [`ECommandPalette`](../CommandPalette/README.md) to search commands.
