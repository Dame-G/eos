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

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `(DescriptionItem \| null \| undefined)[]` | **Required** | Label and text rows, ruled apart: `{ label: string, text: string \| VNode }`. Labels are keys, so keep them unique. `null` items are skipped. |

<!-- props:end -->

`class`, `style` and attributes land on the `dl` element.

## Accessibility

- A `dl` with `dt` and `dd` pairs, so screen readers announce each pair.
