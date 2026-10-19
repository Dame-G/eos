# ESwitch

A pill switch for a setting that takes effect the moment it is flipped. Use `ECheckbox` for a choice submitted later with a form.

```vue
<ESwitch v-model="reminders" label="Text reminders" description="The day before a visit." />
```

## Props

| Prop          | Type      | Default   | Notes                                       |
| ------------- | --------- | --------- | ------------------------------------------- |
| `modelValue`  | `boolean` | `false`   | v-model: on or off.                         |
| `label`       | `string`  |           | Required. Name the setting by what it does. |
| `description` | `string`  |           | Detail under the label.                     |
| `disabled`    | `boolean` |           |                                             |
| `name`        | `string`  |           | Submitted with a form.                      |
| `value`       | `string`  |           | Submitted with a form when on.              |
| `id`          | `string`  | generated | Id of the input.                            |

`class` and `style` land on the row (the `label` element); other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- A checkbox with `role="switch"`: Space toggles it and the state is announced as on or off.
- State never depends on colour alone: the knob sits at the end when on.
