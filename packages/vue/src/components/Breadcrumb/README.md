# EBreadcrumb

The path to the current page, two or more levels deep. It is never the only way back; use `EBackLink` for that.

```vue
<EBreadcrumb
  :items="[
    { label: 'Account', href: '/account' },
    { label: 'Statements', href: '/statements' },
    { label: 'Visit on Oct 2' },
  ]"
/>
```

## Props

| Prop            | Type                  | Default | Notes                                                                                                                  |
| --------------- | --------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `items`         | `BreadcrumbItem[]`    |         | Required. `{ label, href?, to? }`, top level first. The last item is the current page and is not a link.               |
| `linkComponent` | `string \| Component` | `a`     | Pass `RouterLink` and give items a `to` (items can mix `href` and `to`); it receives only the attributes the item has. |

`class`, `style` and attributes land on the `nav` element.

## Accessibility

- A `nav` landmark named "Breadcrumb" (message `breadcrumb`) holding an ordered list.
- The last item has `aria-current="page"`.
