# ETable

A plain table for facts that are read, not worked: specifications, prices, comparisons, reference lists. It is a native `table` in an outlined, scrollable frame.

```vue
<ETable caption="Plans" striped>
  <thead>
    <tr><th scope="col">Plan</th><th scope="col" class="e-num">Visits</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Basic</th><td class="e-num">4</td></tr>
    <tr><th scope="row">Plus</th><td class="e-num">12</td></tr>
  </tbody>
</ETable>
```

Use [`EDataGrid`](../DataGrid/README.md) when people need to sort, filter, select or page through rows. `ETable` takes your own markup, so it also suits a table built from markdown or a CMS.

## Props

<!-- props:start -->

| Prop          | Type      | Default      | Notes                                                                                                                       |
| ------------- | --------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `caption`     | `string`  | **Required** | Names the table for screen readers, and its scrolling region. It is also shown above the table unless `hideCaption` is set. |
| `hideCaption` | `boolean` | `false`      | Keeps the caption for screen readers and removes it from the page, for a table that a nearby heading already names.         |
| `striped`     | `boolean` | `false`      | Tints every other row.                                                                                                      |
| `dense`       | `boolean` | `false`      | Smaller text and tighter cells, for reference tables with many rows.                                                        |
| `maxHeight`   | `string`  | None         | Stops the table growing past this height (any CSS length) and scrolls inside it, with a sticky header row.                  |

<!-- props:end -->

`class`, `style`, `id` and `data-*` land on the outer frame.

## Slots

| Slot      | Use                                                                                       |
| --------- | ----------------------------------------------------------------------------------------- |
| `default` | The `thead`, `tbody` and `tfoot`. Put `class="e-num"` on a number column to align it end. |

## Accessibility

- The `caption` is the table's accessible name and the name of its scrolling region, which can be focused and scrolled with the arrow keys when the table is wider than its space.
- Use `th` with `scope="col"` for column headings and `scope="row"` for row headings, so screen readers can announce them with each cell.
- Striping and the hover row are decoration: no information depends on them.
- In forced-colors mode the frame is drawn in the system text colour.
