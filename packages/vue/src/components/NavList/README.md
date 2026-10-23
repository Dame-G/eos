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

| Prop            | Type                         | Default      | Notes                                                                                                                                                                                                            |
| --------------- | ---------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`         | `NavItem[]`                  | None         | The destinations, in order: `{ label, href?, to?, icon?, count?, countLabel?, current? }`. With no `href` or `to` the item is plain text, not a link. `current` marks the current page and is never set for you. |
| `sections`      | `NavSection[]`               | None         | Destinations in labelled groups, instead of `items`: `{ label?, items }`. A label is needed only when there is more than one section.                                                                            |
| `orientation`   | `"vertical" \| "horizontal"` | `"vertical"` | `vertical` stacks the links, for a sidebar or a menu. `horizontal` lays them in a row, for a header.                                                                                                             |
| `label`         | `string`                     | `"Main"`     | The landmark's name. Each navigation on a page needs its own.                                                                                                                                                    |
| `linkComponent` | `string \| Component`        | `"a"`        | What renders each link: `RouterLink` or any component that takes `href` or `to` and a default slot. It receives `to` or `href`, the class `e-nav-item` and `aria-current`. Items then use `to`.                  |

<!-- props:end -->

`class`, `style` and attributes land on the `nav` element. It owns every list of links, vertical for a sidebar and `horizontal` for a header row. For switching panels on one page, use [`ETabs`](../Tabs/README.md).

## Accessibility

- A `nav` landmark named by `label`.
- An item without `href` or `to` is plain text, not a link to `#`.
- `countLabel` gives a count its meaning ("2 bills to pay"); without it a screen reader reads the bare number after the label.
- The current item has `aria-current="page"` and is also marked visually, so colour is not the only signal.

## Keyboard

| Key   | Action                            |
| ----- | --------------------------------- |
| Tab   | Moves between the links in order. |
| Enter | Follows the focused link.         |

## Related

[`ETabs`](../Tabs/README.md) to switch panels on one page, [`EBreadcrumb`](../Breadcrumb/README.md) to show where the page sits.
