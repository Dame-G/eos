# ECheckboxGroup

Any number of several related options, checked into an array. Use [`ECheckbox`](../Checkbox/README.md) for a single yes or no, [`ERadioGroup`](../RadioGroup/README.md) to choose exactly one.

```vue
<ECheckboxGroup
  v-model="channels"
  label="How should we reach you?"
  :options="['Email', 'Text', { value: 'post', label: 'Post', description: 'Statements only.' }]"
/>
```

## Props

<!-- props:start -->

| Prop          | Type                         | Default      | Notes                                                                                                                       |
| ------------- | ---------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `T[]`                        | `[]`         | `v-model`: the values that are checked, in the order they were chosen.                                                      |
| `label`       | `string`                     | **Required** | The question, as the group's legend.                                                                                        |
| `hideLabel`   | `boolean`                    | `false`      | Keeps the legend for screen readers and hides it from the page.                                                             |
| `options`     | `(T \| CheckboxOption<T>)[]` | **Required** | A string is both value and label. `CheckboxOption`: `{ value, label, description?, disabled? }`.                            |
| `hint`        | `string`                     | None         | Help that is announced with the group.                                                                                      |
| `error`       | `string`                     | None         | What to fix. Replaces the hint, marks every box invalid and is announced with the group.                                    |
| `required`    | `boolean`                    | `false`      | Adds the word "Required" beside the legend. The group does not validate itself: the form decides how many boxes are enough. |
| `optional`    | `boolean`                    | `false`      | Adds the word "Optional" beside the legend. Use it when most fields in the form are required.                               |
| `disabled`    | `boolean`                    | `false`      | Disables every box.                                                                                                         |
| `readonly`    | `boolean`                    | `false`      | Shows the choices but blocks changing them. The boxes stay focusable and the values are still submitted.                    |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Lays the boxes out in a row that wraps, or one under another.                                                               |
| `name`        | `string`                     | None         | Shared by the boxes, submitted with a form: one entry per checked box.                                                      |

<!-- props:end -->

`class`, `style`, attributes and listeners land on the `fieldset` element. Exposes `input` (the first checkbox) and `focus()`.

## Accessibility

- A `fieldset` whose legend, hint and error are announced with the group. Each box keeps its own label and description.
- `error` marks every box `aria-invalid`.
- `required` only adds the word beside the legend: the group cannot know how many boxes are enough, so the form validates it.
- The model is empty (`[]`) when nothing is checked.

## Keyboard

| Key   | Does                                              |
| ----- | ------------------------------------------------- |
| Tab   | Moves to the next box. A disabled box is skipped. |
| Space | Checks or unchecks the focused box.               |

## Related

[`ECheckbox`](../Checkbox/README.md) for a single choice, [`ERadioGroup`](../RadioGroup/README.md) to choose one of several, [`ESelect`](../Select/README.md) when the list is long.
