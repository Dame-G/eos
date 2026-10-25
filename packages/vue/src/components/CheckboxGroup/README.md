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

| Prop          | Type                                | Default      | Notes                                                                                                                       |
| ------------- | ----------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `T[]`                               | `[]`         | `v-model`: the values that are checked, in the order they were chosen.                                                      |
| `hideLabel`   | `boolean`                           | `false`      | Hides the label from the page and keeps it for screen readers.                                                              |
| `hint`        | `string`                            | None         | Help that stays under the control.                                                                                          |
| `optional`    | `boolean`                           | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                    |
| `disabled`    | `boolean`                           | `false`      | Disables the control. A disabled control posts nothing.                                                                     |
| `readonly`    | `boolean`                           | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                  |
| `label`       | `string`                            | **Required** | The question, as the group's legend.                                                                                        |
| `options`     | `readonly (T \| ChoiceOption<T>)[]` | **Required** | A string is both value and label. `ChoiceOption`: `{ value, label, description?, disabled? }`.                              |
| `error`       | `string`                            | None         | What to fix. Replaces the hint, marks every box invalid and is announced with the group.                                    |
| `required`    | `boolean`                           | `false`      | Adds the word "Required" beside the legend. The group does not validate itself: the form decides how many boxes are enough. |
| `name`        | `string`                            | None         | Shared by the boxes, submitted with a form: one entry per checked box.                                                      |
| `id`          | `string`                            | `generated`  | The id of the group's `fieldset`, which an `EForm` summary links to. The boxes are `{id}-1`, `{id}-2` and so on.            |
| `orientation` | `"vertical" \| "horizontal"`        | `"vertical"` | Lays the options out in a row that wraps, or one under another.                                                             |

`T` is a type parameter, inferred from the props you pass. It extends `string` (default `string`).

<!-- props:end -->

`class`, `style`, attributes and listeners land on the `fieldset` element. Exposes `input` (the first checkbox) and `focus()`. `id` is the fieldset's, and the boxes are `{id}-1`, `{id}-2` and so on.

## Accessibility

- A `fieldset` whose legend, hint and error are announced with the group. Each box keeps its own label and description.
- `error` marks every box `aria-invalid`.
- `required` only adds the word beside the legend: the group cannot know how many boxes are enough, so the form validates it.
- The model is empty (`[]`) when nothing is checked.

## Keyboard

| Key   | Action                                            |
| ----- | ------------------------------------------------- |
| Tab   | Moves to the next box. A disabled box is skipped. |
| Space | Checks or unchecks the focused box.               |

## Related

[`ESelect`](../Select/README.md) when the list is long.
