# EButtonGroup

Buttons that belong together, side by side, announced as one labelled group. Use `ESegmented` for one choice from several.

```vue
<EButtonGroup label="Record actions">
  <EButton variant="outline">Print</EButton>
  <EButton variant="outline">Download</EButton>
</EButtonGroup>
```

## Props

| Prop    | Type     | Default | Notes                                                      |
| ------- | -------- | ------- | ---------------------------------------------------------- |
| `label` | `string` |         | Required. What the group is for; names the `role="group"`. |

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use          |
| --------- | ------------ |
| `default` | The buttons. |

## Accessibility

- Renders `role="group"` with `aria-label` set from `label`, so a screen reader announces the group name when focus enters it.
- It adds no keyboard behaviour: every button stays its own tab stop and works with Enter and Space.
- Each button needs its own accessible name; the group label does not replace it.
