# ETextField

A labelled single-line text input with hint, error and optional unit.

```vue
<ETextField v-model="email" label="Email" type="email" required autocomplete="email" hint="We send receipts here." />
<ETextField v-model="bio" label="Bio" :maxlength="160" counter clearable />
<ETextField v-model="city" label="City" :loading="searching" size="lg" />
<ETextField v-model="amount" label="Payment amount" prefix="$" suffix="USD" inputmode="decimal" />
```

## Props

<!-- props:start -->

| Prop           | Type                   | Default      | Notes                                                                                                                                                             |
| -------------- | ---------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`   | `string`               | `""`         | `v-model`: the text.                                                                                                                                              |
| `hideLabel`    | `boolean`              | `false`      | Hides the label from the page and keeps it for screen readers.                                                                                                    |
| `hint`         | `string`               | None         | Help that stays under the control.                                                                                                                                |
| `error`        | `string`               | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                       |
| `required`     | `boolean`              | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                                                                              |
| `optional`     | `boolean`              | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                          |
| `disabled`     | `boolean`              | `false`      | Disables the control. A disabled control posts nothing.                                                                                                           |
| `readonly`     | `boolean`              | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                                                        |
| `id`           | `string`               | `generated`  | The id of the control. The label points at it.                                                                                                                    |
| `size`         | `"sm" \| "md" \| "lg"` | `"md"`       | The height of the box: `sm` and `lg` are a step under and over the control height.                                                                                |
| `loading`      | `boolean`              | `false`      | Shows a spinner at the end of the box and sets `aria-busy`, while options or a check load. The field stays editable.                                              |
| `label`        | `string`               | **Required** | The visible label above the input. A placeholder never replaces it.                                                                                               |
| `placeholder`  | `string`               | None         | An example, never the label.                                                                                                                                      |
| `type`         | `string`               | `"text"`     | The input type.                                                                                                                                                   |
| `prefix`       | `string`               | None         | A unit before the value, such as `$`. Read as part of the input's description.                                                                                    |
| `suffix`       | `string`               | None         | A unit after the value, such as `USD`. Read as part of the input's description.                                                                                   |
| `name`         | `string`               | None         | The name submitted with a form.                                                                                                                                   |
| `submitValue`  | `string`               | None         | Posts this under `name` instead of the text in the input, for an input that shows a formatted number and posts the plain one. The input itself is then not named. |
| `autocomplete` | `string`               | None         | What the browser may fill in (`email`, `given-name`, `off`). Set it on every personal detail (WCAG 1.3.5).                                                        |
| `maxlength`    | `number`               | None         | The most characters the input takes.                                                                                                                              |
| `counter`      | `boolean`              | `false`      | Shows how many characters there are, out of `maxlength` when it is set.                                                                                           |
| `clearable`    | `boolean`              | `false`      | Shows a button that empties the input while it has text.                                                                                                          |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners (`inputmode`, `form`, `aria-*`, `@blur`) land on the `input` element. A box is drawn around the input only when there is a `prefix`, `suffix`, clear button or spinner to put beside it. `size` sets the box height one step under or over the control height. Exposes `input` and `focus()`.

`name` posts the text. A disabled field posts nothing. `submitValue` posts a different value under `name` through a hidden input, for an input that shows a formatted number and posts the plain one.

Inside an [`EForm`](../Form/README.md) the field adds its `error` to the form's summary.

## Accessibility

- Set `autocomplete` on every personal detail (`given-name`, `email`, `tel`, `postal-code`) so browsers can fill it (WCAG 1.3.5).
- `prefix` and `suffix` are part of the input's description, so a screen reader hears "$" or "USD" after the label.
- An `aria-describedby` of your own is joined to the hint or error id.
- `counter` is read as part of the input's description, not announced on every key. `loading` sets `aria-busy` on the input.
- The clear button is named "Clear", keeps focus in the input after it empties it, and is left out while the field is disabled or readonly.

## Keyboard

Native text input keys. A click on the padding or a unit puts the cursor in the input.

## Related

[`ETextarea`](../Textarea/README.md) for several lines, [`ENumberField`](../NumberField/README.md) for amounts, [`ESearchBar`](../SearchBar/README.md) for searching.
