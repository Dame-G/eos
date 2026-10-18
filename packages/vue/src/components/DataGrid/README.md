# EDataGrid

A data table you can sort, filter per column, resize, hide columns of, select from, page through, or scroll through thousands of rows of. It is a real `<table>`. State (sorting, filtering, search, selection, column visibility and widths, paging) is kept by TanStack Table, and virtual rows by TanStack Virtual.

```vue
<EDataGrid
  v-model:selected="picked"
  v-model:sort="sort"
  caption="Payment history"
  searchable
  filterable
  selectable
  sticky-first
  column-toggle
  :page-size="6"
  :columns="[
    { key: 'date', label: 'Date', sortable: true, width: 140, value: (r) => r.date },
    { key: 'desc', label: 'Description', sortable: true, width: 200, filter: { type: 'text' } },
    { key: 'status', label: 'Status', sortable: true, filter: { type: 'select', options: ['paid', 'due'] } },
    { key: 'amount', label: 'Amount', numeric: true, sortable: true, filter: { type: 'number' } },
  ]"
  :rows="rows"
>
  <template #cell-date="{ row }">{{ formatDate(row.date) }}</template>
  <template #cell-status="{ row }"><EStamp :status="row.status" small /></template>
  <template #cell-amount="{ row }">{{ money(row.amount) }}</template>
  <template #bulk-actions><EButton variant="outline" icon="download">Download receipts</EButton></template>
</EDataGrid>
```

## Columns

A column is `DataGridColumn`:

| Field       | Type                                                                    | Notes                                                                                                               |
| ----------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `key`       | `string`                                                                | Required. Names the column. The default cell shows `row[key]`.                                                      |
| `label`     | `string`                                                                | Required. The heading, the label of each cell on a phone, and the name of the column's controls.                    |
| `sortable`  | `boolean`                                                               | The heading becomes a button that cycles ascending, descending, off.                                                |
| `numeric`   | `boolean`                                                               | Right-aligned (at the end), monospaced figures.                                                                     |
| `align`     | `"center"`                                                              | Centres the column.                                                                                                 |
| `width`     | `number \| string`                                                      | Pixels: a number or a string ending in `px`. Any width makes the table layout fixed.                                |
| `minWidth`  | `number`                                                                | The least width, in pixels, the edge can be dragged to. Default 72.                                                 |
| `resizable` | `boolean`                                                               | `false` takes the column out of resizing.                                                                           |
| `value`     | `(row) => string \| number \| Date`                                     | What the column sorts, filters and searches on. Set it when the cell shows a node (a slot) but should sort on data. |
| `filter`    | `{ type: "text" }`, `{ type: "select", options }`, `{ type: "number" }` | Shows in the filter row when the grid is `filterable`. `number` is a minimum and a maximum.                         |

`value` stays on the column, not in a slot, because it feeds sorting, filtering and search. Numbers and dates sort by size, text in natural order ("item 2" before "item 10"), and missing values last. The sort is stable.

Rows are objects with a unique `id` (`DataGridRow`). Column and row types, `DataGridSort`, `DataGridQuery`, `DataGridFilterValue` and `DataGridVirtual` are exported.

## Props

| Prop                | Type                         | Default  | Notes                                                                                                         |
| ------------------- | ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `columns`           | `DataGridColumn[]`           |          | Required.                                                                                                     |
| `rows`              | `DataGridRow[]`              |          | Required. Each needs a unique `id`.                                                                           |
| `caption`           | `string`                     |          | Required. Names the table and the scrolling region for screen readers.                                        |
| `searchable`        | `boolean`                    |          | One box that searches the shown columns.                                                                      |
| `searchPlaceholder` | `string`                     |          | Default "Search all columns" (the `searchAll` message).                                                       |
| `filterable`        | `boolean`                    |          | A filter row under the headings for columns that have a `filter`.                                             |
| `resizable`         | `boolean`                    |          | Column edges can be dragged or moved with the keyboard.                                                       |
| `stickyFirst`       | `boolean`                    |          | Keeps the first column in view while scrolling sideways (after the checkbox column).                          |
| `columnToggle`      | `boolean`                    |          | A Columns menu with a checkbox per column.                                                                    |
| `selectable`        | `boolean`                    |          | A checkbox on each row and a select-all in the heading.                                                       |
| `pageSize`          | `number`                     | `10`     | Rows per page. `0` turns paging off.                                                                          |
| `maxHeight`         | `string`                     |          | Any CSS length. The table scrolls inside it, with a sticky header.                                            |
| `virtual`           | `boolean \| DataGridVirtual` |          | Renders only the rows in view. `{ rowHeight = 48, height = 440, overscan = 8 }`. Replaces paging.             |
| `cards`             | `boolean`                    | `true`   | Rows become cards below 40rem of the grid's own width. `virtual` and `resizable` grids always keep the table. |
| `manual`            | `boolean`                    |          | The data lives on a server: the grid shows the rows you pass and trusts their order. See below.               |
| `total`             | `number`                     |          | With `manual`, how many rows there are in all.                                                                |
| `loading`           | `boolean`                    |          | Five placeholder rows, `aria-busy`, and "Loading" announced.                                                  |
| `emptyTitle`        | `string`                     |          | Default "No results".                                                                                         |
| `emptyText`         | `string`                     |          | Default "There is nothing to show yet." (or "Nothing matches these filters." while filtering).                |
| `emptyIcon`         | `IconProp`                   | `search` | A name or an icon component.                                                                                  |
| `plain`             | `boolean`                    |          | A bare table for a short static list: no toolbar, filters, paging or footer.                                  |

