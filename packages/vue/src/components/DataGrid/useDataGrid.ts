import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue";
import { cellValue, compareValues, filterActive, foldText, passesFilter } from "./grid.js";
import type { DataGridColumn, DataGridFilterValue, DataGridRow, DataGridSort } from "./types.js";

/** What decides which rows show, in what order, on which page. */
export interface DataGridState<Row extends DataGridRow> {
  /** The columns the search looks in: the shown ones. Filters look up any column by key. @default every column */
  searched?: MaybeRefOrGetter<DataGridColumn<Row>[]>;
  sort?: MaybeRefOrGetter<DataGridSort | null>;
  search?: MaybeRefOrGetter<string>;
  filters?: MaybeRefOrGetter<Record<string, DataGridFilterValue>>;
  /** From 1. */
  page?: MaybeRefOrGetter<number>;
  /** Rows per page; 0 shows every row. */
  pageSize?: MaybeRefOrGetter<number>;
  /** The rows are already the server's answer: nothing is filtered, sorted or sliced, and `total` counts them. */
  manual?: MaybeRefOrGetter<boolean>;
  /** With `manual`, how many rows there are in all. @default the number of rows */
  total?: MaybeRefOrGetter<number | undefined>;
  /** The locale text sorts in. */
  locale?: MaybeRefOrGetter<string | undefined>;
  /** The text a cell shows, which search and text filters also match (a formatted date or amount). @default the value as text */
  show?: (row: Row, column: DataGridColumn<Row>) => string;
}

export interface DataGridResult<Row> {
  /** The rows that pass the filters and the search. */
  filtered: ComputedRef<Row[]>;
  /** `filtered`, in the sort order. Equal values keep the order they were given in. */
  sorted: ComputedRef<Row[]>;
  /** The rows on the current page, or every sorted row when there is no paging. */
  view: ComputedRef<Row[]>;
  /** How many rows there are in all, across pages. */
  total: ComputedRef<number>;
  /** How many pages, at least 1. */
  pages: ComputedRef<number>;
  /** The page shown: `page`, held to the last page. */
  page: ComputedRef<number>;
}

/** Between the folded text of two cells, so a search never matches across a column edge. A person cannot type it. */
const SEP = "\u0001";

/**
 * The rows of a grid, without the grid: filter (the column filters, then one search over the searched columns), sort,
 * then the page, each a computed over the one before. The search runs against an index of each row's folded text,
 * built once per rows and columns rather than once per keystroke. A cell's shown text is only made when a filter or
 * the index needs it. @internal
 */
export function useDataGrid<Row extends DataGridRow>(
  rows: MaybeRefOrGetter<Row[]>,
  columns: MaybeRefOrGetter<DataGridColumn<Row>[]>,
  state: DataGridState<Row> = {},
): DataGridResult<Row> {
  const show = state.show ?? ((row, c) => String(cellValue(row, c) ?? ""));
  const manual = () => !!toValue(state.manual);
  const pageSize = () => toValue(state.pageSize) ?? 0;
  const byKey = computed(() => new Map(toValue(columns).map((c) => [c.key, c])));
  const searched = computed(() => toValue(state.searched) ?? toValue(columns));

  /** Each row's searchable text: per searched column its value and its shown text, folded. Independent of the query. */
  const index = computed(() =>
    toValue(rows).map((row) =>
      searched.value
        .map((c) => {
          const v = cellValue(row, c);
          return v == null ? "" : foldText(v) + SEP + foldText(show(row, c));
        })
        .join(SEP),
    ),
  );

  const filtered = computed<Row[]>(() => {
    const all = toValue(rows);
    if (manual()) return all;
    const filters = toValue(state.filters) ?? {};
    const active = Object.entries(filters).flatMap(([key, f]) => {
      const c = byKey.value.get(key);
      return c && filterActive(f) ? [{ c, f }] : [];
    });
    const needle = foldText((toValue(state.search) ?? "").trim());
    if (!active.length && !needle) return all;
    const text = needle ? index.value : undefined;
    return all.filter(
      (row, i) =>
        active.every(({ c, f }) => passesFilter(c, cellValue(row, c), f, () => show(row, c))) &&
        (!text || text[i]!.includes(needle)),
    );
  });

  const sorted = computed<Row[]>(() => {
    const s = toValue(state.sort);
    const c = s ? byKey.value.get(s.key) : undefined;
    if (manual() || !s || !c?.sortable) return filtered.value;
    const sign = s.dir === "desc" ? -1 : 1;
    const locale = toValue(state.locale);
    return filtered.value
      .map((row, i) => ({ row, i, v: cellValue(row, c) }))
      .sort((a, b) => sign * compareValues(a.v, b.v, locale) || a.i - b.i)
      .map((x) => x.row);
  });

  const total = computed(() => (manual() ? (toValue(state.total) ?? toValue(rows).length) : sorted.value.length));
  const pages = computed(() => (pageSize() > 0 ? Math.max(1, Math.ceil(total.value / pageSize())) : 1));
  const page = computed(() => Math.min(Math.max(1, toValue(state.page) ?? 1), pages.value));
  const view = computed<Row[]>(() => {
    const size = pageSize();
    if (manual() || size <= 0) return sorted.value;
    const start = (page.value - 1) * size;
    return sorted.value.slice(start, start + size);
  });

  return { filtered, sorted, view, total, pages, page };
}
