# EOtpField

A one-time code entered one character per box, with paste and SMS autofill support.

```vue
<EOtpField v-model="code" label="Sign-in code" hint="We texted you a code." @complete="verify" />
<EOtpField v-model="code" :length="8" inputmode="text" :group-size="4" />
```

## Props

<!-- props:start -->

| Prop         | Type                  | Default               | Notes                                                                                               |
| ------------ | --------------------- | --------------------- | --------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`              | `""`                  | `v-model`: the code typed so far.                                                                   |
| `label`      | `string`              | `"Verification code"` | The field's label.                                                                                  |
| `hideLabel`  | `boolean`             | `false`               | Hides the label from the page and keeps it for screen readers.                                      |
| `length`     | `number`              | `6`                   | How many characters: the number of boxes.                                                           |
| `inputmode`  | `"numeric" \| "text"` | `"numeric"`           | `numeric` opens the number pad and `text` takes letters and digits, upper-cased.                    |
| `groupSize`  | `number`              | `0`                   | The number of boxes in each group, with a gap between groups. A `length` of 6 with 3 reads 123 456. |
| `name`       | `string`              | None                  | The name submitted with a form (the whole code), through a hidden input.                            |
| `autoFocus`  | `boolean`             | `false`               | Focuses the first empty box when the field mounts.                                                  |
| `hint`       | `string`              | None                  | Help under the boxes, read with each box.                                                           |
| `error`      | `string`              | None                  | What to fix. Replaces the hint, marks every box invalid and is announced.                           |
| `required`   | `boolean`             | `false`               | Sets the `required` attribute on every box and shows "Required" beside the label.                   |
| `optional`   | `boolean`             | `false`               | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.            |
| `disabled`   | `boolean`             | `false`               | Disables every box.                                                                                 |
| `id`         | `string`              | `generated`           | The id of the first box. The label and hint ids are built from it.                                  |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `role="group"` element. Exposes `input` (the first box) and `focus()` (the first empty box).

## Events

| Event      | Payload        | Notes                                |
| ---------- | -------------- | ------------------------------------ |
| `complete` | `code: string` | Fires once, when the last box fills. |

## Accessibility

- Each box is named "Digit 3 of 6" ("Character 3 of 6" for `text`), and the group carries the label.
- Arrow keys, Home and End move between boxes. Backspace in an empty box deletes the previous character.
- Keep codes out of URLs and logs, and offer Resend beneath the field.
