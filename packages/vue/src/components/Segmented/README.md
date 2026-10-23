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

| Prop         | Type                            | Default        | Notes                                                                                                                        |
| ------------ | ------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`                        | `first option` | `v-model`: the active value. Left unset, the first option that can be chosen is chosen and `v-model` is told.                |
| `label`      | `string`                        | **Required**   | Read by screen readers as the name of the group.                                                                             |
| `options`    | `(string \| SegmentedOption)[]` | **Required**   | Two to five. A string is both value and label. `SegmentedOption` is `{ value, label, icon?, disabled? }`.                    |
| `hint`       | `string`                        | None           | Help under the control, linked with `aria-describedby`.                                                                      |
| `error`      | `string`                        | None           | What to fix. Replaces the hint and is announced.                                                                             |
| `optional`   | `boolean`                       | `false`        | Adds the word "Optional" to the group's accessible name and shows nothing. Use it when most fields in the form are required. |
| `disabled`   | `boolean`                       | `false`        | Disables every option.                                                                                                       |
| `name`       | `string`                        | `generated`    | The name the radios share, submitted with a form.                                                                            |

<!-- props:end -->

`class` and `style` land on the outer element. Other attributes land on the `radiogroup` element. Exposes `input` (the chosen radio, else the first) and `focus()`.

## Accessibility

- A radio group: arrow keys move between options.
- `label` is the group's accessible name.
- With no value bound it shows the first option as active and tells `v-model` so, so the model and the screen agree.

## Keyboard

| Key                     | Does                                                 |
| ----------------------- | ---------------------------------------------------- |
| Tab                     | Moves into and out of the group.                     |
| Arrow Left, Arrow Right | Moves to the previous or next option and chooses it. |

## Related

[`ERadioGroup`](../RadioGroup/README.md) for options that need descriptions, [`ETabs`](../Tabs/README.md) for switching content.
