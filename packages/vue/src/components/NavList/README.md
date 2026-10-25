# ENavList

All link navigation: the sidebar list for an app, or the navigation row of an [`EAppHeader`](../AppHeader/README.md), with optional counts and a current-page marker.

```vue
<ENavList
  label="Account"
  :items="[
    { label: 'Home', icon: 'home', href: '/' },
    { label: 'Pay a bill', icon: 'card', href: '/pay', count: 2, current: true },
    { label: 'Statements and receipts', icon: 'receipt', href: '/statements' },
  ]"
/>
```

## Props

<!-- props:start -->

| Prop            | Type                         | Default      | Notes                                                                                                                                                                                                                                                               |
| --------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation`   | `"vertical" \| "horizontal"` | `"vertical"` | `vertical` stacks the links, for a sidebar or a menu. `horizontal` lays them in a row, for a header.                                                                                                                                                                |
| `label`         | `string`                     | `"Main"`     | The landmark's name. Each navigation on a page needs its own; with two left on the default, development warns.                                                                                                                                                      |
| `linkComponent` | `string \| Component`        | `"a"`        | What renders each link: `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href`, the class `e-nav-item` and `aria-current`. Items then use `to`.                                                                     |
| `isCurrent`     | `(item: NavItem) => boolean` | None         | Says which item is the current page, for every item whose `current` is not set: `(item) => item.href === route.path`. It runs again when what it reads changes.                                                                                                     |
| `size`          | `"sm" \| "md"`               | `"md"`       | `sm` gives short rows with no rule between them, for a long list such as a documentation sidebar. Rows stay a full tap target on a touch screen.                                                                                                                    |
| `items`         | `NavItem[]`                  | None         | The destinations, in order: `{ label, href?, to?, icon?, count?, countLabel?, current?, disabled?, children? }`. With no `href` or `to` the item is plain text, not a link. `current` marks the current page and wins over `isCurrent`. Give `items` or `sections`. |
| `sections`      | `NavSection[]`               | None         | Destinations in labelled groups, instead of `items`: `{ label?, items }`. A label is needed only when there is more than one section.                                                                                                                               |

<!-- props:end -->

`class`, `style` and attributes land on the `nav` element. An item with `children` is a group that opens and closes with the library's chevron (use it in a vertical list); a group that holds the current page starts open, opens by itself when the current page moves into it, and is never closed on the person. A router's route can drive `isCurrent` without the list depending on a router. For switching panels on one page, use [`ETabs`](../Tabs/README.md).

## Accessibility

- A `nav` landmark named by `label`.
- An item without `href` or `to` is plain text, not a link to `#`.
- `countLabel` gives a count its meaning ("2 bills to pay"); without it a screen reader reads the bare number after the label.
- A group is a native `details`; its summary is not a link and carries no `aria-current`. A disabled item is `role="link"` with `aria-disabled="true"` and no `href`.
- The current item has `aria-current="page"` and is also marked visually, so colour is not the only signal.

## Keyboard

| Key          | Action                             |
| ------------ | ---------------------------------- |
| Tab          | Moves between the links in order.  |
| Enter        | Follows the focused link.          |
| Enter, Space | Opens or closes the focused group. |

## Related

[`ETabs`](../Tabs/README.md) to switch panels on one page, [`EBreadcrumb`](../Breadcrumb/README.md) to show where the page sits.
