import { collator } from "../../composables/useLocale.js";
import type { DataGridColumn, DataGridFilterValue, DataGridRow } from "./types.js";

/** What a column shows to sort, filter and search on: `value(row)`, or `row[key]`. */
export function cellValue<Row extends DataGridRow>(row: Row, col: DataGridColumn<Row>): unknown {
  return col.value ? col.value(row) : row[col.key];
}

/** Lower case without accents, so "Zoe" finds "Zoë" and "cafe" finds "Café". */
export function foldText(s: unknown): string {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** A number from a cell value, or NaN when it holds none (an empty cell is not zero). */
function figure(value: unknown): number {
  if (typeof value === "number") return value;
  if (value == null || (typeof value === "string" && value.trim() === "")) return NaN;
  return Number(value);
}

/** Numbers and dates by size, anything else by text in natural order, in the order of `locale`. Missing values go last. */
export function compareValues(a: unknown, b: unknown, locale?: string): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return collator(locale).compare(String(a), String(b));
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

/** Whether a cell value passes a column's filter. `shown` gives the text the cell displays, which a text filter also matches; it is only asked for when the value itself does not match. */
export function passesFilter<Row extends DataGridRow>(
  col: DataGridColumn<Row>,
  value: unknown,
  f: DataGridFilterValue,
  shown?: () => string,
): boolean {
  if (col.filter?.type === "select") return String(value) === String(f);
  if (col.filter?.type === "number" && typeof f === "object") {
    const hasMin = f.min !== "" && f.min != null;
    const hasMax = f.max !== "" && f.max != null;
    if (!hasMin && !hasMax) return true;
    const n = figure(value);
    // A cell with no number is not between any bounds.
    if (Number.isNaN(n)) return false;
    if (hasMin && n < Number(f.min)) return false;
    if (hasMax && n > Number(f.max)) return false;
    return true;
  }
  const q = foldText(f);
  return foldText(value).includes(q) || (shown !== undefined && foldText(shown()).includes(q));
}
