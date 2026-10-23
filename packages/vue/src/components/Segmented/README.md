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

| Prop         | Type                          | Default        | Notes                                                                                                                                               |
| ------------ | ----------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `T`                           | `first option` | `v-model`: the active value. Left unset, the first option that can be chosen is shown as active and `v-model` is not told until the person chooses. |
| `label`      | `string`                      | **Required**   | Read by screen readers as the name of the group.                                                                                                    |
| `options`    | `(T \| SegmentedOption<T>)[]` | **Required**   | Two to five. A string is both value and label. `SegmentedOption` is `{ value, label, icon?, disabled? }`.                                           |
| `hint`       | `string`                      | None           | Help under the control, linked with `aria-describedby`.                                                                                             |
| `error`      | `string`                      | None           | What to fix. Replaces the hint and is announced.                                                                                                    |
| `optional`   | `boolean`                     | `false`        | Adds the word "Optional" to the group's accessible name and shows nothing. Use it when most fields in the form are required.                        |
| `required`   | `boolean`                     | `false`        | Marks the group `aria-required` and adds the word "Required" to its accessible name.                                                                |
| `disabled`   | `boolean`                     | `false`        | Disables every option.                                                                                                                              |
| `readonly`   | `boolean`                     | `false`        | Shows the choice but blocks changing it. The options stay focusable and the value is still submitted.                                               |
| `name`       | `string`                      | `generated`    | The name the radios share, submitted with a form.                                                                                                   |

<!-- props:end -->

`class` and `style` land on the outer element, which also holds the hint or error. Other attributes land on the `radiogroup` element; `@focus` and `@blur` fire as focus enters and leaves it. Exposes `input` (the chosen radio, else the first) and `focus()`.

## Accessibility

- A radio group: arrow keys move between options.
- `label` is the group's accessible name.
- With no value bound it shows the first option as active but does not tell `v-model`, so a form is not dirtied. The model stays empty until the person chooses. A bound value must be one of the options.

## Keyboard

| Key                     | Does                                                 |
| ----------------------- | ---------------------------------------------------- |
| Tab                     | Moves into and out of the group.                     |
| Arrow Left, Arrow Right | Moves to the previous or next option and chooses it. |

## Related

[`ERadioGroup`](../RadioGroup/README.md) for options that need descriptions, [`ETabs`](../Tabs/README.md) for switching content.
