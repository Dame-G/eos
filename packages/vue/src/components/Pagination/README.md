# EPagination

Previous, Next and page-number buttons for paging through a long list. For a table to work in, use the paging built into [`EDataGrid`](../DataGrid/README.md).

```vue
<EPagination v-model="page" :page-count="12" />
```

## Props

<!-- props:start -->

| Prop         | Type                       | Default        | Notes                                                                                                                              |
| ------------ | -------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `number`                   | `1`            | `v-model`: the current page, from 1. A value outside 1 to `pageCount` is moved to the nearest page.                                |
| `pageCount`  | `number`                   | **Required**   | How many pages there are. With 0 there is nothing to page and both steps dim.                                                      |
| `href`       | `(page: number) => string` | None           | Makes each page, Previous and Next a link to this address, for pages the server renders. The current page still updates `v-model`. |
| `label`      | `string`                   | `"Pagination"` | Names the navigation. Give each pager on a page its own name.                                                                      |

<!-- props:end -->

`class`, `style` and attributes land on the `nav` element. It shows first, last and neighbouring pages with ellipses. When the pager itself is narrower than 26rem the page list gives way to "Page 3 of 12". While `pageCount` is 0 the model is left as it is, so a page restored from the address survives until the count arrives. Hidden in print.

## Accessibility

- A `nav` named "Pagination". Give two pagers on a page their own `label`.
- Previous and Next are `aria-disabled`, not `disabled`, at the ends, so focus stays on the button that was pressed.
- A page the person chooses is announced as "Page 3 of 12". A page set from outside is not.
- The current page has `aria-current="page"`, and each number is named "Page N".

## Keyboard

| Key          | Action                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| Tab          | Moves between Previous, the pages and Next.                                                              |
| Enter, Space | Chooses the focused page, Previous or Next. With `href` they are links, so Space does not activate them. |

## Related

[`ENavList`](../NavList/README.md) for a list of destinations.
