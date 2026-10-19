# EDescriptionList

Label and text rows, ruled apart, for facts such as what a statement covers or when it is due.

```vue
<EDescriptionList
  :items="[
    { label: 'Covers', text: 'Visit on September 12' },
    { label: 'Due', text: 'October 31' },
  ]"
/>
```

## Props

| Prop    | Type                | Default | Notes                                                                                       |
| ------- | ------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `items` | `DescriptionItem[]` |         | Required. `{ label: string, text: string \| VNode }`. Labels are keys, so keep them unique. |

`class`, `style` and attributes land on the `dl` element.

## Accessibility

- A `dl` with `dt` and `dd` pairs, so screen readers announce each pair.
