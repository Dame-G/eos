# ESelect

A dropdown for choosing one option from a list, when options need more than a line of text. Use [`ERadioGroup`](../RadioGroup/README.md) or [`ESegmented`](../Segmented/README.md) for five or fewer options and [`ECombobox`](../Combobox/README.md) for long lists.

```vue
<ESelect
  v-model="plan"
  label="Plan"
  hint="You can change it later."
  :options="[
    { value: 'basic', label: 'Basic', description: 'Free, forever' },
    { value: 'pro', label: 'Pro', description: '$12 a month', icon: 'info' },
    { value: 'team', label: 'Team', disabled: true },
  ]"
/>
```

## Props

<!-- props:start -->

| Prop          | Type                      | Default      | Notes                                                                                                                                                                                                                    |
| ------------- | ------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelValue`  | `string`                  | `""`         | `v-model`: the chosen option's `value`; empty is nothing chosen.                                                                                                                                                         |
| `open`        | `boolean`                 | `false`      | `v-model:open`: whether the list is open. A disabled field never opens.                                                                                                                                                  |
| `hideLabel`   | `boolean`                 | `false`      | Keep the label for screen readers and remove it from the page.                                                                                                                                                           |
| `ariaLabel`   | `string`                  | —            | The accessible name when `bare`.                                                                                                                                                                                         |
| `label`       | `string`                  | —            | The visible label, a mono kicker above the control. It also names the list. Required unless `bare` with an `ariaLabel`.                                                                                                  |
| `bare`        | `boolean`                 | `false`      | Only the control, no label, hint or error. Give it `label` or `ariaLabel`. For dense places such as table filters.                                                                                                       |
| `options`     | `readonly EOptionInput[]` | **Required** | Strings, or `{ value, label, description?, icon?, group?, disabled? }`. A string is both value and label; `value` is never an empty string. A new `group` heading starts where `group` changes, so keep groups together. |
| `placeholder` | `string`                  | `"Select"`   | What the button says while nothing is chosen.                                                                                                                                                                            |
| `hint`        | `string`                  | —            | Help that stays under the control.                                                                                                                                                                                       |
| `error`       | `string`                  | —            | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                                                                              |
| `required`    | `boolean`                 | `false`      | The `required` attribute and a word beside the label.                                                                                                                                                                    |
| `optional`    | `boolean`                 | `false`      | A word beside the label. Flag whichever is rarer.                                                                                                                                                                        |
| `disabled`    | `boolean`                 | `false`      | Never opens.                                                                                                                                                                                                             |
| `name`        | `string`                  | —            | Submits the chosen value with a form (a hidden input carries it).                                                                                                                                                        |
| `id`          | `string`                  | `generated`  | The id of the button; the label points at it.                                                                                                                                                                            |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes and listeners land on the `button` element. Exposes `input` (the button) and `focus()`.

## Accessibility

- Enter, Space or Arrow keys open the list; Arrow keys, Home and End move, letters jump to a match, Enter or Space chooses, Escape closes and returns focus.
- Provide `label`, or `bare` with `ariaLabel`; the types require one of them.
