# ESegmented

A joined set of two to five options where exactly one is active. Use it to change how a list is filtered or shown, not to switch content: that is [`ETabs`](../Tabs/README.md).

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

| Prop         | Type                                   | Default        | Notes                                                                                                                                                                                              |
| ------------ | -------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `T`                                    | `first option` | `v-model`: the active value. Left unset, the first option that can be chosen is shown as active, but no radio is checked: `v-model` is not told and a form posts nothing until the person chooses. |
| `label`      | `string`                               | **Required**   | The name of the group, shown above the control as a field's label, with the Required or Optional word beside it.                                                                                   |
| `hideLabel`  | `boolean`                              | `false`        | Keeps the label for screen readers only, where the context already names the control (a view switch in a toolbar).                                                                                 |
| `options`    | `readonly (T \| SegmentedOption<T>)[]` | **Required**   | Two to five. A string is both value and label. `SegmentedOption` is `{ value, label, icon?, disabled? }`.                                                                                          |
| `size`       | `"sm" \| "md" \| "lg"`                 | `"md"`         | The height: `sm` is a compact control for a toolbar, with smaller text; `lg` is a step over the control height.                                                                                    |
| `id`         | `string`                               | `generated`    | The id of the group. The options are `{id}-0`, `{id}-1` and so on.                                                                                                                                 |
| `hint`       | `string`                               | None           | Help under the control, linked with `aria-describedby`.                                                                                                                                            |
| `error`      | `string`                               | None           | What to fix. Replaces the hint and is announced.                                                                                                                                                   |
| `optional`   | `boolean`                              | `false`        | Adds the word "Optional" to the group's accessible name and to the label. Use it when most fields in the form are required.                                                                        |
| `required`   | `boolean`                              | `false`        | Marks the group `aria-required` and adds the word "Required" to its accessible name and to the label.                                                                                              |
| `disabled`   | `boolean`                              | `false`        | Disables every option.                                                                                                                                                                             |
| `readonly`   | `boolean`                              | `false`        | Shows the choice but blocks changing it. The options stay focusable and the value is still submitted.                                                                                              |
| `name`       | `string`                               | `generated`    | The name the radios share, submitted with a form.                                                                                                                                                  |

`T` is a type parameter, inferred from the props you pass. It extends `string` (default `string`).

<!-- props:end -->

`class` and `style` land on the outer element, which also holds the hint or error. Other attributes land on the `radiogroup` element; `@focus` and `@blur` fire as focus enters and leaves it. Exposes `input` (the chosen radio, else the first) and `focus()`.

## Accessibility

- A radio group: arrow keys move between options.
- `label` shows above the control and names the group, with the Required or Optional word. With `hideLabel` it is the group's `aria-label` instead.
- With no value bound it shows the first option that can be chosen as active, but checks no radio: `v-model` is not told, a form posts nothing and a `required` group fails its check until the person chooses. A bound value must be one of the options.

## Keyboard

| Key                     | Action                                               |
| ----------------------- | ---------------------------------------------------- |
| Tab                     | Moves into and out of the group.                     |
| Arrow Left, Arrow Right | Moves to the previous or next option and chooses it. |

## Related

[`ERadioGroup`](../RadioGroup/README.md) for options that need descriptions.
