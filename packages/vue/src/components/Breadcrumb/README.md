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

| Prop            | Type                  | Default        | Notes                                                                                                                                                                                                                                          |
| --------------- | --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `items`         | `BreadcrumbItem[]`    | **Required**   | The path as `{ label, href?, to? }`, top level first. The last item is the current page and is not a link.                                                                                                                                     |
| `linkComponent` | `string \| Component` | `"a"`          | What renders each link: `"a"`, `RouterLink`, or any component that takes `href` or `to` and a default slot. With `RouterLink`, give items a `to`. Items can mix `href` and `to`; each link gets one of them, `to` when the component takes it. |
| `label`         | `string`              | `"Breadcrumb"` | Names the navigation. Give each breadcrumb on a page its own name.                                                                                                                                                                             |
| `maxItems`      | `number`              | None           | Shortens a long path: only the first level and the last `maxItems - 1` stay, with a "…" button between them that shows the whole path. Needs 2 or more.                                                                                        |

<!-- props:end -->

`class`, `style` and attributes land on the `nav` element. `maxItems` shortens a long path to the first level, a "…" button and the last levels; the button shows the whole path.

## Accessibility

- A `nav` landmark named "Breadcrumb" (message `breadcrumb`, or `label`) holding an ordered list.
- The "…" button is named "Show full path" (message `showFullPath`). Once pressed, focus moves to the first level it brought back.
- The last item has `aria-current="page"`.

## Keyboard

Each link is a tab stop, and the current page is plain text. Enter or Space on the "…" button shows the whole path.

## Related

[`ENavList`](../NavList/README.md) for the navigation of a whole site, [`EPagination`](../Pagination/README.md) for moving through pages of one list.
