# ETextarea

A labelled multi-line text input that resizes vertically. It takes the props of [`ETextField`](../TextField/README.md) except `type`, `prefix`, `suffix`, `size`, `loading` and `clearable`, and adds `rows` and `autoGrow`.

```vue
<ETextarea v-model="note" label="Note to the team" :rows="5" optional />
<ETextarea v-model="story" label="Your story" :maxlength="500" counter auto-grow />
```

## Props

<!-- props:start -->

| Prop           | Type      | Default      | Notes                                                                                                      |
| -------------- | --------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `modelValue`   | `string`  | `""`         | `v-model`: the text.                                                                                       |
| `hideLabel`    | `boolean` | `false`      | Hides the label from the page and keeps it for screen readers.                                             |
| `hint`         | `string`  | None         | Help that stays under the control.                                                                         |
| `error`        | `string`  | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                |
| `required`     | `boolean` | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                       |
| `optional`     | `boolean` | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                   |
| `disabled`     | `boolean` | `false`      | Disables the control. A disabled control posts nothing.                                                    |
| `readonly`     | `boolean` | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value. |
| `id`           | `string`  | `generated`  | The id of the control. The label points at it.                                                             |
| `label`        | `string`  | **Required** | The visible label above the textarea.                                                                      |
| `placeholder`  | `string`  | None         | An example, never the label.                                                                               |
| `rows`         | `number`  | `4`          | Visible lines. The height follows it, down to one. With `autoGrow` it is the least height.                 |
| `name`         | `string`  | None         | The name submitted with a form.                                                                            |
| `autocomplete` | `string`  | None         | What the browser may fill in.                                                                              |
| `maxlength`    | `number`  | None         | The most characters the textarea takes.                                                                    |
| `counter`      | `boolean` | `false`      | Shows how many characters there are, out of `maxlength` when it is set.                                    |
| `autoGrow`     | `boolean` | `false`      | Grows with the text instead of scrolling, and drops the resize handle.                                     |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners (`aria-*`, `@blur`) land on the `textarea` element. Exposes `input` and `focus()`.

## Accessibility

- The label, hint and error are linked to the textarea, and an `error` is announced.
- `counter` is read as part of the textarea's description, not announced on every key.
- `autoGrow` sizes the box to its text, with `rows` as the least height, and drops the resize handle.

## Keyboard

Native textarea keys. Enter adds a line break. The resize handle is a pointer control, so give people room with `rows` instead of relying on it.

## Related

[`ETextField`](../TextField/README.md) for one line.
