# EOtpField

A one-time code entered one character per box, with paste and SMS autofill support.

```vue
<EOtpField v-model="code" label="Sign-in code" hint="We texted you a code." @complete="verify" />
<EOtpField v-model="code" :length="8" inputmode="text" :group-size="4" />
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string` | `""` | `v-model`: the code typed so far. |
| `label` | `string` | `"Verification code"` | The field's label. |
| `hideLabel` | `boolean` | `false` | Keep the label for screen readers and remove it from the page. |
| `length` | `number` | `6` | How many characters: the number of boxes. |
| `inputmode` | `"numeric" \| "text"` | `"numeric"` | `numeric` opens the number pad; `text` takes letters and digits, upper-cased. |
| `groupSize` | `number` | `0` | A gap between groups: 6 with 3 reads 123 456. |
| `name` | `string` | — | The name submitted with a form (the whole code), through a hidden input. |
| `autoFocus` | `boolean` | `false` | Start in the first empty box. |
| `hint` | `string` | — | Help under the boxes, read with each box. |
| `error` | `string` | — | What to fix. Replaces the hint, marks every box invalid and is announced. |
| `required` | `boolean` | `false` | A word beside the label, and the `required` attribute on every box. |
| `optional` | `boolean` | `false` | A word beside the label. Flag whichever is rarer. |
| `disabled` | `boolean` | `false` | Disables every box. |
| `id` | `string` | `generated` | The id of the first box; the label and hint ids are built from it. |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `role="group"` element. Exposes `focus()` (first empty box).

## Events

| Event      | Payload        | Notes                          |
| ---------- | -------------- | ------------------------------ |
| `complete` | `code: string` | Once, when the last box fills. |

## Accessibility

- Each box is named "Digit 3 of 6" ("Character 3 of 6" for `text`); the group carries the label.
- Arrow keys, Home and End move between boxes; Backspace in an empty box deletes the previous character.
- Keep codes out of URLs and logs; offer Resend beneath the field.
