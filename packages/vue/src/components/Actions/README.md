# EActions

A group of buttons in the order of the content, main action first, left-aligned, wrapping when there is no room. Hidden in print.

```vue
<EActions bar as="footer">
  <EButton>Pay</EButton>
  <EButton variant="outline">Details</EButton>
</EActions>
```

## Props

| Prop  | Type      | Default | Notes                                                                                                                                                        |
| ----- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`  | `string`  | `div`   | The element. Use `footer` for a bar at the end of a card.                                                                                                    |
| `bar` | `boolean` |         | Tinted footer bar with a rule above, for actions that end a card or overlay. Buttons stack full width up to 32rem. Leave it off for the next step on a page. |

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use                         |
| --------- | --------------------------- |
| `default` | The `EButton`s, main first. |

## Accessibility

- Source order is tab order: put the main action first.
- Add `role="group"` and `aria-label` when the buttons alone do not make the purpose clear.
