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

| Prop                | Type                                    | Default              | Notes                                                                                             |
| ------------------- | --------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| `columns`           | `DataGridColumn[]`                      |                      | Required. See below.                                                                              |
| `rows`              | `DataGridRow[]`                         |                      | Required. Each needs a unique `id`; selection is by id.                                           |
| `caption`           | `string`                                |                      | Required. Names the table and its scrolling region.                                               |
| `sort`              | `{ key, dir: "asc" \| "desc" } \| null` | `null`               | v-model:sort.                                                                                     |
| `page`              | `number`                                | `1`                  | v-model:page, from 1.                                                                             |
| `search`            | `string`                                | `""`                 | v-model:search.                                                                                   |
| `filters`           | `Record<string, DataGridFilterValue>`   | `{}`                 | v-model:filters, by column `key`: text, or `{ min, max }` strings for `number`.                   |
| `selected`          | `string[]`                              | `[]`                 | v-model:selected: row ids, kept across pages and filters.                                         |
| `searchable`        | `boolean`                               |                      | One box searching the shown columns.                                                              |
| `searchPlaceholder` | `string`                                | `Search all columns` | The search box's placeholder.                                                                     |
| `filterable`        | `boolean`                               |                      | Filter row for columns that define `filter`.                                                      |
| `resizable`         | `boolean`                               |                      | Drag or keyboard-resize column edges.                                                             |
| `stickyFirst`       | `boolean`                               |                      | Keeps the first column in view when scrolling sideways.                                           |
| `columnToggle`      | `boolean`                               |                      | A Columns menu to show and hide columns.                                                          |
| `selectable`        | `boolean`                               |                      | Row checkboxes and select-all.                                                                    |
| `pageSize`          | `number`                                | `10`                 | `0` turns paging off.                                                                             |
| `maxHeight`         | `string`                                |                      | CSS length; scrolls inside it with a sticky header.                                               |
| `virtual`           | `boolean \| DataGridVirtual`            |                      | Renders only the rows in view; replaces paging. `{ rowHeight = 48, height = 440, overscan = 8 }`. |
| `cards`             | `boolean`                               | `true`               | Rows become cards below 40rem of the grid's width. `virtual` and `resizable` keep the table.      |
| `manual`            | `boolean`                               |                      | Server data: shows the rows given, in the order given; listen to `queryChange`.                   |
| `total`             | `number`                                |                      | With `manual`, the row count in all.                                                              |
| `loading`           | `boolean`                               |                      | Placeholder rows, `aria-busy`.                                                                    |
| `emptyTitle`        | `string`                                | `No results`         | Title when there are no rows.                                                                     |
| `emptyText`         | `string`                                |                      | Sentence under the empty title.                                                                   |
| `emptyIcon`         | `IconProp`                              | `search`             | Icon above the empty title.                                                                       |
| `plain`             | `boolean`                               |                      | Bare table for a short static list: no toolbar, filters, paging or footer.                        |

`class`, `style` and attributes land on the `div` element.

A `DataGridColumn` has:

| Field       | Type                                                                    | Notes                                                             |
| ----------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `key`       | `string`                                                                | Required. The default cell shows `row[key]`.                      |
| `label`     | `string`                                                                | Required. Heading and control names.                              |
| `sortable`  | `boolean`                                                               | The heading becomes a button: ascending, descending, off.         |
| `numeric`   | `boolean`                                                               | Right-aligned, monospaced figures.                                |
| `align`     | `"center"`                                                              | Centres the column.                                               |
| `width`     | `number \| string`                                                      | Pixels (a number or `"140px"`); fixes the table layout.           |
| `minWidth`  | `number`                                                                | Least width when resizing. Default 72.                            |
| `resizable` | `boolean`                                                               | `false` excludes the column from resizing.                        |
| `value`     | `(row) => string \| number \| Date \| null \| undefined`                | What sorts, filters and searches; set it when the cell is a slot. |
| `filter`    | `{ type: "text" }`, `{ type: "select", options }`, `{ type: "number" }` | `number` is a minimum and maximum.                                |

## Slots

| Slot           | Use                                            |
| -------------- | ---------------------------------------------- |
| `cell-<key>`   | Cell content; props `{ row, value }`.          |
| `header-<key>` | Replaces the column label; props `{ column }`. |
| `bulk-actions` | Buttons beside the "n selected" count.         |
| `toolbar`      | Extra content in the bar above the table.      |

## Events

| Event         | Payload                                     | Notes                                               |
| ------------- | ------------------------------------------- | --------------------------------------------------- |
| `queryChange` | `{ sort, page, pageSize, search, filters }` | `pageSize` is 0 without paging. Not fired on mount. |

## Accessibility

- A `table` with `caption`, `th scope="col"` and `aria-sort`, inside a focusable region named by `caption`; sort changes are announced.
- Column edges are focusable separators: Arrow Left and Arrow Right resize by 10px (Shift 40px), Home or Escape resets.
- Virtual grids set `aria-rowcount` and `aria-rowindex`.
- All strings are configurable messages.
