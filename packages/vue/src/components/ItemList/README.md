# EItemList

The list that holds EItemRows. Its rows share one set of columns, so every status and every action lines up down the list.

```vue
<EPanel>
  <EItemList>
    <EItemRow title="Intake form" status="action"><template #action><EButton>Sign</EButton></template></EItemRow>
    <EItemRow title="Receipt" status="paid" />
  </EItemList>
</EPanel>
```

## Slots

| Slot      | Use              |
| --------- | ---------------- |
| `default` | The `EItemRow`s. |

`class`, `style` and `data-*` attributes fall through to the root.

## Accessibility

The grid has `role="list"` and each row `role="listitem"`, so a screen reader announces a list of items. The element stays a `div` so the rows can share columns through a subgrid.

## Rules

- Put it on an EPanel or on the page; rows are separated by hairlines.
- Layout is decided by the width of the list (it is a size container), not of the screen: wide lists put the status and the action at the end of each row; narrow ones put the status under the subtitle, a text Button below that, and an IconButton at the end of the row.
