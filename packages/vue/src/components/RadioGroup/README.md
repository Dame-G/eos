# AeRadioGroup

Exactly one of five or fewer options. It is a bare `AeFieldset`: the legend, hint and error are announced with the group. Arrow keys move between options (native radios sharing one `name`).

```vue
<AeRadioGroup
  v-model="amount"
  label="How much would you like to pay?"
  :options="[
    { value: 'full', label: 'Pay in full', description: '$162.40' },
    { value: 'part', label: 'Another amount' },
  ]"
>
  <template #reveal="{ option }">
    <AeTextField v-if="option.value === 'part'" v-model="other" label="Amount" prefix="$" hide-label />
  </template>
</AeRadioGroup>
```

## Props

| Prop       | Type                        | Notes                                                                                           |
| ---------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| `v-model`  | `string`                    | The chosen value. Leave it off for local state.                                                 |
| `label`    | `string`                    | Required. The legend.                                                                           |
| `options`  | `(string \| RadioOption)[]` | A string is both value and label. `RadioOption` is `{ value, label, description?, disabled? }`. |
| `hint`     | `string`                    | Announced with the group.                                                                       |
| `error`    | `string`                    | Replaces the hint, announced.                                                                   |
| `required` | `boolean`                   | The word "Required" and `required` on the radios.                                               |
| `optional` | `boolean`                   | The word "Optional".                                                                            |
| `disabled` | `boolean`                   | Disables every option.                                                                          |
| `name`     | `string`                    | Shared by the radios, submitted with a form. Generated when left out.                           |

Other attributes and listeners (`class`, `style`, `@change`, `data-*`) land on the `<fieldset>`.

## Slots

| Slot     | Props        | Notes                                                                                                                                                                          |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `reveal` | `{ option }` | A control shown under its option while that option is chosen. It is called for the chosen option only; render nothing for an option that has none and the option stays closed. |

The slot replaces the reference's per-option `reveal` node. The chosen option gets `.ae-choice--open` and the content sits in `.ae-choice-reveal`, which spans the full width of the group, 4px under the option.

## Rules

- Five or fewer options. More is a select.
- The hint and error sit 8px under the last radio.
- Export: `RadioOption` type.
