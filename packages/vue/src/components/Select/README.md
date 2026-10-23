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

| Prop          | Type                      | Default      | Notes                                                                                                                                                                                                                                    |
| ------------- | ------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`                  | `""`         | `v-model`: the chosen option's `value`. Empty means nothing is chosen.                                                                                                                                                                   |
| `open`        | `boolean`                 | `false`      | `v-model:open`: whether the list is open. A disabled field never opens.                                                                                                                                                                  |
| `hideLabel`   | `boolean`                 | `false`      | Hides the label from the page and keeps it for screen readers.                                                                                                                                                                           |
| `ariaLabel`   | `string`                  | None         | The accessible name when `bare`.                                                                                                                                                                                                         |
| `label`       | `string`                  | None         | The visible label above the control. It also names the list. Required unless `bare` with an `ariaLabel`.                                                                                                                                 |
| `bare`        | `boolean`                 | `false`      | Renders only the control, with no label, hint or error. Needs `label` or `ariaLabel`. For dense places such as table filters.                                                                                                            |
| `options`     | `readonly EOptionInput[]` | **Required** | Strings, or `{ value, label, description?, icon?, group?, disabled? }`. A string is both value and label. `value` is never an empty string. A new `group` heading starts where `group` changes, so options of one group belong together. |
| `placeholder` | `string`                  | `"Select"`   | What the button says while nothing is chosen.                                                                                                                                                                                            |
| `hint`        | `string`                  | None         | Help that stays under the control.                                                                                                                                                                                                       |
| `error`       | `string`                  | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                                                                                              |
| `required`    | `boolean`                 | `false`      | Sets the `required` attribute and adds a word beside the label.                                                                                                                                                                          |
| `optional`    | `boolean`                 | `false`      | Adds a word beside the label. Use it when most fields in the form are required.                                                                                                                                                          |
| `disabled`    | `boolean`                 | `false`      | Disables the control, so it never opens.                                                                                                                                                                                                 |
| `name`        | `string`                  | None         | Submits the chosen value with a form (a hidden input carries it).                                                                                                                                                                        |
| `id`          | `string`                  | `generated`  | The id of the button, which the label points at.                                                                                                                                                                                         |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `button` element. Exposes `input` (the button) and `focus()`.

## Accessibility

- Enter, Space or Arrow keys open the list. Arrow keys, Home and End move, letters jump to a match, Enter or Space chooses, and Escape closes the list and returns focus.
- Provide `label`, or `bare` with `ariaLabel`. The types require one of them.

## Keyboard

| Key                      | Does                                   |
| ------------------------ | -------------------------------------- |
| Enter, Space, Arrow keys | Open the list                          |
| Arrow Up, Arrow Down     | Move through the options               |
| Home, End                | First and last option                  |
| Letters                  | Jump to the next option that starts so |
| Enter, Space             | Choose the highlighted option          |
| Escape                   | Closes the list and returns focus      |

With the list closed, letters choose the matching option without opening it.

## Related

[`ECombobox`](../Combobox/README.md) when the list needs searching, [`ERadioGroup`](../RadioGroup/README.md) for a few options.
