# EOtpField

A one-time code, one character per box. Built on `EField`.

```vue
<EOtpField v-model="code" label="Sign-in code" hint="We texted you a code." @complete="verify" />
<EOtpField v-model="code" :length="8" type="text" :group-size="4" />
```

## Props

| Prop        | Type                  | Notes                                                                                   |
| ----------- | --------------------- | --------------------------------------------------------------------------------------- |
| `v-model`   | `string`              | The code typed so far. Leave it off for local state.                                    |
| `label`     | `string`              | "Verification code" when left out.                                                      |
| `length`    | `number`              | Default 6.                                                                              |
| `type`      | `"numeric" \| "text"` | `numeric` (default) opens the number pad; `text` takes letters and digits, upper-cased. |
| `groupSize` | `number`              | A gap between groups: 6 with 3 reads 123 456.                                           |
| `name`      | `string`              | Submits the whole code through a hidden input.                                          |
| `autoFocus` | `boolean`             | Starts in the first empty box.                                                          |
| `hint`      | `string`              | Read with each box.                                                                     |
| `error`     | `string`              | Replaces the hint, read with each box, marks every box invalid.                         |
| `disabled`  | `boolean`             |                                                                                         |
| `id`        | `string`              | The first box's id; the label and hint ids are built from it.                           |

## Events

| Event      | Payload        | Notes                          |
| ---------- | -------------- | ------------------------------ |
| `complete` | `code: string` | Once, when the last box fills. |

`class` and `style` stay on the wrapper; other attributes and listeners land on the `role="group"` element. Exposed: `focus()` (first empty box).

## Rules

- One keystroke, one character, then focus moves on. Typing over a filled box replaces it. Backspace deletes a character; in an empty box it steps back and deletes the one before. Arrow keys, Home, End move; Delete removes.
- Paste and SMS autofill fill every box (the first has `autocomplete="one-time-code"`). Focus cannot skip past the last filled box, so the code has no gaps.
- Boxes are 48px tall and narrow on a phone so eight fit. Each is named "Digit 3 of 6" (or "Character 3 of 6" for text); the group carries the visible label.
- Keep codes out of URLs and logs. Offer Resend and another way to sign in beneath the field.
