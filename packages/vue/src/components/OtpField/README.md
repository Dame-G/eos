# EOtpField

A one-time code entered one character per box, with paste and SMS autofill support. Use [`ETextField`](../TextField/README.md) for a longer code, such as a coupon.

```vue
<EOtpField v-model="code" label="Sign-in code" hint="We texted you a code." @complete="verify" />
<EOtpField v-model="code" :length="8" charset="alphanumeric" :group-size="4" />
```

## Props

<!-- props:start -->

| Prop         | Type                          | Default               | Notes                                                                                                                              |
| ------------ | ----------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`                      | `""`                  | `v-model`: the code typed so far.                                                                                                  |
| `hideLabel`  | `boolean`                     | `false`               | Hides the label from the page and keeps it for screen readers.                                                                     |
| `hint`       | `string`                      | None                  | Help that stays under the control.                                                                                                 |
| `error`      | `string`                      | None                  | What to fix. Replaces the hint, marks the control invalid and is announced.                                                        |
| `required`   | `boolean`                     | `false`               | Sets the `required` attribute and shows "Required" beside the label.                                                               |
| `optional`   | `boolean`                     | `false`               | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                           |
| `disabled`   | `boolean`                     | `false`               | Disables the control. A disabled control posts nothing.                                                                            |
| `readonly`   | `boolean`                     | `false`               | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                         |
| `id`         | `string`                      | `generated`           | The id of the control. The label points at it.                                                                                     |
| `size`       | `"sm" \| "md" \| "lg"`        | `"md"`                | The height of the box: `sm` and `lg` are a step under and over the control height.                                                 |
| `label`      | `string`                      | `"Verification code"` | The field's label.                                                                                                                 |
| `length`     | `number`                      | `6`                   | How many characters: the number of boxes.                                                                                          |
| `charset`    | `"numeric" \| "alphanumeric"` | `"numeric"`           | The characters a box takes: `numeric` takes digits and opens the number pad, `alphanumeric` takes letters and digits, upper-cased. |
| `groupSize`  | `number`                      | `0`                   | The number of boxes in each group, with a gap between groups. A `length` of 6 with 3 reads 123 456.                                |
| `name`       | `string`                      | None                  | The name submitted with a form (the whole code), through a hidden input. Posts nothing while disabled.                             |
| `autofocus`  | `boolean`                     | `false`               | Focuses the first empty box when the field mounts, as the native attribute does for one input.                                     |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `role="group"` element; `@focus` and `@blur` fire as focus enters and leaves it. Exposes `input` (the first box) and `focus()` (the first empty box). `name` posts the whole code through a hidden input; a disabled field posts nothing, and `form` joins a form the field is not inside. `readonly` keeps the code and ignores typing and paste. `size` is as on [`ETextField`](../TextField/README.md).

## Events

| Event      | Payload        | Notes                                |
| ---------- | -------------- | ------------------------------------ |
| `complete` | `code: string` | Fires once, when the last box fills. |

## Accessibility

- Each box is named "Digit 3 of 6" ("Character 3 of 6" with `charset="alphanumeric"`), and the group carries the label.
- Tab enters at the first empty box (the last when full); the other boxes are reached with the arrow keys.
- Keep codes out of URLs and logs, and offer Resend beneath the field.

## Keyboard

| Key                     | Action                                                        |
| ----------------------- | ------------------------------------------------------------- |
| Tab, Shift+Tab          | Enters and leaves the field at the first empty box.           |
| Arrow Left, Arrow Right | Moves between boxes.                                          |
| Home, End               | Moves to the first box, or the first empty one.               |
| Backspace               | Deletes the character, or the previous one from an empty box. |
| Delete                  | Deletes the character in the box.                             |

## Related

[`EPasswordField`](../PasswordField/README.md) for a password.
