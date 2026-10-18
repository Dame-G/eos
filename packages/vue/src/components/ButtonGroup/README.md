# AeButtonGroup

Buttons that belong together, side by side, announced as one labelled group.

```vue
<AeButtonGroup label="Record actions">
  <AeButton variant="outline">Print</AeButton>
  <AeButton variant="outline">Download</AeButton>
</AeButtonGroup>
```

## Props

| Prop    | Type     | Notes                                                      |
| ------- | -------- | ---------------------------------------------------------- |
| `label` | `string` | Required. What the group is for; names the `role="group"`. |

Slot: the buttons (default). `class`, `style` and other attributes land on the group.

## Rules

- The buttons sit in a row with `space-2` between them and wrap when there is no room.
- For a choice of one from several, use `AeSegmented`. For independent on-off options, use `AeToggle`s in a group.
