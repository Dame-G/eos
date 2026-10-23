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

`class`, `style` and attributes land on the `nav` element. It shows first, last and neighbouring pages with ellipses. When the pager itself is narrower than 26rem the page list gives way to "Page 3 of 12". A `modelValue` outside 1 to `pageCount` moves to the nearest page. Hidden in print.

## Accessibility

- A `nav` named "Pagination". Pass `aria-label` to tell two pagers apart.
- Previous and Next are `aria-disabled`, not `disabled`, at the ends, so focus stays on the button that was pressed.
- A change of page is announced as "Page 3 of 12".
- The current page has `aria-current="page"`, and each number is named "Page N".

## Keyboard

| Key          | Action                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Tab          | Moves between Previous, the pages and Next.                                                    |
| Enter, Space | Chooses the focused page or step. With `href` they are links, so Space does not activate them. |

## Related

[`EDataGrid`](../DataGrid/README.md) pages its own rows, [`ENavList`](../NavList/README.md) for a list of destinations.
