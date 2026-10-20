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

<!-- props:start -->

| Prop         | Type                            | Default        | Notes                                                                                                     |
| ------------ | ------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`                        | `first option` | `v-model`: the active value.                                                                              |
| `label`      | `string`                        | **Required**   | Read by screen readers as the name of the group.                                                          |
| `options`    | `(string \| SegmentedOption)[]` | **Required**   | Two to five. A string is both value and label. `SegmentedOption` is `{ value, label, icon?, disabled? }`. |
| `hint`       | `string`                        | —              | Help under the control, linked with `aria-describedby`.                                                   |
| `error`      | `string`                        | —              | What to fix. Replaces the hint and is announced.                                                          |
| `optional`   | `boolean`                       | `false`        | Adds the word "Optional" to the group's accessible name; nothing is shown. Flag whichever is rarer.       |
| `disabled`   | `boolean`                       | `false`        | Disables every option.                                                                                    |
| `name`       | `string`                        | `generated`    | The name the radios share, submitted with a form.                                                         |

<!-- props:end -->

`class` and `style` land on the outer element; other attributes land on the `radiogroup` element.

## Accessibility

- A radio group: arrow keys move between options.
- `label` is the group's accessible name.
