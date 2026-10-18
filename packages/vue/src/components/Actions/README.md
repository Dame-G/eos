# EActions

A group of Buttons. The rule for every group in the system: they sit in the order of the content, the main action first, left-aligned, and wrap when there is no room.

```vue
<EActions bar as="footer">
  <EButton>Pay</EButton>
  <EButton variant="outline">Details</EButton>
</EActions>
```

## Props

| Prop  | Type      | Default | Notes                                                     |
| ----- | --------- | ------- | --------------------------------------------------------- |
| `bar` | `boolean` |         | Puts the group on a tinted footer bar with a rule above.  |
| `as`  | `string`  | `div`   | The element. Use `footer` for a bar at the end of a card. |

`class`, `style` and attributes (for example `role="group"` with `aria-label`) fall through to the root. The default slot holds the Buttons. On a phone (up to 32rem) a bar's Buttons stack full width. In print the group is hidden.

## Bar or inline

A group that ends a card or an overlay is a bar: Dialog, Drawer, Popover, StatementCard, StatementRow, AppointmentCard, and any ESurface given the `actions` slot. A group in the flow of a page or a message is inline: a form on the page, a Notice, an EmptyState, a PageHeader, the Today and Clear row of a Calendar. The test is what the group ends. A card's actions are about that card, so they sit on its foot; a page's actions are the next step in a flow.

## Accessibility

- Source order is tab order: put the main action first.
- Give a group an accessible name (`role="group"` and `aria-label`) only when the Buttons alone do not make the purpose clear.
