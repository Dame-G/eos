# EOtpField

A one-time code entered one character per box, with paste and SMS autofill support.

```vue
<EOtpField v-model="code" label="Sign-in code" hint="We texted you a code." @complete="verify" />
<EOtpField v-model="code" :length="8" type="text" :group-size="4" />
```

## Props

| Prop         | Type                  | Default             | Notes                                                                         |
| ------------ | --------------------- | ------------------- | ----------------------------------------------------------------------------- |
| `modelValue` | `string`              | `""`                | v-model: the code typed so far.                                               |
| `label`      | `string`              | `Verification code` | The field's label.                                                            |
| `length`     | `number`              | `6`                 | Number of boxes.                                                              |
| `type`       | `"numeric" \| "text"` | `numeric`           | `numeric` opens the number pad; `text` takes letters and digits, upper-cased. |
| `groupSize`  | `number`              | `0`                 | Gap between groups: 6 with 3 reads 123 456.                                   |
| `name`       | `string`              |                     | Submits the whole code through a hidden input.                                |
| `autoFocus`  | `boolean`             |                     | Starts in the first empty box.                                                |
| `hint`       | `string`              |                     | Read with each box.                                                           |
| `error`      | `string`              |                     | Replaces the hint, marks every box invalid.                                   |
| `disabled`   | `boolean`             |                     |                                                                               |
| `id`         | `string`              | generated           | First box's id.                                                               |

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `role="group"` element. Exposes `focus()` (first empty box).

## Events

| Event      | Payload        | Notes                          |
| ---------- | -------------- | ------------------------------ |
| `complete` | `code: string` | Once, when the last box fills. |

## Accessibility

- Each box is named "Digit 3 of 6" ("Character 3 of 6" for `text`); the group carries the label.
- Arrow keys, Home and End move between boxes; Backspace in an empty box deletes the previous character.
- Keep codes out of URLs and logs; offer Resend beneath the field.
