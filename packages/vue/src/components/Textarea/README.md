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
| `label`       | `string`  | **Required** | The visible label, a mono kicker above the text well.                           |
| `hideLabel`   | `boolean` | `false`      | Keep the label for screen readers and remove it from the page.                  |
| `hint`        | `string`  | —            | Help that stays under the text well.                                            |
| `error`       | `string`  | —            | What to fix. Replaces the hint, marks the textarea invalid and is announced.    |
| `placeholder` | `string`  | —            | An example, never the label.                                                    |
| `rows`        | `number`  | `4`          | Visible lines.                                                                  |
| `required`    | `boolean` | `false`      | The `required` attribute and a word beside the label.                           |
| `optional`    | `boolean` | `false`      | A word beside the label. Flag whichever is rarer.                               |
| `disabled`    | `boolean` | `false`      | Disables the field.                                                             |
| `readonly`    | `boolean` | `false`      | Shows the text but blocks editing. The textarea stays focusable and selectable. |
| `id`          | `string`  | `generated`  | The id of the textarea; the label points at it.                                 |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes and listeners (`name`, `maxlength`, `aria-*`, `@blur`) land on the `textarea` element. Exposes `input` and `focus()`.

## Accessibility

- The label, hint and error are linked to the textarea; an `error` is announced.
