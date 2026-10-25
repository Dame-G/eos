# ESignaturePad

A signature drawn with a finger, stylus or mouse. Most forms should use [`ESignatureField`](../SignatureField/README.md), which adds a typed alternative and an agreement.

```vue
<ESignaturePad v-model="image" label="Your signature" name="signature" height="11rem" />
```

## Props

<!-- props:start -->

| Prop         | Type               | Default     | Notes                                                                                                                                                                                   |
| ------------ | ------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`           | `""`        | `v-model`: A PNG data URL (black on transparent). Empty while clear. Setting `""` clears the pad.                                                                                       |
| `label`      | `string`           | None        | A label shown above the pad, which also names it. Without one the pad is named "Draw your signature" and no label shows.                                                                |
| `hideLabel`  | `boolean`          | `false`     | Hides the label from the page and keeps it for screen readers.                                                                                                                          |
| `height`     | `number \| string` | `160`       | The height of the drawing area: a number of pixels or a CSS length such as `"10rem"`.                                                                                                   |
| `hint`       | `string`           | None        | Help that stays under the pad.                                                                                                                                                          |
| `error`      | `string`           | None        | What to fix. Replaces the hint, gives the pad a danger edge, is announced and describes the pad. An image has no `aria-invalid`.                                                        |
| `required`   | `boolean`          | `false`     | Adds "Required" beside the label, or to what screen readers hear with the pad. An `EForm` around it stops the submit while the pad is empty; a plain form does not, so check the value. |
| `optional`   | `boolean`          | `false`     | Shows "Optional" beside the label, or adds it to what screen readers hear. Only the rarer of required and optional needs a flag.                                                        |
| `disabled`   | `boolean`          | `false`     | Ignores drawing and disables Clear. A disabled pad posts nothing.                                                                                                                       |
| `readonly`   | `boolean`          | `false`     | Shows the signature but ignores drawing and disables Clear.                                                                                                                             |
| `name`       | `string`           | None        | The name the PNG data URL is submitted under with a form, through a hidden input.                                                                                                       |
| `id`         | `string`           | `generated` | The id of the canvas.                                                                                                                                                                   |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. A PNG data URL set from outside is drawn onto the pad, in the ink of the page, and later strokes are added to it. The strokes scale with the pad when it is resized. Exposes `clear()` and `canvas`.

## Accessibility

- The canvas is an `img` named by `label`, or "Draw your signature" without one, and described by the instructions, then by `hint` or `error`. It is not focusable. `error` is announced, describes it and turns its edge danger (an image has no `aria-invalid`); without a visible label `required` and `optional` add their word to the description, and inside an [`EForm`](../Form/README.md) an empty required pad stops the submit (the summary link brings it into view). The Clear button works from a keyboard.
- Drawing is pointer-only and cannot be made keyboard-operable, so always offer a typed signature: `ESignatureField` with `mode="both"` does. The instructions say to choose Type.
- `readonly` shows the signature and ignores drawing, on the tinted face of a read-only field; `disabled` draws the dashed edge and dims the ink. `aria-readonly` is not defined for an image, so the state is visual and in the disabled Clear button.

## Keyboard

| Key          | Action                     |
| ------------ | -------------------------- |
| Tab          | Moves to the Clear button. |
| Enter, Space | Clears the signature.      |

Drawing needs a pointer. Offer a typed signature as well.

## Related

[`EUpload`](../Upload/README.md) takes a scanned signature as a file.
