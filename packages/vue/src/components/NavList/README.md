# ENavList

The sidebar list for an app, or the navigation row of an `EAppHeader`, with optional counts and a current-page marker.

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

| Prop            | Type                         | Default    | Notes                                                                                                                                                                                      |
| --------------- | ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `items`         | `NavItem[]`                  |            | `{ label, href?, to?, icon?, count?, current? }`. With no `href` or `to` a link goes to `#`. Set `current` yourself.                                                                       |
| `sections`      | `NavSection[]`               |            | Groups instead of `items`: `{ label?, items }`. Label only when there is more than one section.                                                                                            |
| `dense`         | `boolean`                    |            | Shorter rows and smaller text, with a bar at the start of the row, for long lists such as the pages of a site.                                                                             |
| `orientation`   | `"vertical" \| "horizontal"` | `vertical` | `horizontal` lays the links in a row for a header: muted words, a bar under each on hover, a heavier primary bar and a tint under the current page. Composes with `dense` (a shorter row). |
| `label`         | `string`                     | `Main`     | Landmark name; give each navigation on a page its own.                                                                                                                                     |
| `linkComponent` | `string \| Component`        | `a`        | Renders each link. Pass `RouterLink` and give items `to`; it receives `to` or `href`, the class `e-nav-item` and `aria-current`.                                                           |

`class`, `style` and attributes land on the `nav` element. Rows have no separators; for a sidebar of page links with a rule down the start edge, use `ETabs` with `orientation="vertical"`.

## Accessibility

- A `nav` landmark named by `label`.
- The current item has `aria-current="page"` and is also heavier and outlined, not colour alone.
