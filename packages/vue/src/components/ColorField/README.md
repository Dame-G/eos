# EColorField

A colour input as `#rrggbb`: a swatch that opens the native picker plus a text box for typing a hex value, for theme and brand settings.

```vue
<EColorField v-model="brand" label="Brand colour" hint="The deep action colours are derived from it." />
```

## Props

<!-- props:start -->

| Prop         | Type         | Default      | Notes                                                                                                                                                  |
| ------------ | ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelValue` | `string`     | `""`         | `v-model`: `#rrggbb`, lower case. Only complete, valid colours are written, and clearing the text writes an empty string. `#abc` expands to `#aabbcc`. |
| `hideLabel`  | `boolean`    | `false`      | Hides the label from the page and keeps it for screen readers.                                                                                         |
| `hint`       | `string`     | None         | Help that stays under the control.                                                                                                                     |
| `error`      | `string`     | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                            |
| `required`   | `boolean`    | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                                                                   |
| `optional`   | `boolean`    | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                               |
| `disabled`   | `boolean`    | `false`      | Disables the control. A disabled control posts nothing.                                                                                                |
| `readonly`   | `boolean`    | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                                             |
| `id`         | `string`     | `generated`  | The id of the control. The label points at it.                                                                                                         |
| `size`       | `EFieldSize` | `"md"`       | The height of the box: `sm` and `lg` are a step under and over the control height.                                                                     |
| `label`      | `string`     | **Required** | The visible label.                                                                                                                                     |
| `name`       | `string`     | None         | The name submitted with a form: the normalised `#rrggbb`, or empty when the text is not a colour. Posts nothing while disabled.                        |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the text `input` element. `name` submits the normalised `#rrggbb` through a hidden input; a disabled field posts nothing. An empty value shows a struck-through chip, not black. The text box's example placeholder is the `colorPlaceholder` message. Exposes `input` and `focus()`. It does not check contrast, so pair it with `defineTheme()`.

## Accessibility

- The label points at the text input. The swatch is a native `<input type="color">` named by the `pickColor` message.
- The hex value is always shown as text, so colour is not the only signal.
- With `readonly` the picker is off and the text box stays focusable.

## Keyboard

| Key          | Action                                           |
| ------------ | ------------------------------------------------ |
| Tab          | Moves between the swatch and the text box.       |
| Enter, Space | On the swatch, open the browser's colour picker. |

## Related

[`ETextField`](../TextField/README.md) for other text, [`ESelect`](../Select/README.md) to choose from a fixed set of colours.
