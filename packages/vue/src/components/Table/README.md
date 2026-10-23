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

| Prop           | Type                          | Default        | Notes                                                                                                                       |
| -------------- | ----------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `caption`      | `string`                      | **Required**   | Names the table for screen readers, and its scrolling region. It is also shown above the table unless `hideCaption` is set. |
| `hideCaption`  | `boolean`                     | `false`        | Keeps the caption for screen readers and removes it from the page, for a table that a nearby heading already names.         |
| `striped`      | `boolean`                     | `false`        | Tints every other row.                                                                                                      |
| `size`         | `Extract<Size, "sm" \| "md">` | `"md"`         | Smaller text and tighter cells, for reference tables with many rows. `"sm"` is the same as the older `dense`.               |
| `dense`        | `boolean`                     | `false`        | **Deprecated.** Use `size="sm"`.                                                                                            |
| `maxHeight`    | `string`                      | None           | Stops the table growing past this height (any CSS length) and scrolls inside it, with a sticky header row.                  |
| `cards`        | `boolean`                     | `false`        | Turns each row into a card below 40rem of the table's own width. Give every `td` a `data-label` with its column heading.    |
| `loading`      | `boolean`                     | `false`        | Marks the data as loading: the rows are dimmed, `aria-busy` is set and placeholder lines show under the table.              |
| `skeletonRows` | `number`                      | `3`            | How many placeholder lines `loading` shows.                                                                                 |
| `empty`        | `boolean`                     | `false`        | Shows the empty state under the headings. Set it when the table has no rows.                                                |
| `emptyTitle`   | `string`                      | `"No results"` | The title of the empty state.                                                                                               |
| `emptyText`    | `string`                      | None           | The sentence under the empty title.                                                                                         |
| `emptyIcon`    | `IconProp`                    | `"search"`     | The icon above the empty title.                                                                                             |

<!-- props:end -->

`class`, `style`, `id` and `data-*` land on the outer frame.

`size="sm"` tightens the cells (`dense` is deprecated). `loading` dims the rows, sets `aria-busy` and shows placeholder lines under the table. `empty` shows an empty state under the headings (fill the `empty` slot for your own). `cards` turns each row into a card below 40rem of the table's width: give every `td` a `data-label` with its column heading, and the heading row is hidden.

## Slots

| Slot      | Use                                                                                       |
| --------- | ----------------------------------------------------------------------------------------- |
| `default` | The `thead`, `tbody` and `tfoot`. Put `class="e-num"` on a number column to align it end. |
| `empty`   | Your own empty state, when `empty` is set.                                                |

## Accessibility

- The `caption` is the table's accessible name. When the table is wider than its space, or `maxHeight` is set, the frame becomes a named, focusable `region` that scrolls with the arrow keys. Otherwise it is not a tab stop.
- Use `th` with `scope="col"` for column headings and `scope="row"` for row headings, so screen readers can announce them with each cell.
- Striping and the hover row are decoration: no information depends on them.
- In forced-colors mode the frame and the rule under the headings are drawn in the system text colour.

## Keyboard

| Key        | Does                                     |
| ---------- | ---------------------------------------- |
| Tab        | Focuses the frame only while it scrolls. |
| Arrow keys | Scroll the frame when it has focus.      |

## Related

[`EDataGrid`](../DataGrid/README.md) for sorting, filtering and selecting, [`EDescriptionList`](../DescriptionList/README.md) for label and value pairs.
