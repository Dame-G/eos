# ESwitch

A pill switch for a setting that takes effect the moment it is flipped. A choice submitted later with a form is an `ECheckbox`.

```vue
<ESwitch v-model="reminders" label="Text reminders" description="The day before a visit." />
```

## Props

| Prop            | Type      | Notes                                       |
| --------------- | --------- | ------------------------------------------- |
| `v-model`       | `boolean` | On or off. Leave it off for local state.    |
| `label`         | `string`  | Required. Name the setting by what it does. |
| `description`   | `string`  | A line of detail under the label.           |
| `disabled`      | `boolean` |                                             |
| `name`, `value` | `string`  | Submitted with a form.                      |
| `id`            | `string`  | Generated when left out.                    |

`class` and `style` stay on the row; every other attribute and listener lands on the `<input role="switch">`. Exposed: `input` and `focus()`.

## Rules

- On is `primary` with the knob at the end; off is tinted with the knob at the start, so state never depends on colour. In right-to-left text the knob travels the other way.
- It is a real checkbox with `role="switch"`: Space toggles it, and its state is announced as on or off.
- Forced colours: the track and knob use `Highlight` and `ButtonText`.
