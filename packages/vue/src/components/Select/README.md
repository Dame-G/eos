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

| Prop          | Type                         | Default      | Notes                                                                                                                                                                                                                                    |
| ------------- | ---------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `T \| "" \| T[]`             | None         | `v-model`: the chosen option's `value`, or an empty string for nothing. With `multiple` it is the array of chosen values, in the order chosen, and `[]` for nothing.                                                                     |
| `open`        | `boolean`                    | `false`      | `v-model:open`: whether the list is open. A disabled or read-only field never opens.                                                                                                                                                     |
| `hideLabel`   | `boolean`                    | `false`      | Hides the label from the page and keeps it for screen readers.                                                                                                                                                                           |
| `ariaLabel`   | `string`                     | None         | The accessible name when `bare`.                                                                                                                                                                                                         |
| `label`       | `string`                     | None         | The visible label above the control. It also names the list. Required unless `bare` with an `ariaLabel`.                                                                                                                                 |
| `bare`        | `boolean`                    | `false`      | Renders only the control, with no label, hint or error. Needs `label` or `ariaLabel`. For dense places such as table filters.                                                                                                            |
| `hint`        | `string`                     | None         | Help that stays under the control.                                                                                                                                                                                                       |
| `error`       | `string`                     | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                                                                                              |
| `required`    | `boolean`                    | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                                                                                                                                                     |
| `optional`    | `boolean`                    | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                                                                                                 |
| `disabled`    | `boolean`                    | `false`      | Disables the control. A disabled control posts nothing.                                                                                                                                                                                  |
| `readonly`    | `boolean`                    | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                                                                                                                               |
| `id`          | `string`                     | `generated`  | The id of the control. The label points at it.                                                                                                                                                                                           |
| `size`        | `"sm" \| "md" \| "lg"`       | `"md"`       | The height of the box: `sm` and `lg` are a step under and over the control height.                                                                                                                                                       |
| `options`     | `readonly EOptionInput<T>[]` | **Required** | Strings, or `{ value, label, description?, icon?, group?, disabled? }`. A string is both value and label. `value` is never an empty string. A new `group` heading starts where `group` changes, so options of one group belong together. |
| `placeholder` | `string`                     | `"Select"`   | What the button says while nothing is chosen.                                                                                                                                                                                            |
| `multiple`    | `boolean`                    | `false`      | Lets people choose several options. `v-model` is then an array, the list stays open while choosing, the button says how many are chosen and `name` submits one hidden input per value.                                                   |
| `clearable`   | `boolean`                    | `false`      | Shows a clear button while something is chosen.                                                                                                                                                                                          |
| `loading`     | `boolean`                    | `false`      | Shows a spinner in place of the arrow and sets `aria-busy`, while options load. The list stays usable.                                                                                                                                   |
| `name`        | `string`                     | None         | Submits the chosen value with a form (a hidden input carries it). Posts nothing while disabled.                                                                                                                                          |

`T` is a type parameter, inferred from the props you pass. It extends `string` (default `string`).

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on the `button` element. Exposes `input` (the button) and `focus()`.

## Accessibility

- `readonly` keeps the button focusable (`aria-readonly`) but it never opens and typing does not choose; the value is still submitted. `disabled` posts nothing.
- `multiple` keeps the list open while choosing and the button reads "N selected". The model is then an array.
- Empty is `""` for a single select and `[]` with `multiple`. A date or number control uses `null` instead.
- `loading` sets `aria-busy`. `clearable` adds a Clear button next to the arrow.
- Provide `label`, or `bare` with `ariaLabel`. The types require one of them.

## Keyboard

| Key                      | Action                                           |
| ------------------------ | ------------------------------------------------ |
| Enter, Space, Arrow keys | Opens the list.                                  |
| Arrow Up, Arrow Down     | Moves through the options.                       |
| Home, End                | Moves to the first or last option.               |
| Letters                  | Moves to the next option that starts with them.  |
| Enter, Space             | Chooses the highlighted option.                  |
| Escape                   | Closes the list and returns focus to the button. |

With the list closed, letters choose the matching option without opening it.

## Related

[`ECombobox`](../Combobox/README.md) when the list needs searching, [`ERadioGroup`](../RadioGroup/README.md) for a few options.
