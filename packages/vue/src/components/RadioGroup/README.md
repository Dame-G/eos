# ERadioGroup

Exactly one of five or fewer options. Use [`ESelect`](../Select/README.md) for more.

```vue
<ERadioGroup
  v-model="amount"
  label="How much would you like to pay?"
  :options="[
    { value: 'full', label: 'Pay in full', description: '$162.40' },
    { value: 'part', label: 'Another amount' },
  ]"
>
  <template #reveal="{ option }">
    <ETextField v-if="option.value === 'part'" v-model="other" label="Amount" prefix="$" hide-label />
  </template>
</ERadioGroup>
```

## Props

<!-- props:start -->

| Prop          | Type                         | Default      | Notes                                                                                                             |
| ------------- | ---------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `T`                          | None         | `v-model`: the chosen value.                                                                                      |
| `hideLabel`   | `boolean`                    | `false`      | Hides the label from the page and keeps it for screen readers.                                                    |
| `hint`        | `string`                     | None         | Help that stays under the control.                                                                                |
| `error`       | `string`                     | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                       |
| `optional`    | `boolean`                    | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                          |
| `disabled`    | `boolean`                    | `false`      | Disables the control. A disabled control posts nothing.                                                           |
| `readonly`    | `boolean`                    | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.        |
| `label`       | `string`                     | **Required** | The question, as the group's legend.                                                                              |
| `options`     | `(T \| RadioOption<T>)[]`    | **Required** | Five or fewer. A string is both value and label. `RadioOption`: `{ value, label, description?, disabled? }`.      |
| `required`    | `boolean`                    | `false`      | Sets `required` on the radios and adds a word beside the legend.                                                  |
| `name`        | `string`                     | `generated`  | Shared by the radios, submitted with a form.                                                                      |
| `id`          | `string`                     | `generated`  | The id of the group's `fieldset`, which an `EForm` summary links to. The radios are `{id}-1`, `{id}-2` and so on. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Lays the options out in a row that wraps, or one under another.                                                   |

<!-- props:end -->

`class`, `style`, attributes and listeners land on the `fieldset` element. Exposes `input` (the chosen radio, else the first) and `focus()`. `id` is the fieldset's, and the radios are `{id}-1`, `{id}-2` and so on. `orientation="horizontal"` puts the options in a row that wraps; a revealed control takes a line under them.

## Slots

| Slot     | Use                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `reveal` | Receives `{ option }`. A control shown under the chosen option. An option with no content here shows no extra control. |

## Accessibility

- A `fieldset` whose legend, hint and error are announced with the group. An option's `description` describes its radio (`aria-describedby`) and stays out of its name.
- Inside an [`EForm`](../Form/README.md) an empty required group, or one with an `error`, is listed once in the summary by the group's label.
- `readonly` sets `aria-readonly` on the group, keeps the radios focusable and blocks changing the choice. Empty is `""`.
- Native radios sharing one `name`: arrow keys move between options.

## Keyboard

| Key                  | Does                                                       |
| -------------------- | ---------------------------------------------------------- |
| Tab                  | Moves into the group (to the chosen option) and out of it. |
| Arrow Up, Arrow Down | Moves to the previous or next option and chooses it.       |
| Space                | Chooses the focused option.                                |

## Related

[`ESegmented`](../Segmented/README.md) for two to five short options as a switch, [`ESelect`](../Select/README.md) for more, [`ECheckbox`](../Checkbox/README.md) for several at once.
