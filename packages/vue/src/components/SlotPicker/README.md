# ESlotPicker

A grid of selectable times for a visit, as a radio group.

```vue
<ESlotPicker
  v-model="time"
  label="Tuesday, October 22"
  :options="['9:00 am', '9:30 am', { value: '10:00', label: '10:00 am', disabled: true }]"
/>
```

## Props

| Prop         | Type                       | Default                          | Notes                                                                                                      |
| ------------ | -------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `modelValue` | `string \| null`           | `null`                           | v-model: the chosen value.                                                                                 |
| `label`      | `string`                   |                                  | Required. The question the times answer, usually the day; names the group.                                 |
| `options`    | `(string \| SlotOption)[]` |                                  | Required. `SlotOption` is `{ value, label, disabled? }`; a string is both. A disabled time is a taken one. |
| `emptyText`  | `string`                   | `No times are open on this day.` | Shown when there are no times.                                                                             |
| `hint`       | `string`                   |                                  | Announced with the group.                                                                                  |
| `error`      | `string`                   |                                  | Replaces the hint, announced.                                                                              |
| `required`   | `boolean`                  |                                  | The `required` attribute and the word "Required".                                                          |
| `optional`   | `boolean`                  |                                  | The word "Optional". Flag whichever is rarer.                                                              |
| `disabled`   | `boolean`                  |                                  | Disables every time.                                                                                       |
| `name`       | `string`                   | generated                        | Shared by the radios; submitted with a form.                                                               |

`class`, `style` and attributes land on the `fieldset` element. The `SlotOption` type is exported.

## Accessibility

- A radio group: arrow keys move between times; the group, hint and error are announced together.
