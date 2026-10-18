# AeTextField

A labelled text input, pressed into the page like a well. Built on `AeField`.

```vue
<AeTextField v-model="email" label="Email" type="email" required autocomplete="email" hint="We send receipts here." />
<AeTextField v-model="amount" label="Payment amount" prefix="$" suffix="USD" inputmode="decimal" />
```

## Props

| Prop          | Type      | Notes                                                                                               |
| ------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `v-model`     | `string`  | The text. Leave it off for local state.                                                             |
| `label`       | `string`  | Required. The mono kicker above the input; the placeholder is an example, never the label.          |
| `hideLabel`   | `boolean` | Keeps the label for screen readers and removes it from the page (an amount under "Another amount"). |
| `hint`        | `string`  | Help under the input.                                                                               |
| `error`       | `string`  | Replaces the hint, turns the edge `danger`, adds an alert glyph, marks the input invalid.           |
| `placeholder` | `string`  | An example.                                                                                         |
| `type`        | `string`  | The input type. Default `text`.                                                                     |
| `prefix`      | `string`  | A unit before the value, such as `$`. Hidden from screen readers.                                   |
| `suffix`      | `string`  | A unit after the value, such as `USD`.                                                              |
| `required`    | `boolean` | The `required` attribute and the word "Required".                                                   |
| `optional`    | `boolean` | The word "Optional". Flag whichever is rarer.                                                       |
| `disabled`    | `boolean` | Dashed and tinted.                                                                                  |
| `id`          | `string`  | The input's id. Generated when left out.                                                            |

## Attributes and listeners

`inheritAttrs` is off. `class` and `style` stay on the wrapper (`div.ae-field`); everything else lands on the `<input>`: `name`, `autocomplete`, `autocapitalize`, `maxlength`, `minlength`, `pattern`, `inputmode`, `enterkeyhint`, `spellcheck`, `readonly`, `aria-*`, `data-*`, and listeners such as `@blur`, `@focus` and `@keydown`. An `aria-describedby` of your own is joined to the hint or error id.

Exposed: `input` (the element) and `focus()`.

## Rules

- Set `autocomplete` on every personal detail (`given-name`, `family-name`, `email`, `tel`, `street-address`, `postal-code`, `bday`): browsers and password managers then fill it (WCAG 1.3.5).
- Hover darkens the edge; focus turns the edge and draws a 2px outline `focus-field`. Disabled goes dashed and tinted; read-only stays focusable.
- The input and the boxed input (with `prefix` or `suffix`) are both 48px tall. A click on the padding or a unit puts the cursor in the input.
- Shared input styles live in `input.css` in this folder: `Textarea`, `NumberField`, `OtpField` and the pickers import it.
