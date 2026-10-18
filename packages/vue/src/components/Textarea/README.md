# ETextarea

A multi-line text well, 6.5rem tall at rest, resizable vertically. Built on `EField`; it takes `ETextField`'s props, attributes and listeners.

```vue
<ETextarea v-model="note" label="Note to the practice" :rows="5" optional />
```

## Props

| Prop          | Type      | Notes                                                     |
| ------------- | --------- | --------------------------------------------------------- |
| `v-model`     | `string`  | The text. Leave it off for local state.                   |
| `label`       | `string`  | Required.                                                 |
| `hideLabel`   | `boolean` | Keeps the label for screen readers only.                  |
| `hint`        | `string`  | Help under the well.                                      |
| `error`       | `string`  | Replaces the hint, marks the textarea invalid, announced. |
| `placeholder` | `string`  | An example.                                               |
| `rows`        | `number`  | Visible lines. Default 4.                                 |
| `required`    | `boolean` | The `required` attribute and the word "Required".         |
| `optional`    | `boolean` | The word "Optional".                                      |
| `disabled`    | `boolean` |                                                           |
| `id`          | `string`  | Generated when left out.                                  |

`class` and `style` stay on the wrapper; every other attribute and listener (`name`, `maxlength`, `aria-*`, `data-*`, `@blur`) lands on the `<textarea>`. Exposed: `input` and `focus()`.

## Rules

- The label, hint and error wiring is `EField`'s: the hint sits 8px under the well.
- Resizes vertically only.
