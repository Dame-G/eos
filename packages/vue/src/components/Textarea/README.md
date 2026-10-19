# ETextarea

A labelled multi-line text input that resizes vertically. It takes the props of `ETextField` except `type`, `prefix` and `suffix`, and adds `rows`.

```vue
<ETextarea v-model="note" label="Note to the team" :rows="5" optional />
```

## Props

| Prop          | Type      | Default   | Notes                                                        |
| ------------- | --------- | --------- | ------------------------------------------------------------ |
| `modelValue`  | `string`  | `""`      | v-model: the text.                                           |
| `label`       | `string`  |           | Required.                                                    |
| `hideLabel`   | `boolean` |           | Keeps the label for screen readers only.                     |
| `hint`        | `string`  |           | Help under the input.                                        |
| `error`       | `string`  |           | Replaces the hint, marks the input invalid and is announced. |
| `placeholder` | `string`  |           | An example.                                                  |
| `rows`        | `number`  | `4`       | Visible lines.                                               |
| `required`    | `boolean` |           | The `required` attribute and the word "Required".            |
| `optional`    | `boolean` |           | The word "Optional". Flag whichever is rarer.                |
| `disabled`    | `boolean` |           |                                                              |
| `id`          | `string`  | generated | Id of the textarea.                                          |

`class` and `style` land on the wrapper `div`; other attributes and listeners (`name`, `maxlength`, `aria-*`, `@blur`) land on the `textarea` element. Exposes `input` and `focus()`.

## Accessibility

- The label, hint and error are linked to the textarea; an `error` is announced.
