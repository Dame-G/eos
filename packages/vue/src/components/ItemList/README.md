# EItemList

The list that holds `EItemRow`s, so every status and action lines up down the list.

```vue
<EPanel>
  <EItemList>
    <EItemRow title="Intake form" status="action"><template #action><EButton>Sign</EButton></template></EItemRow>
    <EItemRow title="Receipt" status="paid" />
  </EItemList>
</EPanel>
```

`class`, `style` and attributes land on the outer `div` element. Layout follows the list's own width, not the screen.

## Slots

| Slot      | Use              |
| --------- | ---------------- |
| `default` | The `EItemRow`s. |

## Accessibility

- The inner `div` has `role="list"` and each row `role="listitem"`.
