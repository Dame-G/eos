# ETextarea

A labelled multi-line text input that resizes vertically. It takes the props of [`ETextField`](../TextField/README.md) except `type`, `prefix` and `suffix`, and adds `rows`.

```vue
<ETextarea v-model="note" label="Note to the team" :rows="5" optional />
```

## Props

<!-- props:start -->

| Prop          | Type      | Default      | Notes                                                                           |
| ------------- | --------- | ------------ | ------------------------------------------------------------------------------- |
| `modelValue`  | `string`  | `""`         | `v-model`: the text.                                                            |
| `label`       | `string`  | **Required** | The visible label above the textarea.                                           |
| `hideLabel`   | `boolean` | `false`      | Keeps the label for screen readers and hides it from the page.                  |
| `hint`        | `string`  | None         | Help that stays under the textarea.                                             |
| `error`       | `string`  | None         | What to fix. Replaces the hint, marks the textarea invalid and is announced.    |
| `placeholder` | `string`  | None         | An example, never the label.                                                    |
| `rows`        | `number`  | `4`          | Visible lines. The height follows it, down to one.                              |
| `required`    | `boolean` | `false`      | Sets the `required` attribute and adds a word beside the label.                 |
| `optional`    | `boolean` | `false`      | Adds a word beside the label. Use it when most fields in the form are required. |
| `disabled`    | `boolean` | `false`      | Disables the field.                                                             |
| `readonly`    | `boolean` | `false`      | Shows the text but blocks editing. The textarea stays focusable and selectable. |
| `id`          | `string`  | `generated`  | The id of the textarea, which the label points at.                              |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners (`name`, `maxlength`, `aria-*`, `@blur`) land on the `textarea` element. Exposes `input` and `focus()`.

## Accessibility

- The label, hint and error are linked to the textarea, and an `error` is announced.

## Keyboard

Native textarea keys. Enter adds a line break. The resize handle is a pointer control, so give people room with `rows` instead of relying on it.

## Related

[`ETextField`](../TextField/README.md) for one line.
