# ESignatureField

Signing a form by typing a name, drawing it, or either, plus an agreement checkbox. Use [`ESignaturePad`](../SignaturePad/README.md) alone only when the signature must be drawn.

```vue
<ESignatureField v-model="signed" mode="both" label="Sign the consent form" />
```

```ts
const signed = ref<SignatureValue>({ method: "type", name: "", image: "", agreed: false });
```

## Props

<!-- props:start -->

| Prop         | Type                         | Default                                                  | Notes                                                                                                                                                                            |
| ------------ | ---------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `SignatureValue`             | `{ method: "type", name: "", image: "", agreed: false }` | `v-model`: `image` is a PNG data URL, empty unless `method` is `draw`.                                                                                                           |
| `hint`       | `string`                     | None                                                     | Help that stays under the control.                                                                                                                                               |
| `error`      | `string`                     | None                                                     | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                                      |
| `required`   | `boolean`                    | `false`                                                  | Sets the `required` attribute and shows "Required" beside the label.                                                                                                             |
| `optional`   | `boolean`                    | `false`                                                  | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                                         |
| `disabled`   | `boolean`                    | `false`                                                  | Disables the control. A disabled control posts nothing.                                                                                                                          |
| `readonly`   | `boolean`                    | `false`                                                  | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                                                                       |
| `id`         | `string`                     | `generated`                                              | The id of the control. The label points at it.                                                                                                                                   |
| `label`      | `string`                     | `"Signature"`                                            | The group's heading and accessible name, such as the form being signed.                                                                                                          |
| `mode`       | `"type" \| "draw" \| "both"` | `"type"`                                                 | How the person signs: `type`, `draw` or `both`, which adds a Type and Draw switch. A drawn signature cannot be made from a keyboard, so `both` lets keyboard users type instead. |
| `agreement`  | `string`                     | `"I agree and want to sign this form."`                  | The sentence the person agrees to.                                                                                                                                               |
| `date`       | `Date`                       | `today`                                                  | The date shown with the signature, in the configured locale.                                                                                                                     |
| `name`       | `string`                     | None                                                     | The name submitted with a form: the typed name, or the drawn image as a data URL.                                                                                                |

<!-- props:end -->

`class`, `style` and attributes land on the `fieldset` element. A disabled field is not submitted. Switching method clears the image and keeps the typed name. The `SignatureValue` type is exported.

## Accessibility

- The group is a plain `EFieldset`: `hint` is announced with it. `error` replaces the hint and goes to the typed-name input (`aria-invalid`) or to the pad, never onto the `fieldset`.
- A drawn signature cannot be made from a keyboard, so use `mode="both"`.
- `required` makes the typed name or the drawing, and the agreement, required; the legend says "Required" once for all of them. `readonly` keeps everything visible and submitted but changes nothing, including the Type and Draw switch.
- The typed-name preview beside the date is not a live region: it repeats what the person is typing, which the input already announces.
- Signing needs a signature and the checked agreement: validate both before accepting the form.

## Keyboard

| Key        | Action                                                           |
| ---------- | ---------------------------------------------------------------- |
| Tab        | Moves through the Type/Draw switch, the name, and the agreement. |
| Arrow keys | Switches between Type and Draw.                                  |
| Space      | Ticks the agreement.                                             |

## Related

[`ECheckbox`](../Checkbox/README.md) for a plain agreement.
