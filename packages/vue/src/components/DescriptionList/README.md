# AeDescriptionList

Label and text rows, ruled apart: what a statement covers, how to pay, when it is due.

```vue
<AeDescriptionList
  :items="[
    { label: 'Covers', text: 'Visit on September 12' },
    { label: 'Due', text: 'October 31' },
  ]"
/>
```

## Props

| Prop    | Type                                         | Notes                                                                                    |
| ------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `items` | `{ label: string; text: string \| VNode }[]` | The rows. Labels are used as keys, so keep them unique. Exported type `DescriptionItem`. |

`class`, `style` and attributes fall through to the `dl`.

## Accessibility

- It renders a real description list (`dl`, `dt`, `dd`, each pair wrapped in a `div`), so screen readers announce each pair.
- The label sits beside the text and stacks above it below 26rem. In print each row is ruled by a bottom border.
