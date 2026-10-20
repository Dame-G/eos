# ENavList

All link navigation: the sidebar list for an app, or the navigation row of an `EAppHeader`, with optional counts and a current-page marker.

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

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `NavItem[]` | — | The destinations, in order: `{ label, href?, to?, icon?, count?, current? }`. With no `href` or `to` a link goes to `#`. Set `current` yourself. |
| `sections` | `NavSection[]` | — | Destinations in labelled groups, instead of `items`: `{ label?, items }`. Give a label only when there is more than one section. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | `vertical` stacks the links, for a sidebar or a menu. `horizontal` lays them in a row, for a header, with a hairline between each. Items look the same as in the vertical list: a tint on hover, and a primary outline with a heavier bottom edge on the current page. |
| `label` | `string` | `"Main"` | The landmark's name; give each navigation on a page its own. |
| `linkComponent` | `string \| Component` | `"a"` | What renders each link: `"a"` by default, or `RouterLink` (or any component that takes `href` or `to` and a default slot). Give items `to`; it receives `to` or `href`, the class `e-nav-item` and `aria-current`. |

<!-- props:end -->

`class`, `style` and attributes land on the `nav` element. It owns every list of links: vertical for a sidebar, `horizontal` for a header row. For switching panels on one page, use `ETabs`.

## Accessibility

- A `nav` landmark named by `label`.
- The current item has `aria-current="page"` and is also heavier and outlined, not colour alone.
