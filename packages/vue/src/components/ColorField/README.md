# EColorField

A colour input as `#rrggbb`: a swatch that opens the native picker plus a text box for typing a hex value, for theme and brand settings.

```vue
<EColorField v-model="brand" label="Brand colour" hint="The deep action colours are derived from it." />
```

## Props

<!-- props:start -->

| Prop         | Type      | Default      | Notes                                                                                                                                        |
| ------------ | --------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`  | `""`         | `v-model`: `#rrggbb`, lower case. Only complete, valid colours are written. `#abc` expands to `#aabbcc`.                                     |
| `label`      | `string`  | **Required** | The visible label, a mono kicker above the input.                                                                                            |
| `hideLabel`  | `boolean` | `false`      | Keep the label for screen readers and remove it from the page.                                                                               |
| `hint`       | `string`  | —            | Help that stays under the input.                                                                                                             |
| `error`      | `string`  | —            | What to fix. Replaces the hint, marks the input invalid and is announced. Invalid typed text shows "Enter a colour like #2c95b4" after blur. |
| `required`   | `boolean` | `false`      | The `required` attribute and a word beside the label.                                                                                        |
| `optional`   | `boolean` | `false`      | A word beside the label. Flag whichever is rarer.                                                                                            |
| `disabled`   | `boolean` | `false`      | Disables the field.                                                                                                                          |
| `id`         | `string`  | `generated`  | The id of the text input; the label points at it.                                                                                            |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the text `input` element. The text box's example placeholder is the `colorPlaceholder` message. Exposes `input` and `focus()`. It does not check contrast; pair it with `defineTheme()`.

## Accessibility

- The label points at the text input; the swatch is a native `<input type="color">` named by the `pickColor` message.
- The hex value is always shown as text, so colour is not the only signal.
