# ESelect

A dropdown for choosing one option from a list, when options need more than a line of text. Use `ERadioGroup` or `ESegmented` for five or fewer options and `ECombobox` for long lists.

```vue
<ESelect
  v-model="plan"
  label="Plan"
  hint="You can change it later."
  :options="[
    { value: 'basic', label: 'Basic', description: 'Free, forever' },
    { value: 'pro', label: 'Pro', description: '$12 a month', icon: 'star' },
    { value: 'team', label: 'Team', disabled: true },
  ]"
/>
```

## Props

| Prop          | Type             | Default   | Notes                                                                                                                                                                                                                              |
| ------------- | ---------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`         | `""`      | v-model: the chosen option's `value`; empty is nothing chosen.                                                                                                                                                                     |
| `open`        | `boolean`        | `false`   | v-model:open: whether the list is open. A disabled field never opens.                                                                                                                                                              |
| `label`       | `string`         |           | Required unless `bare`. Also names the list.                                                                                                                                                                                       |
| `options`     | `EOptionInput[]` |           | Required. Strings, or `{ value, label, description?, icon?, group?, disabled? }`. A string is both value and label; `value` is never an empty string. A new `group` heading starts where `group` changes, so keep groups together. |
| `placeholder` | `string`         | `Select`  | Shown while nothing is chosen.                                                                                                                                                                                                     |
| `hideLabel`   | `boolean`        |           | Keeps the label for screen readers only.                                                                                                                                                                                           |
| `hint`        | `string`         |           | Help under the control.                                                                                                                                                                                                            |
| `error`       | `string`         |           | Replaces the hint and marks the control invalid.                                                                                                                                                                                   |
| `required`    | `boolean`        |           | The `required` attribute and the word "Required".                                                                                                                                                                                  |
| `optional`    | `boolean`        |           | The word "Optional".                                                                                                                                                                                                               |
| `disabled`    | `boolean`        |           | Never opens.                                                                                                                                                                                                                       |
| `name`        | `string`         |           | Submits the value with a form.                                                                                                                                                                                                     |
| `bare`        | `boolean`        |           | Control only, no label, hint or error; set `ariaLabel`.                                                                                                                                                                            |
| `ariaLabel`   | `string`         |           | The accessible name when `bare`.                                                                                                                                                                                                   |
| `id`          | `string`         | generated | The button's id.                                                                                                                                                                                                                   |

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `button` element.

## Accessibility

- Enter, Space or Arrow keys open the list; Arrow keys, Home and End move, letters jump to a match, Enter or Space chooses, Escape closes and returns focus.
- Provide `label`, or `ariaLabel` with `bare`.
