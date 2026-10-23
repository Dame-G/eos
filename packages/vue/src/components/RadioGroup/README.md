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

| Prop         | Type                        | Default      | Notes                                                                                                        |
| ------------ | --------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| `modelValue` | `string`                    | None         | `v-model`: the chosen value.                                                                                 |
| `label`      | `string`                    | **Required** | The question, as the group's legend.                                                                         |
| `hideLabel`  | `boolean`                   | `false`      | Keeps the legend for screen readers and hides it from the page.                                              |
| `options`    | `(string \| RadioOption)[]` | **Required** | Five or fewer. A string is both value and label. `RadioOption`: `{ value, label, description?, disabled? }`. |
| `hint`       | `string`                    | None         | Help that is announced with the group.                                                                       |
| `error`      | `string`                    | None         | What to fix. Replaces the hint and is announced with the group.                                              |
| `required`   | `boolean`                   | `false`      | Sets `required` on the radios and adds a word beside the legend.                                             |
| `optional`   | `boolean`                   | `false`      | Adds a word beside the legend. Use it when most fields in the form are required.                             |
| `disabled`   | `boolean`                   | `false`      | Disables every option.                                                                                       |
| `name`       | `string`                    | `generated`  | Shared by the radios, submitted with a form.                                                                 |

<!-- props:end -->

`class`, `style`, attributes and listeners land on the `fieldset` element. Exposes `input` (the chosen radio, else the first) and `focus()`.

## Slots

| Slot     | Use                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `reveal` | Receives `{ option }`. A control shown under the chosen option. An option with no content here shows no extra control. |

## Accessibility

- A `fieldset` whose legend, hint and error are announced with the group.
- Native radios sharing one `name`: arrow keys move between options.

## Keyboard

| Key                  | Does                                                       |
| -------------------- | ---------------------------------------------------------- |
| Tab                  | Moves into the group (to the chosen option) and out of it. |
| Arrow Up, Arrow Down | Moves to the previous or next option and chooses it.       |
| Space                | Chooses the focused option.                                |

## Related

[`ESegmented`](../Segmented/README.md) for two to five short options as a switch, [`ESelect`](../Select/README.md) for more, [`ECheckbox`](../Checkbox/README.md) for several at once.
