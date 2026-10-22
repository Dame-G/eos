# EColorField

A colour input as `#rrggbb`: a swatch that opens the native picker plus a text box for typing a hex value, for theme and brand settings.

```vue
<EColorField v-model="brand" label="Brand colour" hint="The deep action colours are derived from it." />
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string` | `""` | `v-model`: `#rrggbb`, lower case. Only complete, valid colours are written. `#abc` expands to `#aabbcc`. |
| `label` | `string` | **Required** | The visible label. |
| `hideLabel` | `boolean` | `false` | Keeps the label for screen readers and hides it from the page. |
| `hint` | `string` | None | Shows help text under the input. |
| `error` | `string` | None | Shows what to fix in place of the hint, marks the input invalid and is announced. Invalid typed text shows "Enter a colour like #2c95b4" after blur. |
| `required` | `boolean` | `false` | Sets the `required` attribute and shows a word beside the label. |
| `optional` | `boolean` | `false` | Shows a word beside the label. Use it on whichever of required and optional is rarer. |
| `disabled` | `boolean` | `false` | Disables the field. |
| `id` | `string` | `generated` | The `id` of the text input, which the label points at. |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the text `input` element. The text box's example placeholder is the `colorPlaceholder` message. Exposes `input` and `focus()`. It does not check contrast, so pair it with `defineTheme()`.

## Accessibility

- The label points at the text input. The swatch is a native `<input type="color">` named by the `pickColor` message.
- The hex value is always shown as text, so colour is not the only signal.
