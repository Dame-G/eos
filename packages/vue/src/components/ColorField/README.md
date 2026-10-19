# EColorField

A colour input as `#rrggbb`: a swatch that opens the native picker plus a text box for typing a hex value, for theme and brand settings.

```vue
<EColorField v-model="brand" label="Brand colour" hint="The deep action colours are derived from it." />
```

## Props

| Prop         | Type      | Default   | Notes                                                                                                  |
| ------------ | --------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `modelValue` | `string`  | `""`      | v-model: `#rrggbb`, lower case. Only complete, valid colours are written. `#abc` expands to `#aabbcc`. |
| `label`      | `string`  |           | Required.                                                                                              |
| `hideLabel`  | `boolean` |           | Keeps the label for screen readers only.                                                               |
| `hint`       | `string`  |           | Help under the field.                                                                                  |
| `error`      | `string`  |           | Replaces the hint; marks invalid. Invalid typed text shows "Enter a colour like #2c95b4" after blur.   |
| `required`   | `boolean` |           | The `required` attribute and the word "Required".                                                      |
| `optional`   | `boolean` |           | The word "Optional".                                                                                   |
| `disabled`   | `boolean` |           |                                                                                                        |
| `id`         | `string`  | generated | Id of the text input.                                                                                  |

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the text `input` element. Exposes `input` and `focus()`. It does not check contrast; pair it with `defineTheme()`.

## Accessibility

- The label points at the text input; the swatch is a native `<input type="color">` named by the `pickColor` message.
- The hex value is always shown as text, so colour is not the only signal.