`class`, `style` and other attributes land on the root `div.e-grid`.

## Models and events

State is kept inside, so every model works without a binding. Bind one to read it, preset it or change it from outside.

| Model              | Type                                     | Notes                                                                                         |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| `v-model:sort`     | `{ key, dir: "asc" \| "desc" } \| null`  | The sorted column. Start it with a value to sort at first (there is no `defaultSort`).        |
| `v-model:page`     | `number`                                 | The current page, from 1. It is pulled back when the rows shrink below it.                    |
| `v-model:search`   | `string`                                 | The text in the search box.                                                                   |
| `v-model:filters`  | `Record<string, string \| { min, max }>` | Column filters by `key`: text for `text` and `select`, `{ min, max }` strings for `number`.   |
| `v-model:selected` | `string[]`                               | The ids of the selected rows, as strings. They stay selected across pages, sorts and filters. |

Sorting, searching and filtering send the grid back to page 1.

`queryChange(query)` fires whenever the sort, page, search or filters change (not on mount). `query` is `{ sort, page, pageSize, search, filters }`. `pageSize` is 0 when the grid does not page.

## Slots

| Slot           | Props            | Notes                                                                                     |
| -------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `cell-<key>`   | `{ row, value }` | The content of that column's cells. `value` is what `value(row)` (or `row[key]`) returns. |
| `header-<key>` | `{ column }`     | Replaces that column's label inside the heading (and inside the sort button).             |
| `bulk-actions` |                  | Buttons beside the "n selected" count, shown while something is selected.                 |
| `toolbar`      |                  | Anything else for the bar above the table, after the Columns menu.                        |

## Server data

Set `manual` and pass the rows for the current view, with `total`. Nothing is sorted, filtered or sliced locally. Listen to `queryChange`, fetch what it describes, and replace `rows`. Select-all then covers the rows you passed.

## Large data

`virtual` renders only the rows in view, with spacer rows above and below, `aria-rowcount` on the table and `aria-rowindex` on each row so screen readers still know the size. Every row is one height (`rowHeight`), cells stay on one line and clip with an ellipsis. Search, sorting and filters work over all rows; select-all selects every filtered row, not only the ones in view.

## On a phone

Below 40rem of its own width (a container query, not the viewport), a grid becomes a list of cards. Each row is a card, every cell carries its column's label, the heading row is hidden visually (kept for screen readers), the filter row is hidden, and a Sort by menu replaces the clickable headings. Table roles are set explicitly while the layout is cards, because some browsers drop them when a table's `display` changes. Set `:cards="false"` to keep a scrolling table instead.

## Keyboard

| Key                     | Where              | Does                                                                                                          |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| Enter, Space            | A sortable heading | Cycles ascending, descending, off.                                                                            |
| Arrow Left, Arrow Right | A column edge      | Narrows or widens by 10px. With Shift, by 40px. (Reversed in right-to-left text.)                             |
| Home, Escape            | A column edge      | Back to the automatic width. A double click does the same.                                                    |
| Tab                     |                    | Reaches the scrolling region (so it can be scrolled with the arrow keys), the controls, and each column edge. |

## Accessibility

- A `table` with a `caption` and `th scope="col"` headings, inside a focusable `region` named by `caption`.
- A sortable heading holds a button and the `th` carries `aria-sort` (`none`, `ascending`, `descending`). A live region announces "Sorted by Name, ascending. 3 rows." after each change.
- The heading checkbox is named "Select all rows on this page" ("Select all rows" when virtual) and is mixed when some are selected; row checkboxes are named "Select row".
- A column edge is a focusable `separator` with `aria-valuenow` and `aria-valuemin`, named "Resize Name column".
- Filters are named "Filter Name", and the range inputs "Filter Amount minimum" and "Filter Amount maximum".
- Every string goes through `useMessages`. The range line ("Showing 1 to 10 of 25") follows the `showing` message.
- The skeleton animation, the edge highlight and the sort transitions stop under `prefers-reduced-motion`. The scrolling region opens up when printed.

## Rules

- Give every row a unique `id`. Selection is by id.
- Use `value` for a column whose cell is a node, so sorting and searching act on data, not on markup.
- Use `plain` for a short static list; use EStatementRow when each row should open to a card.
- A column filter is for a column people compare; do not filter on everything. Put search first.
- Fixed widths and `resizable` are for dense data. Prefer automatic widths and `cards` for content that must read on a phone.
