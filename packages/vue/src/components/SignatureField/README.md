# ESignatureField

Signing a form by typing a name, drawing it, or either, plus an agreement checkbox.

```vue
<ESignatureField v-model="signed" mode="both" label="Sign the consent form" />
```

```ts
const signed = ref<SignatureValue>({ method: "type", name: "", image: "", agreed: false });
```

## Props

| Prop         | Type                         | Default                                                  | Notes                                                                |
| ------------ | ---------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| `modelValue` | `SignatureValue`             | `{ method: "type", name: "", image: "", agreed: false }` | v-model. `image` is a PNG data URL, empty unless `method` is `draw`. |
| `label`      | `string`                     | `Signature`                                              | Heads the group; say what the form is.                               |
| `mode`       | `"type" \| "draw" \| "both"` | `type`                                                   | `both` adds a Type and Draw switch.                                  |
| `agreement`  | `string`                     | `I agree and want to sign this form.`                    | The sentence the person agrees to.                                   |
| `date`       | `Date`                       | today                                                    | The date shown with the signature, in the configured locale.         |
| `disabled`   | `boolean`                    |                                                          | Disables the fields and the agreement.                               |
| `id`         | `string`                     | generated                                                | Id of the typed-name input.                                          |

`class`, `style` and attributes land on the `fieldset` element. Switching method clears the image; the typed name is kept. The `SignatureValue` type is exported.

## Accessibility

- A drawn signature cannot be made from a keyboard; use `mode="both"`.
- Signing needs a signature and the checked agreement: validate both before accepting the form.
