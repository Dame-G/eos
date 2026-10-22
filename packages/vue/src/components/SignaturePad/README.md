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

`class`, `style` and attributes land on the `div` element. A non-empty value set from outside is not drawn onto the pad. Exposes `clear()` and `canvas`.

## Accessibility

- The canvas is labelled "Draw your signature" and the Clear button works from a keyboard.
- Drawing cannot be done from a keyboard, so always offer a typed signature too.
