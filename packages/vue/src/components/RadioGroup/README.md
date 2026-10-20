# ERadioGroup

Exactly one of five or fewer options. Use `ESelect` for more.

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

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string` | — | `v-model`: the chosen value. |
| `label` | `string` | **Required** | The question, as the group's legend. |
| `hideLabel` | `boolean` | `false` | Keep the legend for screen readers and remove it from the page. |
| `options` | `(string \| RadioOption)[]` | **Required** | Five or fewer. A string is both value and label. `RadioOption`: `{ value, label, description?, disabled? }`. |
| `hint` | `string` | — | Help that is announced with the group. |
| `error` | `string` | — | What to fix. Replaces the hint and is announced with the group. |
| `required` | `boolean` | `false` | A word beside the legend, and `required` on the radios. |
| `optional` | `boolean` | `false` | A word beside the legend. Flag whichever is rarer. |
| `disabled` | `boolean` | `false` | Disables every option. |
| `name` | `string` | `generated` | Shared by the radios, submitted with a form. |

<!-- props:end -->

`class`, `style`, attributes and listeners land on the `fieldset` element.

## Slots

| Slot     | Use                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------- |
| `reveal` | Receives `{ option }`; a control shown under the chosen option. Render nothing for options without one. |

## Accessibility

- A `fieldset` whose legend, hint and error are announced with the group.
- Native radios sharing one `name`: arrow keys move between options.
