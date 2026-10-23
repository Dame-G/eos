# ESignatureField

Signing a form by typing a name, drawing it, or either, plus an agreement checkbox.

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
| `label`      | `string`                     | `"Signature"`                                            | The group's heading and accessible name, such as the form being signed.                                                                                                          |
| `mode`       | `"type" \| "draw" \| "both"` | `"type"`                                                 | How the person signs: `type`, `draw` or `both`, which adds a Type and Draw switch. A drawn signature cannot be made from a keyboard, so `both` lets keyboard users type instead. |
| `agreement`  | `string`                     | `"I agree and want to sign this form."`                  | The sentence the person agrees to.                                                                                                                                               |
| `date`       | `Date`                       | `today`                                                  | The date shown with the signature, in the configured locale.                                                                                                                     |
| `hint`       | `string`                     | None                                                     | Help that is announced with the group.                                                                                                                                           |
| `error`      | `string`                     | None                                                     | What to fix. Replaces the hint, is announced and marks the typed-name input or the pad invalid.                                                                                  |
| `required`   | `boolean`                    | `false`                                                  | Sets the `required` attribute on the typed-name input and shows a word beside the label.                                                                                         |
| `disabled`   | `boolean`                    | `false`                                                  | Disables the fields and the agreement. A disabled field is not submitted.                                                                                                        |
| `readonly`   | `boolean`                    | `false`                                                  | Shows the signature but blocks changes: the name, the pad, the switch and the agreement. It is still submitted.                                                                  |
| `name`       | `string`                     | None                                                     | The name submitted with a form: the typed name, or the drawn image as a data URL.                                                                                                |
| `id`         | `string`                     | `generated`                                              | The id of the typed-name input.                                                                                                                                                  |

<!-- props:end -->

`class`, `style` and attributes land on the `fieldset` element. A disabled field is not submitted. Switching method clears the image and keeps the typed name. The `SignatureValue` type is exported.

## Accessibility

- The group is a bare `EFieldset`: `hint` is announced with it. `error` replaces the hint and goes to the typed-name input (`aria-invalid`, alert) or to the pad, never onto the `fieldset`.
- A drawn signature cannot be made from a keyboard, so use `mode="both"`.
- `required` marks the typed-name input required; in `draw` mode the legend says "Required". `readonly` keeps everything visible and submitted but changes nothing, including the Type and Draw switch.
- The typed-name preview beside the date is not a live region: it repeats what the person is typing, which the input already announces.
- Signing needs a signature and the checked agreement: validate both before accepting the form.

## Keyboard

| Key        | Does                                                             |
| ---------- | ---------------------------------------------------------------- |
| Tab        | Moves through the Type/Draw switch, the name, and the agreement. |
| Arrow keys | Switch between Type and Draw.                                    |
| Space      | Ticks the agreement.                                             |

## Related

[`ESignaturePad`](../SignaturePad/README.md) is the drawing area on its own, [`ECheckbox`](../Checkbox/README.md) for a plain agreement.
