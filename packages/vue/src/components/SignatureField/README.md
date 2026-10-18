# AeSignatureField

Signing a form by typing your name, drawing it, or either. Composes `AeSegmented`, `AeTextField`, `AeSignaturePad` and `AeCheckbox` in a fieldset.

```vue
<AeSignatureField v-model="signed" mode="both" label="Sign the consent form" />
```

```ts
const signed = ref<SignatureValue>({ method: "type", name: "", image: "", agreed: false });
```

## Props

| Prop        | Type                         | Notes                                                                            |
| ----------- | ---------------------------- | -------------------------------------------------------------------------------- |
| `v-model`   | `SignatureValue`             | `{ method, name, image, agreed }`. Leave it off for local state.                 |
| `label`     | `string`                     | Heads the group. Say what the form is. Default "Signature".                      |
| `mode`      | `"type" \| "draw" \| "both"` | `type` (default), `draw`, or `both` which adds a Type and Draw switch.           |
| `agreement` | `string`                     | The sentence the person agrees to. Default "I agree and want to sign this form." |
| `date`      | `Date`                       | The date shown with the signature. Today when left out.                          |
| `disabled`  | `boolean`                    | Disables the fields and the agreement.                                           |
| `id`        | `string`                     | The typed-name input's id. Generated when left out.                              |

`SignatureValue.image` is a PNG data URL, empty unless `method` is `draw`. The typed name is kept when switching to Draw; switching clears the image. `class` and other attributes land on the `<fieldset>`.

## Rules

- **Typed:** the name appears on a signature line in a handwriting face with the date beside it (announced politely), so the person sees what they are signing.
- **Drawn:** an `AeSignaturePad` with a signature line, a Clear button and the date.
- Signing needs the signature and the agreement checkbox: check both before accepting the form. Say what the form is in the label, and link to the full text before the field.
- A drawn signature cannot be done from a keyboard. Always allow the typed signature, so `both` is the right choice unless your rules say otherwise.
- The date uses the configured locale.
- Export: `SignatureValue` type.
