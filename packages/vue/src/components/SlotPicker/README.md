# ESlotPicker

The times a person can choose for a visit, shown as a grid of 48px options. It is a radio group in a bare `EFieldset`, so arrow keys work and the group, hint and error are announced together.

```vue
<ESlotPicker
  v-model="time"
  label="Tuesday, October 22"
  :slots="['9:00 am', '9:30 am', { value: '10:00', label: '10:00 am', disabled: true }]"
/>
```

## Props

| Prop        | Type                       | Notes                                                                            |
| ----------- | -------------------------- | -------------------------------------------------------------------------------- |
| `v-model`   | `string \| null`           | The chosen value, `null` when none. Leave it off for local state.                |
| `label`     | `string`                   | Required. The question the times answer, usually the day. Names the group.       |
| `slots`     | `(string \| SlotOption)[]` | `SlotOption` is `{ value, label, disabled? }`. A string is both value and label. |
| `emptyText` | `string`                   | Shown when there are no times. Default "No times are open on this day."          |
| `hint`      | `string`                   | Announced with the group.                                                        |
| `error`     | `string`                   | Replaces the hint, announced.                                                    |
| `required`  | `boolean`                  | The `required` attribute and the word "Required".                                |
| `disabled`  | `boolean`                  | Disables every time.                                                             |
| `name`      | `string`                   | Shared by the radios, submitted with a form. Generated when left out.            |

`class`, `style` and other attributes land on the `<fieldset>`.

## Rules

- The chosen time is filled with `primary` and bold; a taken time is dashed and struck through. Neither relies on colour.
- The grid adds columns as space allows (`minmax(6.5rem, 1fr)`). Put it under a Calendar or beside it.
- Export: `SlotOption` type.
