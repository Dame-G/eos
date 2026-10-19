# ESignaturePad

A signature drawn with a finger, stylus or mouse. Most forms should use `ESignatureField`, which adds a typed alternative and an agreement.

```vue
<ESignaturePad v-model="image" :height="180" />
```

## Props

| Prop         | Type      | Default   | Notes                                                                               |
| ------------ | --------- | --------- | ----------------------------------------------------------------------------------- |
| `modelValue` | `string`  | `""`      | v-model: PNG data URL (black on transparent); empty while clear. Set `""` to clear. |
| `height`     | `number`  | `160`     | Drawing area height in pixels.                                                      |
| `disabled`   | `boolean` |           | Ignores drawing and disables Clear.                                                 |
| `id`         | `string`  | generated | Id of the canvas.                                                                   |

`class`, `style` and attributes land on the `div` element. A non-empty value set from outside is not drawn onto the pad. Exposes `clear()` and `canvas`.

## Accessibility

- The canvas is labelled "Draw your signature"; the Clear button is keyboard operable.
- Drawing cannot be done from a keyboard: always offer a typed signature too.
