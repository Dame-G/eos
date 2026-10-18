# AeCheckbox

A single yes/no choice. A setting that takes effect immediately is an `AeSwitch`.

```vue
<AeCheckbox v-model="agree" label="I agree to the terms" description="You can change this later." />
<AeCheckbox v-model="agree" label="I agree" :error="agree ? undefined : 'You must agree'" />
```

## Props

| Prop            | Type      | Notes                                                                                  |
| --------------- | --------- | -------------------------------------------------------------------------------------- |
| `v-model`       | `boolean` | Checked or not. Leave it off for local state.                                          |
| `label`         | `string`  | Required.                                                                              |
| `description`   | `string`  | A line of detail under the label.                                                      |
| `indeterminate` | `boolean` | The mixed state, such as select-all with some rows chosen.                             |
| `bare`          | `boolean` | Hides the label visually but keeps it for screen readers, for a table cell.            |
| `error`         | `string`  | Shown under the row, linked with `aria-describedby`, with `aria-invalid` on the input. |
| `disabled`      | `boolean` |                                                                                        |
| `required`      | `boolean` | The `required` attribute.                                                              |
| `name`, `value` | `string`  | Submitted with a form.                                                                 |
| `id`            | `string`  | Generated when left out.                                                               |

`class` and `style` stay on the row (or on `div.ae-choice-wrap` when there is an error); every other attribute and listener lands on the `<input>`. Exposed: `input` and `focus()`.

## Rules

- The whole 48px row is the target. Checked is a `primary` fill with a white tick; unchecked has a `border-strong` edge.
- With an error the row is wrapped in `.ae-choice-wrap` and the message sits 8px under the box.
- The `bare` variant has no error text: show the problem elsewhere.
- Shared choice styles (checkbox, radio) live in `choice.css` in this folder; `AeRadioGroup` and `AeSwitch` import it.
