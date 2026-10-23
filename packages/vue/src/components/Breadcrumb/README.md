# EBreadcrumb

The path to the current page, two or more levels deep. It is never the only way back, so use a back [`ELink`](../Link/README.md) (see [Recipes](https://eos.dame.gg/guide/recipes)) for that.

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

<!-- props:start -->

| Prop            | Type                  | Default      | Notes                                                                                                                                                                                                                                         |
| --------------- | --------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`         | `BreadcrumbItem[]`    | **Required** | The path as `{ label, href?, to? }`, top level first. The last item is the current page and is not a link.                                                                                                                                    |
| `linkComponent` | `string \| Component` | `"a"`        | What renders each link: `"a"`, `RouterLink`, or any component that takes `href` or `to` and a default slot. With `RouterLink`, give items a `to`. Items can mix `href` and `to`, and the component receives only the attributes the item has. |

<!-- props:end -->

`class`, `style` and attributes land on the `nav` element.

## Accessibility

- A `nav` landmark named "Breadcrumb" (message `breadcrumb`) holding an ordered list.
- The last item has `aria-current="page"`.

## Keyboard

No custom keyboard behavior. Each link is a tab stop, and the current page is plain text.

## Related

[`ENavList`](../NavList/README.md) for the navigation of a whole site, [`EPagination`](../Pagination/README.md) for moving through pages of one list.
