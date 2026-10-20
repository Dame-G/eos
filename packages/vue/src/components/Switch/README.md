# ESwitch

A pill switch for a setting that takes effect the moment it is flipped. Use `ECheckbox` for a choice submitted later with a form.

```vue
<ESwitch v-model="reminders" label="Text reminders" description="The day before a visit." />
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | `v-model`: on or off. |
| `label` | `string` | **Required** | The setting, named by what it does. |
| `description` | `string` | — | A line of detail under the label. |
| `disabled` | `boolean` | `false` | Disables the switch. |
| `name` | `string` | — | The name submitted with a form. |
| `value` | `string` | — | The value submitted with a form when on. |
| `id` | `string` | `generated` | The id of the input; the label points at it. |

<!-- props:end -->

`class` and `style` land on the row (the `label` element); other attributes and listeners land on the `input` element. Exposes `input` and `focus()`.

## Accessibility

- A checkbox with `role="switch"`: Space toggles it and the state is announced as on or off.
- State never depends on colour alone: the knob sits at the end when on.
