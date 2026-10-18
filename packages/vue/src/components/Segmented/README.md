# AeSegmented

A joined set of two to five options where exactly one is active. Use it to switch how a list is filtered or shown; use Tabs to switch between different content. It is a radio group underneath, so arrow keys work.

```vue
<AeSegmented v-model="range" label="Show" :options="['Day', 'Week', 'Month']" />
<AeSegmented
  v-model="view"
  label="View"
  :options="[
    { value: 'list', label: 'List', icon: 'list' },
    { value: 'grid', label: 'Grid' },
  ]"
  hint="Remembered on this device."
/>
```

## Props

| Prop       | Type                            | Notes                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------------- |
| `v-model`  | `string`                        | The active value. The first option is active when nothing is bound. |
| `label`    | `string`                        | Required. Read by screen readers as the group's name.               |
| `options`  | `(string \| SegmentedOption)[]` | `SegmentedOption` is `{ value, label, icon?, disabled? }`.          |
| `hint`     | `string`                        | Under the control, linked with `aria-describedby`.                  |
| `error`    | `string`                        | Replaces the hint, announced.                                       |
| `disabled` | `boolean`                       | Disables every option.                                              |
| `name`     | `string`                        | Shared by the radios. Generated when left out.                      |

`class` and `style` stay on the outer element; other attributes land on the `role="radiogroup"` element.

## Rules

- The active option is filled with `primary` and bold, with white text. Forced colours use `Highlight`.
- The control is 48px tall and as wide as its content (`fit-content`, capped at the container).
- With a hint or error the control sits in `.ae-seg-field` with the message 8px under it.
- Export: `SegmentedOption` type.
