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

| Prop         | Type                         | Default                                                  | Notes                                                                                                                                                     |
| ------------ | ---------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `SignatureValue`             | `{ method: "type", name: "", image: "", agreed: false }` | `v-model`: `image` is a PNG data URL, empty unless `method` is `draw`.                                                                                    |
| `label`      | `string`                     | `"Signature"`                                            | Names the group and heads it. Say what the form is.                                                                                                       |
| `mode`       | `"type" \| "draw" \| "both"` | `"type"`                                                 | `type` the default, `draw`, or `both` which adds a Type and Draw switch. A drawn signature cannot be made from a keyboard, so `both` is the usual choice. |
| `agreement`  | `string`                     | `"I agree and want to sign this form."`                  | The sentence the person agrees to.                                                                                                                        |
| `date`       | `Date`                       | `today`                                                  | The date shown with the signature, in the configured locale.                                                                                              |
| `hint`       | `string`                     | —                                                        | Help that is announced with the group.                                                                                                                    |
| `error`      | `string`                     | —                                                        | What to fix. Replaces the hint, marks the group invalid and is announced with the group.                                                                  |
| `disabled`   | `boolean`                    | `false`                                                  | Disables the fields and the agreement.                                                                                                                    |
| `name`       | `string`                     | —                                                        | The name submitted with a form: the typed name, or the drawn image as a data URL.                                                                         |
| `id`         | `string`                     | `generated`                                              | The id of the typed-name input.                                                                                                                           |

<!-- props:end -->

`class`, `style` and attributes land on the `fieldset` element. Switching method clears the image; the typed name is kept. The `SignatureValue` type is exported.

## Accessibility

- A drawn signature cannot be made from a keyboard; use `mode="both"`.
- Signing needs a signature and the checked agreement: validate both before accepting the form.
