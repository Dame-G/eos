import { describe, expect, test } from "vitest";
import { ref } from "vue";
import { useDataGrid } from "./useDataGrid.js";
import type { DataGridColumn, DataGridFilterValue, DataGridSort } from "./types.js";

type Row = { id: number; n: string; a: number };
const ROWS: Row[] = [
  { id: 1, n: "Zoë", a: 5 },
  { id: 2, n: "item 10", a: 9 },
  { id: 3, n: "item 2", a: 1 },
];
const COLS: DataGridColumn<Row>[] = [
  { key: "n", label: "Name", sortable: true, filter: { type: "text" } },
  { key: "a", label: "Amount", sortable: true, filter: { type: "number" } },
];

describe("useDataGrid", () => {
  test("filters, searches without accents, sorts in natural order and pages", () => {
    const search = ref("");
    const sort = ref<DataGridSort | null>({ key: "n", dir: "asc" });
    const filters = ref<Record<string, DataGridFilterValue>>({});
    const page = ref(1);
    const g = useDataGrid(ROWS, COLS, { search, sort, filters, page, pageSize: 2 });
    expect(g.sorted.value.map((r) => r.id)).toEqual([3, 2, 1]);
    expect(g.view.value.map((r) => r.id)).toEqual([3, 2]);
    expect(g.pages.value).toBe(2);
    page.value = 9;
    expect(g.page.value).toBe(2);
    expect(g.view.value.map((r) => r.id)).toEqual([1]);
    search.value = "zoe";
    expect(g.filtered.value.map((r) => r.id)).toEqual([1]);
    search.value = "";
    filters.value = { a: { min: "2", max: "" } };
    expect(g.filtered.value.map((r) => r.id)).toEqual([1, 2]);
    expect(g.total.value).toBe(2);
  });

  test("the search index is built once per rows and columns, not per keystroke, and never matches across columns", () => {
    let shown = 0;
    const search = ref("");
    const g = useDataGrid(ROWS, COLS, {
      search,
      show: (row, c) => {
        shown++;
        return String(row[c.key as keyof Row]);
      },
    });
    for (const q of ["i", "it", "ite", "item", "item 1"]) {
      search.value = q;
      void g.filtered.value;
    }
    expect(shown).toBe(ROWS.length * COLS.length);
    search.value = "zoë5";
    expect(g.filtered.value).toEqual([]);
  });

  test("a filter only asks for the shown text when the value does not match", () => {
    let shown = 0;
    const g = useDataGrid(ROWS, COLS, {
      filters: { n: "item" },
      show: () => {
        shown++;
        return "";
      },
    });
    expect(g.filtered.value).toHaveLength(2);
    expect(shown).toBe(1);
  });

  test("manual leaves the rows as the server sent them, and counts total", () => {
    const g = useDataGrid(ROWS, COLS, { manual: true, sort: { key: "n", dir: "desc" }, pageSize: 2, total: 40 });
    expect(g.view.value).toBe(ROWS);
    expect(g.pages.value).toBe(20);
  });
});
