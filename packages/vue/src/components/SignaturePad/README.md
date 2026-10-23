# ESignaturePad

A signature drawn with a finger, stylus or mouse. Most forms should use [`ESignatureField`](../SignatureField/README.md), which adds a typed alternative and an agreement.

```vue
<ESignaturePad v-model="image" :height="180" />
```

## Props

<!-- props:start -->

| Prop         | Type      | Default     | Notes                                                                                                                            |
| ------------ | --------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`  | `""`        | `v-model`: A PNG data URL (black on transparent). Empty while clear. Setting `""` clears the pad.                                |
| `height`     | `number`  | `160`       | The height of the drawing area in pixels.                                                                                        |
| `hint`       | `string`  | None        | Help that stays under the pad.                                                                                                   |
| `error`      | `string`  | None        | What to fix. Replaces the hint, gives the pad a danger edge, is announced and describes the pad. An image has no `aria-invalid`. |
| `required`   | `boolean` | `false`     | Adds "Required" to what screen readers hear with the pad. Nothing stops an empty pad from being submitted: check the value.      |
| `disabled`   | `boolean` | `false`     | Ignores drawing and disables Clear.                                                                                              |
| `readonly`   | `boolean` | `false`     | Shows the signature but ignores drawing and disables Clear.                                                                      |
| `id`         | `string`  | `generated` | The id of the canvas.                                                                                                            |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. A PNG data URL set from outside is drawn onto the pad, in the ink of the page, and later strokes are added to it. The strokes scale with the pad when it is resized. Exposes `clear()` and `canvas`.

## Accessibility

- The canvas is an `img` labelled "Draw your signature" and described by the instructions, then by `hint` or `error`. It is not focusable. `error` is announced, describes it and turns its edge danger (an image has no `aria-invalid`); `required` adds "Required" to the description. The Clear button works from a keyboard.
- Drawing is pointer-only and cannot be made keyboard-operable, so always offer a typed signature: `ESignatureField` with `mode="both"` does. The instructions say to choose Type.
- `readonly` shows the signature and ignores drawing; `aria-readonly` is not defined for an image, so the state is visual and in the disabled Clear button.

## Keyboard

| Key         | Does                       |
| ----------- | -------------------------- |
| Tab         | Moves to the Clear button. |
| Enter/Space | Clears the signature.      |

Drawing needs a pointer. Offer a typed signature as well. The pad has no input of its own: submit the value yourself.

## Related

[`ESignatureField`](../SignatureField/README.md) adds a typed alternative and an agreement, [`EUpload`](../Upload/README.md) takes a scanned signature as a file.
