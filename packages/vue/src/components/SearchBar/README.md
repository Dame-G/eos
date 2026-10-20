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
| `label`       | `string`  | `"Search"` | Names the box and the search landmark; there is no visible label.                           |
| `placeholder` | `string`  | `"Search"` | Say what can be searched, briefly.                                                          |
| `action`      | `string`  | `"Search"` | The text on the button.                                                                     |
| `hideAction`  | `boolean` | `false`    | Leaves out the button, for a box that filters or searches as you type. Enter still submits. |
| `clearable`   | `boolean` | `true`     | The clear button, shown when there is text.                                                 |
| `name`        | `string`  | `"q"`      | The name submitted with a form.                                                             |
| `disabled`    | `boolean` | `false`    | Disables the box and button. Say why in an `ENotice`.                                       |

<!-- props:end -->

`class` and `style` land on the `form` element; other attributes and listeners land on the `input` element. Exposes `input` and `focus()`. Hidden in print.

## Events

| Event    | Payload  | Notes                                                       |
| -------- | -------- | ----------------------------------------------------------- |
| `submit` | `string` | The text, on Enter or the button. The page does not reload. |

## Accessibility

- The form is a `search` landmark named by `label`; give each search on a page a distinct label.
