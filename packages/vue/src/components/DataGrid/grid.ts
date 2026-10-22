import type { DataGridColumn, DataGridFilterValue, DataGridRow } from "./types.js";

/** What a column shows to sort, filter and search on: `value(row)`, or `row[key]`. */
export function cellValue<Row extends DataGridRow>(row: Row, col: DataGridColumn<Row>): unknown {
  return col.value ? col.value(row) : row[col.key];
}

/** Numbers and dates by size, anything else by text in natural order. Missing values go last. */
export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/** A width in pixels from a number or a "120px" string, or nothing for any other unit. */
export function parsePx(w: number | string | undefined): number | null {
  if (typeof w === "number") return w;
  if (typeof w === "string" && /px$/.test(w)) return parseFloat(w);
  return null;
}

/** Whether a filter holds something to filter by. */
export function filterActive(f: DataGridFilterValue | undefined): boolean {
  if (f == null || f === "") return false;
  if (typeof f === "object") return !((f.min === "" || f.min == null) && (f.max === "" || f.max == null));
  return true;
}

/** Whether a cell value passes a column's filter. */
export function passesFilter<Row extends DataGridRow>(
  col: DataGridColumn<Row>,
  value: unknown,
  f: DataGridFilterValue,
): boolean {
  if (col.filter?.type === "select") return String(value) === String(f);
  if (col.filter?.type === "number" && typeof f === "object") {
    const n = Number(value);
    if (f.min !== "" && f.min != null && n < Number(f.min)) return false;
    if (f.max !== "" && f.max != null && n > Number(f.max)) return false;
    return true;
  }
  return String(value == null ? "" : value)
    .toLowerCase()
    .includes(String(f).toLowerCase());
}
