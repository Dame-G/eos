# ESignaturePad

A signature drawn with a finger, stylus or mouse. Most forms should use [`ESignatureField`](../SignatureField/README.md), which adds a typed alternative and an agreement.

```vue
<ESignaturePad v-model="image" :height="180" />
```

## Props

<!-- props:start -->

| Prop         | Type      | Default     | Notes                                                                                             |
| ------------ | --------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`  | `""`        | `v-model`: A PNG data URL (black on transparent). Empty while clear. Setting `""` clears the pad. |
| `height`     | `number`  | `160`       | The height of the drawing area in pixels.                                                         |
| `disabled`   | `boolean` | `false`     | Ignores drawing and disables Clear.                                                               |
| `id`         | `string`  | `generated` | The id of the canvas.                                                                             |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. A PNG data URL set from outside is drawn onto the pad, in the ink of the page, and later strokes are added to it. The strokes scale with the pad when it is resized. Exposes `clear()` and `canvas`.

## Accessibility

- The canvas is a `group` labelled "Draw your signature" and described by the hint. When `disabled` it is an `img`. The Clear button works from a keyboard.
- Drawing cannot be done from a keyboard, so always offer a typed signature too.

## Keyboard

| Key         | Does                       |
| ----------- | -------------------------- |
| Tab         | Moves to the Clear button. |
| Enter/Space | Clears the signature.      |

Drawing needs a pointer. Offer a typed signature as well.

## Related

[`ESignatureField`](../SignatureField/README.md) adds a typed alternative and an agreement, [`EUpload`](../Upload/README.md) takes a scanned signature as a file.
