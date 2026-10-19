# EToggle

A button with two states, pressed and not, for a filter or view option. Use `ESwitch` for a setting that saves.

```vue
<EToggle v-model="unpaid" icon="filter">Unpaid only</EToggle>
```

## Props

| Prop         | Type       | Default | Notes                           |
| ------------ | ---------- | ------- | ------------------------------- |
| `modelValue` | `boolean`  | `false` | v-model: whether it is pressed. |
| `icon`       | `IconProp` |         | Icon before the label.          |
| `disabled`   | `boolean`  |         |                                 |

`class`, `style`, attributes and listeners (`@click`, `aria-*`) land on the `button` element, which is an outline `EButton`.

## Slots

| Slot      | Use                                                                             |
| --------- | ------------------------------------------------------------------------------- |
| `default` | The label. Keep it the same in both states: it names the option, not the state. |

## Accessibility

- The state is exposed with `aria-pressed` and shown by a filled tint and heavier edge, not colour alone.
