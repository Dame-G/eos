# EDataGrid

A `table` with sorting, per-column filters, search, resizing, column toggling, row selection, and paging or virtual scrolling for thousands of rows. Use [`ETable`](../Table/README.md) for a short list that is only read.

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

| Prop                | Type                                  | Default                | Notes                                                                                                                                                                                                    |
| ------------------- | ------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sort`              | `DataGridSort \| null`                | `null`                 | `v-model:sort`: the sort: `{ key, dir: "asc" \| "desc" }`, or `null` for none.                                                                                                                           |
| `page`              | `number`                              | `1`                    | `v-model:page`: the current page, from 1.                                                                                                                                                                |
| `search`            | `string`                              | `""`                   | `v-model:search`: the text in the search box.                                                                                                                                                            |
| `filters`           | `Record<string, DataGridFilterValue>` | `{}`                   | `v-model:filters`: the column filters, by column `key`: text, or `{ min, max }` strings for `number`.                                                                                                    |
| `selected`          | `Row["id"][]`                         | `[]`                   | `v-model:selected`: the selected row ids, as they are on the rows (numbers stay numbers), kept across pages and filters.                                                                                 |
| `columns`           | `DataGridColumn<Row>[]`               | **Required**           | The columns, in order. See `DataGridColumn` below.                                                                                                                                                       |
| `rows`              | `Row[]`                               | **Required**           | The rows. Each needs a unique `id`, and selection is by id.                                                                                                                                              |
| `caption`           | `string`                              | **Required**           | Names the table for screen readers, and its scrolling region.                                                                                                                                            |
| `searchable`        | `boolean`                             | `false`                | One search box over all shown columns.                                                                                                                                                                   |
| `searchPlaceholder` | `string`                              | `"Search all columns"` | The search box's placeholder.                                                                                                                                                                            |
| `filterable`        | `boolean`                             | `false`                | Shows a filter row under the headings, for columns that define a `filter`.                                                                                                                               |
| `resizable`         | `boolean`                             | `false`                | Lets people drag column edges, or move them with the arrow keys.                                                                                                                                         |
| `stickyFirst`       | `boolean`                             | `false`                | Keeps the first column in view while scrolling sideways.                                                                                                                                                 |
| `columnToggle`      | `boolean`                             | `false`                | Shows a Columns menu to show and hide columns.                                                                                                                                                           |
| `selectable`        | `boolean`                             | `false`                | Shows a checkbox on each row and a select-all in the heading.                                                                                                                                            |
| `pageSize`          | `number`                              | `10`                   | Rows per page. 0 turns paging off.                                                                                                                                                                       |
| `maxHeight`         | `string`                              | None                   | Stops the table growing past this height (any CSS length) and scrolls inside it, with a sticky header.                                                                                                   |
| `virtual`           | `boolean \| DataGridVirtual`          | None                   | Renders only the rows in view, for thousands of rows. Replaces paging. `true` or `{ rowHeight = 48, height = 440, overscan = 8 }`.                                                                       |
| `cards`             | `boolean`                             | `true`                 | Turns rows into cards below 40rem of the grid's own width. `virtual` and `resizable` grids keep the table.                                                                                               |
| `manual`            | `boolean`                             | `false`                | Marks the data as living on a server. The grid shows the rows given, in the order given, and reports every change through `queryChange`, once on mount too, so the first fetch needs no code of its own. |
| `searchDebounce`    | `number`                              | `0`                    | With `manual`, how many milliseconds to wait after the last keystroke in the search box or a text or number filter before `queryChange`. Other changes report at once.                                   |
| `total`             | `number`                              | None                   | With `manual`, how many rows there are in all.                                                                                                                                                           |
| `loading`           | `boolean`                             | `false`                | Marks the data as loading, with `aria-busy`. With no rows yet it shows placeholder rows; with rows (the previous page) they stay, dimmed, until the new ones arrive.                                     |
| `skeletonRows`      | `number`                              | `5`                    | How many placeholder rows `loading` shows, 5 as in `ETable`. As cards each placeholder is a whole card, so a phone shows fewer of them at once.                                                          |
| `emptyTitle`        | `string`                              | `"No results"`         | The title when there are no rows.                                                                                                                                                                        |
| `emptyText`         | `string`                              | None                   | The sentence under the empty title, when there are no rows.                                                                                                                                              |
| `emptyIcon`         | `IconProp`                            | `"search"`             | The icon above the empty title.                                                                                                                                                                          |
| `error`             | `boolean \| string`                   | None                   | Shows a failed load in place of the rows. `true` says the default sentence; a string says your own. A "Try again" button emits `retry`.                                                                  |
| `rowLabel`          | `(row: Row) => string`                | None                   | The name of a row for its checkbox ("Select Annual check-up"), when the first column's text is not a good one.                                                                                           |

`Row` is a type parameter, inferred from the props you pass. It extends `DataGridRow`.

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. `selected` holds ids as the rows have them (a numeric `id` stays a number). Text sorts in the configured locale, and search and text filters ignore case and accents. The search also matches the text a cell shows, such as a formatted date. A number filter skips cells that hold no number.

For a short static list with no toolbar, filters or paging, use [`ETable`](../Table/README.md).

A `DataGridColumn` has:

| Field       | Type                                                                    | Notes                                                                                                                                      |
| ----------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `key`       | `string`                                                                | Required. The default cell shows `row[key]`.                                                                                               |
| `label`     | `string`                                                                | Required. Heading and control names.                                                                                                       |
| `sortable`  | `boolean`                                                               | The heading becomes a button: ascending, descending, off.                                                                                  |
| `numeric`   | `boolean`                                                               | Right-aligns the column and shows figures in a monospaced font.                                                                            |
| `align`     | `"center"`                                                              | Centres the column.                                                                                                                        |
| `width`     | `number \| string`                                                      | Pixels, as a number or `"140px"`. Fixes the table layout.                                                                                  |
| `minWidth`  | `number`                                                                | Least width when resizing. Default 72.                                                                                                     |
| `maxWidth`  | `number`                                                                | Most width when resizing. Default 960.                                                                                                     |
| `format`    | `"number" \| "currency" \| "date" \| (value, row) => string`            | How the default cell writes its value, in the configured locale. A `Date` shows as a date, and a number in a `numeric` column as a number. |
| `resizable` | `boolean`                                                               | `false` excludes the column from resizing.                                                                                                 |
| `value`     | `(row) => string \| number \| Date \| null \| undefined`                | What sorts, filters and searches. Set it when the cell is a slot.                                                                          |
| `filter`    | `{ type: "text" }`, `{ type: "select", options }`, `{ type: "number" }` | `number` is a minimum and maximum.                                                                                                         |

## Slots

| Slot           | Use                                                    |
| -------------- | ------------------------------------------------------ |
| `cell-<key>`   | Cell content, with `{ row, value }` in scope.          |
| `header-<key>` | Replaces the column label, with `{ column }` in scope. |
| `bulk-actions` | Buttons beside the "n selected" count.                 |
| `toolbar`      | Extra content in the bar above the table.              |
| `error`        | Your own failed-load state, when `error` is set.       |

## Events

| Event         | Payload                                     | Notes                                                                                           |
| ------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `queryChange` | `{ sort, page, pageSize, search, filters }` | `pageSize` is 0 without paging. With `manual` it also fires once on mount, for the first fetch. |
| `retry`       | none                                        | The Try again button of the `error` state was pressed. Fetch again.                             |

## Accessibility

- A `table` with `caption`, `th scope="col"` and `aria-sort`. Sort changes and the number of rows are announced, and so is each change of selection ("3 selected"). The scroller becomes a focusable region named by `caption` only while it scrolls.
- Each row checkbox is named "Select <first column's text>". Set `rowLabel` when the first column is not a good name.
- Below 40rem, with `cards`, the heading row is `inert` (the Sort by menu replaces its buttons, and with `filterable` the filters move above the cards as fields labelled by their column), so no hidden control takes focus.
- While `loading` with rows already shown (the previous page), the rows stay, dimmed, and the table is `aria-busy`. With no rows, placeholder rows show.
- `error` replaces the rows with a message and a Try again button, which emits `retry`.
- Column edges are focusable separators with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`. Dragging or the arrow keys change the width within `minWidth` and `maxWidth`.
- Virtual grids set `aria-rowcount` and `aria-rowindex`.
- All strings are configurable messages.

## Keyboard

| Key                                | Action                                             |
| ---------------------------------- | -------------------------------------------------- |
| Enter, Space on a heading          | Sorts ascending, then descending, then off.        |
| Arrow Left, Arrow Right on an edge | Narrows or widens the column by 10px (Shift 40px). |
| Home on an edge                    | Goes back to the automatic width.                  |
| Escape on an edge, or in a drag    | Goes back to the width it had before.              |

The scrolling region is a tab stop only while it scrolls; its arrow keys scroll it.

## Related

[`ETable`](../Table/README.md) for a plain table, [`EPagination`](../Pagination/README.md) on its own, [`ESkeleton`](../Skeleton/README.md) for the loading rows.
