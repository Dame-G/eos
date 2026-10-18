# ENavList

The sidebar list for an app, or the navigation row of an EAppHeader. The current page is tinted, outlined and bold, so it is not shown by colour alone. Rows are 48px; counts are pills, for things waiting on the person (bills to pay, forms to sign).

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

| Prop            | Type                  | Default | Notes                                                                                    |
| --------------- | --------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `items`         | `NavItem[]`           |         | `{ label, href?, to?, icon?, count?, current? }`. `icon` is a name or an icon component. |
| `label`         | `string`              | "Main"  | The landmark's name. Give each navigation on a page its own.                             |
| `linkComponent` | `string \| Component` | `"a"`   | What renders each link. Pass `RouterLink` for vue-router. See "Router usage".            |

`class`, `style` and attributes fall through to the `nav`.

## Router usage

Eos does not depend on vue-router. Give items a `to` and pass `RouterLink` as `linkComponent`:

```vue
<ENavList
  :link-component="RouterLink"
  :items="[
    { label: 'Home', to: '/' },
    { label: 'Forms', to: '/forms', count: 1 },
  ]"
/>
```

The link component receives `to` (or `href`), the `e-nav-item` class and, on the current item, `aria-current="page"`; its default slot holds the icon, label and count. Set `current` yourself from the route (for example `route.path === '/forms'`). An item with neither `href` nor `to` links to `#`.

## Accessibility

- A `nav` landmark named by `label` (default "Main"), a list of links.
- The current item has `aria-current="page"`, a heavier weight and an outline.
- Focus shows the standard ring. In an EAppShell sidebar the `aside` is also a landmark: give it its own name with `sidebarLabel`.

## Rules

- Use it for the app's top-level places. Counts are for things waiting on the person; leave them off otherwise.
- Inside an EAppHeader the items sit in a wrapping row instead of a column.
