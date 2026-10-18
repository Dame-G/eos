# AeSignaturePad

A signature drawn with a finger, stylus or mouse on a signature line. `AeSignatureField` wraps it with a typed alternative, a date and the agreement checkbox, so most forms should use that.

```vue
<AeSignaturePad v-model="image" :height="180" />
```

## Props

| Prop       | Type      | Notes                                                                                                   |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `v-model`  | `string`  | The drawing as a PNG data URL; an empty string while the pad is clear. Set it to `""` to clear the pad. |
| `height`   | `number`  | The drawing area in pixels. Default 160.                                                                |
| `disabled` | `boolean` | Ignores drawing and disables Clear.                                                                     |
| `id`       | `string`  | The canvas id. Generated when left out.                                                                 |

Exposed: `clear()` and `canvas`. The model is empty exactly when nothing is drawn, so there is no separate `empty` flag.

## Rules

- The canvas is labelled "Draw your signature" and described by the hint, which says to choose Type. The Clear button is a real button, reachable and operable from the keyboard.
- A drawn signature cannot be made from a keyboard. Always offer the typed signature as well (`AeSignatureField` with `mode="both"`).
- The drawing is redrawn after a resize. The exported image is black on a transparent ground whatever the theme draws on screen.
- A value set from outside is not drawn onto the pad; only clearing is supported.
- Pointer events with pointer capture; `touch-action: none` so drawing does not scroll the page.
