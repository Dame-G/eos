import type { EOptionInput } from "../Select/options.js";

/** A row: any object with a unique `id`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataGridRow = { id: string | number } & Record<string, any>;

/** What a column filters on: free text, a choice from a list, or a minimum and maximum. */
export type DataGridFilter =
  { type: "text" } | { type: "select"; options: readonly EOptionInput[] } | { type: "number" };

/** What a filter holds: text for `text` and `select`, `{ min, max }` (strings, either may be empty) for `number`. */
export type DataGridFilterValue = string | { min: string; max: string };

/** One column of a DataGrid. */
export interface DataGridColumn<Row = DataGridRow> {
  /** Identifies the column; the default cell shows `row[key]`. */
  key: string;
  /** The heading, also the label of each cell on a phone and the name of the column's controls. */
  label: string;
  /** The heading becomes a button that cycles ascending, descending, off. */
  sortable?: boolean;
  /** Right-aligned, monospaced figures. */
  numeric?: boolean;
  /** Centre the column. */
  align?: "center";
  /** A width in pixels (a number, or a string ending in `px`). Setting any width makes the table layout fixed. */
  width?: number | string;
  /** The least width, in pixels, the column can be dragged to. Default 72. */
  minWidth?: number;
  /** Set to `false` to take this column out of resizing. */
  resizable?: boolean;
  /** What the column sorts, filters and searches on, when it is not `row[key]` (a cell that shows a node, a date). */
  value?: (row: Row) => string | number | Date | null | undefined;
  /** A filter in the filter row (shown when the grid is `filterable`). */
  filter?: DataGridFilter;
}

/** The column being sorted and the direction. */
export interface DataGridSort {
  key: string;
  dir: "asc" | "desc";
}

/** Everything that decides which rows a server should send. */
export interface DataGridQuery {
  sort: DataGridSort | null;
  /** From 1. */
  page: number;
  /** 0 when the grid does not page (virtual rows). */
  pageSize: number;
  search: string;
  filters: Record<string, DataGridFilterValue>;
}

/** Options for `virtual`. */
export interface DataGridVirtual {
  /** Height of every row in pixels. Default 48. */
  rowHeight?: number;
  /** Height of the scrolling area in pixels. Default 440. */
  height?: number;
  /** Rows rendered beyond the edges of the scrolling area. Default 8. */
  overscan?: number;
}
