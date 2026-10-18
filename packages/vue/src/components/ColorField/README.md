# EColorField

A colour as a `#rrggbb` value: a swatch that opens the browser's colour picker, and a text box for typing or pasting a hex value. Built for theme settings and brand pages.

```vue
<EColorField v-model="brand" label="Brand colour" hint="The deep action colours are derived from it." />
```

## Props

| Prop        | Type      | Notes                                                                                     |
| ----------- | --------- | ----------------------------------------------------------------------------------------- |
| `v-model`   | `string`  | The colour as `#rrggbb`, lower case. Only a complete, valid colour is ever written to it. |
| `label`     | `string`  | Required. A mono kicker above the field.                                                  |
| `hideLabel` | `boolean` | Keeps the label for screen readers.                                                       |
| `hint`      | `string`  | Help under the field.                                                                     |
| `error`     | `string`  | Replaces the hint, marks the field invalid, announced.                                    |
| `required`  | `boolean` | The `required` attribute and the word "Required".                                         |
| `optional`  | `boolean` | The word "Optional".                                                                      |
| `disabled`  | `boolean` | Dashed and tinted.                                                                        |
| `id`        | `string`  | The text input's id. Generated when left out.                                             |

`class` and `style` land on the wrapper, everything else (`name`, `autocomplete`, listeners) on the text `<input>`. Exposed: `input` and `focus()`.

## Words

| Message        | Default                       |
| -------------- | ----------------------------- |
| `pickColor`    | "Pick a colour"               |
| `colorInvalid` | "Enter a colour like #2c95b4" |

## Accessibility

- The label points at the text input. The swatch is a native `<input type="color">` named by `pickColor`, so the platform's picker and its keyboard use come with it.
- Three-digit values (`#abc`) are accepted and written as `#aabbcc`. Text that is not a colour is kept as typed, flagged with `colorInvalid` after the person leaves the box, and never reaches the model.
- Colour is not the only signal: the hex value is always shown as text.

## Rules

- Use it where a person chooses a brand or theme colour. For a choice from a short list, use `ERadioGroup` or `ESegmented`.
- It does not check contrast. Pair it with `defineTheme()`, whose `issues` name any failing pair.
