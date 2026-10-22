# EDataGrid

A `table` with sorting, per-column filters, search, resizing, column toggling, row selection, and paging or virtual scrolling for thousands of rows.

```vue
<EDataGrid
  v-model:selected="picked"
  v-model:sort="sort"
  caption="Payment history"
  searchable
  filterable
  selectable
  :page-size="6"
  :columns="[
    { key: 'date', label: 'Date', sortable: true, width: 140 },
    { key: 'desc', label: 'Description', sortable: true, filter: { type: 'text' } },
    { key: 'status', label: 'Status', filter: { type: 'select', options: ['paid', 'due'] } },
    { key: 'amount', label: 'Amount', numeric: true, sortable: true, filter: { type: 'number' } },
  ]"
  :rows="rows"
>
  <template #cell-amount="{ row }">{{ money(row.amount) }}</template>
  <template #bulk-actions><EButton variant="outline">Download receipts</EButton></template>
</EDataGrid>
```

## Props

The models work without a binding.

<!-- props:start -->

| Prop                | Type                                  | Default                | Notes                                                                                                                                    |
| ------------------- | ------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `sort`              | `DataGridSort \| null`                | `null`                 | `v-model:sort`: the sort: `{ key, dir: "asc" \| "desc" }`, or `null` for none.                                                           |
| `page`              | `number`                              | `1`                    | `v-model:page`: the current page, from 1.                                                                                                |
| `search`            | `string`                              | `""`                   | `v-model:search`: the text in the search box.                                                                                            |
| `filters`           | `Record<string, DataGridFilterValue>` | `{}`                   | `v-model:filters`: the column filters, by column `key`: text, or `{ min, max }` strings for `number`.                                    |
| `selected`          | `string[]`                            | `[]`                   | `v-model:selected`: the selected row ids, kept across pages and filters.                                                                 |
| `columns`           | `DataGridColumn<Row>[]`               | **Required**           | The columns, in order. See `DataGridColumn` below.                                                                                       |
| `rows`              | `Row[]`                               | **Required**           | The rows. Each needs a unique `id`, and selection is by id.                                                                              |
| `caption`           | `string`                              | **Required**           | Names the table for screen readers, and its scrolling region.                                                                            |
| `searchable`        | `boolean`                             | `false`                | One search box over all shown columns.                                                                                                   |
| `searchPlaceholder` | `string`                              | `"Search all columns"` | The search box's placeholder.                                                                                                            |
| `filterable`        | `boolean`                             | `false`                | Shows a filter row under the headings, for columns that define a `filter`.                                                               |
| `resizable`         | `boolean`                             | `false`                | Lets people drag column edges, or move them with the arrow keys.                                                                         |
| `stickyFirst`       | `boolean`                             | `false`                | Keeps the first column in view while scrolling sideways.                                                                                 |
| `columnToggle`      | `boolean`                             | `false`                | Shows a Columns menu to show and hide columns.                                                                                           |
| `selectable`        | `boolean`                             | `false`                | Shows a checkbox on each row and a select-all in the heading.                                                                            |
| `pageSize`          | `number`                              | `10`                   | Rows per page. 0 turns paging off.                                                                                                       |
| `maxHeight`         | `string`                              | None                   | Stops the table growing past this height (any CSS length) and scrolls inside it, with a sticky header.                                   |
| `virtual`           | `boolean \| DataGridVirtual`          | None                   | Renders only the rows in view, for thousands of rows. Replaces paging. `true` or `{ rowHeight = 48, height = 440, overscan = 8 }`.       |
| `cards`             | `boolean`                             | `true`                 | Turns rows into cards below 40rem of the grid's own width. `virtual` and `resizable` grids keep the table.                               |
| `manual`            | `boolean`                             | `false`                | Marks the data as living on a server. The grid shows the rows given, in the order given, and reports every change through `queryChange`. |
| `total`             | `number`                              | None                   | With `manual`, how many rows there are in all.                                                                                           |
| `loading`           | `boolean`                             | `false`                | Shows placeholder rows while data loads, with `aria-busy`.                                                                               |
| `emptyTitle`        | `string`                              | `"No results"`         | The title when there are no rows.                                                                                                        |
| `emptyText`         | `string`                              | None                   | The sentence under the empty title, when there are no rows.                                                                              |
| `emptyIcon`         | `IconProp`                            | `"search"`             | The icon above the empty title.                                                                                                          |
| `bare`              | `boolean`                             | `false`                | Renders a bare table for a short static list, with no toolbar, filters, paging or footer.                                                |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

A `DataGridColumn` has:

| Field       | Type                                                                    | Notes                                                             |
| ----------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `key`       | `string`                                                                | Required. The default cell shows `row[key]`.                      |
| `label`     | `string`                                                                | Required. Heading and control names.                              |
| `sortable`  | `boolean`                                                               | The heading becomes a button: ascending, descending, off.         |
| `numeric`   | `boolean`                                                               | Right-aligns the column and shows figures in a monospaced font.   |
| `align`     | `"center"`                                                              | Centres the column.                                               |
| `width`     | `number \| string`                                                      | Pixels, as a number or `"140px"`. Fixes the table layout.         |
| `minWidth`  | `number`                                                                | Least width when resizing. Default 72.                            |
| `resizable` | `boolean`                                                               | `false` excludes the column from resizing.                        |
| `value`     | `(row) => string \| number \| Date \| null \| undefined`                | What sorts, filters and searches. Set it when the cell is a slot. |
| `filter`    | `{ type: "text" }`, `{ type: "select", options }`, `{ type: "number" }` | `number` is a minimum and maximum.                                |

## Slots

| Slot           | Use                                                    |
| -------------- | ------------------------------------------------------ |
| `cell-<key>`   | Cell content, with `{ row, value }` in scope.          |
| `header-<key>` | Replaces the column label, with `{ column }` in scope. |
| `bulk-actions` | Buttons beside the "n selected" count.                 |
| `toolbar`      | Extra content in the bar above the table.              |

## Events

| Event         | Payload                                     | Notes                                               |
| ------------- | ------------------------------------------- | --------------------------------------------------- |
| `queryChange` | `{ sort, page, pageSize, search, filters }` | `pageSize` is 0 without paging. Not fired on mount. |

## Accessibility

- A `table` with `caption`, `th scope="col"` and `aria-sort`, inside a focusable region named by `caption`. Sort changes are announced.
- Column edges are focusable separators: Arrow Left and Arrow Right resize by 10px (Shift 40px), Home or Escape resets.
- Virtual grids set `aria-rowcount` and `aria-rowindex`.
- All strings are configurable messages.
