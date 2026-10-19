# ESegmented

A joined set of two to five options where exactly one is active. Use it to change how a list is filtered or shown, not to switch content.

```vue
<ESegmented
  v-model="view"
  label="View"
  :options="[
    { value: 'list', label: 'List', icon: 'menu' },
    { value: 'grid', label: 'Grid' },
  ]"
  hint="Remembered on this device."
/>
```

## Props

| Prop         | Type                            | Default      | Notes                                                                                                  |
| ------------ | ------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `modelValue` | `string`                        | first option | v-model: the active value.                                                                             |
| `label`      | `string`                        |              | Required. Names the group.                                                                             |
| `options`    | `(string \| SegmentedOption)[]` |              | Required. `SegmentedOption` is `{ value, label, icon?, disabled? }`; a string is both value and label. |
| `hint`       | `string`                        |              | Under the control.                                                                                     |
| `error`      | `string`                        |              | Replaces the hint, announced.                                                                          |
| `disabled`   | `boolean`                       |              | Disables every option.                                                                                 |
| `name`       | `string`                        | generated    | Shared by the radios; submitted with a form.                                                           |

`class` and `style` land on the outer element; other attributes land on the `radiogroup` element.

## Accessibility

- A radio group: arrow keys move between options.
- `label` is the group's accessible name.
