/* eslint-disable @typescript-eslint/no-explicit-any -- the grid is generic over the row, which the tests leave open */
import { describe, expect, test, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDataGrid from "./EDataGrid.vue";
import { createEos } from "../../plugin.js";
import type { DataGridColumn, DataGridSort } from "./types.js";
import { expectNoViolations } from "../../../test/axe.js";

type Row = { id: number | string; n: string; a: number; s?: string };
const ROWS: Row[] = [
  { id: 1, n: "Beta", a: 5, s: "paid" },
  { id: 2, n: "Alpha", a: 9, s: "due" },
  { id: 3, n: "Gamma", a: 1, s: "paid" },
];
const COLS: DataGridColumn<Row>[] = [
  { key: "n", label: "Name", sortable: true },
  { key: "a", label: "Amount", numeric: true, sortable: true },
];
const FILTER_COLS: DataGridColumn<Row>[] = [
  { key: "n", label: "Name", sortable: true, filter: { type: "text" } },
  { key: "s", label: "Status", filter: { type: "select", options: ["paid", "due"] } },
  { key: "a", label: "Amount", numeric: true, filter: { type: "number" } },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const grid = (opts: { props: Record<string, unknown>; slots?: Record<string, unknown> }) =>
  render(EDataGrid as any, { ...opts, props: { cards: false, ...opts.props } } as any);
const bodyRows = (c: Element) => [...c.querySelectorAll("tbody tr:not(.e-spacer)")] as HTMLElement[];
const names = (c: Element) => bodyRows(c).map((r) => r.querySelector("td[data-label]")?.textContent?.trim());
const bigRows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i, n: `Row ${i}`, a: i }));
const input = (el: Element | null) => el as HTMLInputElement;
async function typeInto(el: HTMLInputElement, text: string) {
  el.focus();
  el.value = text;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  await nextTick();
  await wait(20);
}
function boxed(width: number, props: Record<string, unknown>) {
  return defineComponent({
    render: () => h("div", { style: { width: `${width}px` } }, [h(EDataGrid as any, props)]),
  });
}

describe("EDataGrid", () => {
  test("sort cycles ascending, descending, off; search filters; select all counts; cells carry labels", async () => {
    const picked: string[][] = [];
    const { container } = await grid({
      props: {
        caption: "Test",
        searchable: true,
        selectable: true,
        columns: COLS,
        rows: ROWS,
        "onUpdate:selected": (ids: string[]) => picked.push(ids),
      },
    });
    const th = () => container.querySelectorAll("th")[1]!;
    expect(th().getAttribute("aria-sort")).toBe("none");
    (th().querySelector("button") as HTMLButtonElement).click();
    await wait(30);
    expect(th().getAttribute("aria-sort")).toBe("ascending");
    expect(names(container)).toEqual(["Alpha", "Beta", "Gamma"]);
    (th().querySelector("button") as HTMLButtonElement).click();
    await wait(30);
    expect(th().getAttribute("aria-sort")).toBe("descending");
    expect(names(container)).toEqual(["Gamma", "Beta", "Alpha"]);
    (th().querySelector("button") as HTMLButtonElement).click();
    await wait(30);
    expect(th().getAttribute("aria-sort")).toBe("none");
    expect(names(container)).toEqual(["Beta", "Alpha", "Gamma"]);
    await typeInto(input(container.querySelector(".e-grid-search input")), "alp");
    expect(names(container)).toEqual(["Alpha"]);
    expect(container.querySelector("td[data-label]")).not.toBeNull();
    await typeInto(input(container.querySelector(".e-grid-search input")), "");
    (container.querySelector("thead .e-check") as HTMLInputElement).click();
    await wait(30);
    expect(picked.at(-1)!.length).toBe(3);
  });

  test("is a real table: a caption, column headers with scope, cells; a named region only while it scrolls", async () => {
    const { container } = await grid({ props: { caption: "Payments", columns: COLS, rows: ROWS } });
    const scroller = container.querySelector(".e-grid-scroll")!;
    expect(scroller.hasAttribute("role")).toBe(false);
    expect(scroller.hasAttribute("tabindex")).toBe(false);

    await expect.element(page.getByRole("table")).toBeVisible();
    expect(container.querySelector("caption")!.textContent!.trim()).toBe("Payments");
    expect(page.getByRole("columnheader").elements().length).toBe(2);
    expect([...container.querySelectorAll("th")].every((c) => c.getAttribute("scope") === "col")).toBe(true);
    expect(page.getByRole("cell").elements().length).toBe(6);
  });

  test("a height limit makes the scroller a named, focusable region", async () => {
    const { container } = await grid({ props: { caption: "Payments", columns: COLS, rows: ROWS, maxHeight: "60px" } });
    await expect.element(page.getByRole("region", { name: "Payments" })).toBeVisible();
    expect(container.querySelector(".e-grid-scroll")!.getAttribute("tabindex")).toBe("0");
  });

  test("numbers sort by size, text in natural order, missing values last; value() feeds the sort", async () => {
    const rows = [
      { id: 1, n: "item 10", a: 10 },
      { id: 2, n: "item 2", a: 9 },
      { id: 3, n: "item 1", a: 100 },
    ];
    const { container } = await grid({
      props: {
        caption: "T",
        columns: [
          { key: "n", label: "Name", sortable: true },
          { key: "a", label: "Amount", sortable: true, value: (r: Row) => r.a },
        ],
        rows,
        sort: { key: "a", dir: "asc" },
      },
    });
    expect(names(container)).toEqual(["item 2", "item 10", "item 1"]);
    (container.querySelectorAll("th")[0]!.querySelector("button") as HTMLButtonElement).click();
    await wait(30);
    expect(names(container)).toEqual(["item 1", "item 2", "item 10"]);
  });

  test("keyboard: Enter and Space on a heading sort it, and the change is announced", async () => {
    const { container } = await grid({ props: { caption: "T", columns: COLS, rows: ROWS } });
    const btn = container.querySelectorAll("th")[0]!.querySelector("button") as HTMLButtonElement;
    btn.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => container.querySelector("th")!.getAttribute("aria-sort")).toBe("ascending");
    const status = container.querySelector("[role=status]")!;
    expect(status.textContent).toBe("Sorted by Name, ascending. 3 rows.");
    await userEvent.keyboard(" ");
    await expect.poll(() => container.querySelector("th")!.getAttribute("aria-sort")).toBe("descending");
    expect(status.textContent).toBe("Sorted by Name, descending. 3 rows.");
    expect(names(container)).toEqual(["Gamma", "Beta", "Alpha"]);
  });

  test("v-model:sort round trip: the model sorts, a click reports, an outside change re-sorts", async () => {
    const sort = ref<DataGridSort | null>({ key: "n", dir: "desc" });
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EDataGrid as any, {
            cards: false,
            caption: "T",
            columns: COLS,
            rows: ROWS,
            sort: sort.value,
            "onUpdate:sort": (v: DataGridSort | null) => (sort.value = v),
          }),
      }),
    );
    expect(names(container)).toEqual(["Gamma", "Beta", "Alpha"]);
    (container.querySelectorAll("th")[1]!.querySelector("button") as HTMLButtonElement).click();
    await wait(30);
    expect(sort.value).toEqual({ key: "a", dir: "asc" });
    expect(names(container)).toEqual(["Gamma", "Beta", "Alpha"]);
    sort.value = null;
    await wait(30);
    expect(names(container)).toEqual(["Beta", "Alpha", "Gamma"]);
  });

  test("a heading that is not sortable is plain text without aria-sort", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: [{ key: "n", label: "Name" }], rows: ROWS },
    });
    const th = container.querySelector("th")!;
    expect(th.hasAttribute("aria-sort")).toBe(false);
    expect(th.querySelector("button")).toBeNull();
  });

  test("column filters: text, select and number range, with a filter row and Clear filters", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: FILTER_COLS, rows: ROWS, filterable: true },
    });
    expect(container.querySelector(".e-filterrow")).not.toBeNull();
    await typeInto(input(page.getByLabelText("Filter Name").element()), "a");
    expect(names(container)).toEqual(["Beta", "Alpha", "Gamma"]);
    await typeInto(input(page.getByLabelText("Filter Name").element()), "alp");
    expect(names(container)).toEqual(["Alpha"]);
    await page.getByRole("button", { name: "Clear filters" }).first().click();
    await wait(30);
    expect(names(container)).toEqual(["Beta", "Alpha", "Gamma"]);
    expect(container.querySelector<HTMLInputElement>('input[type="search"]')!.value).toBe("");

    await typeInto(input(page.getByLabelText("Filter Amount minimum").element()), "5");
    expect(names(container)).toEqual(["Beta", "Alpha"]);
    await typeInto(input(page.getByLabelText("Filter Amount maximum").element()), "6");
    expect(names(container)).toEqual(["Beta"]);

    await page.getByRole("button", { name: "Clear filters" }).first().click();
    await page.getByRole("combobox", { name: "Filter Status" }).click();
    await page.getByRole("option", { name: "due" }).click();
    await expect.poll(() => names(container)).toEqual(["Alpha"]);
    await page.getByRole("combobox", { name: "Filter Status" }).click();
    await page.getByRole("option", { name: "All" }).click();
    await expect.poll(() => names(container)).toEqual(["Beta", "Alpha", "Gamma"]);
  });

  test("v-model:filters and v-model:search round trip", async () => {
    const filters = ref<Record<string, any>>({ n: "a" });
    const search = ref("");
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EDataGrid as any, {
            cards: false,
            caption: "T",
            columns: FILTER_COLS,
            rows: ROWS,
            filterable: true,
            searchable: true,
            filters: filters.value,
            search: search.value,
            "onUpdate:filters": (v: any) => (filters.value = v),
            "onUpdate:search": (v: string) => (search.value = v),
          }),
      }),
    );
    expect(page.getByLabelText("Filter Name").element()).toHaveProperty("value", "a");
    await typeInto(input(page.getByLabelText("Filter Name").element()), "alp");
    expect(filters.value["n"]).toBe("alp");
    await typeInto(input(container.querySelector(".e-grid-search input")), "al");
    expect(search.value).toBe("al");
    expect(names(container)).toEqual(["Alpha"]);
  });

  test("search looks only in the shown columns", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: FILTER_COLS, rows: ROWS, searchable: true, columnToggle: true },
    });
    await typeInto(input(container.querySelector(".e-grid-search input")), "due");
    expect(names(container)).toEqual(["Alpha"]);
    await page.getByRole("button", { name: "Choose columns" }).click();
    await page.getByRole("checkbox", { name: "Status" }).click();
    await expect.poll(() => container.querySelector(".e-grid-empty")).not.toBeNull();
  });

  test("no rows: an empty state with the title and text; no matches: Clear filters in it", async () => {
    const empty = await grid({ props: { caption: "T", columns: COLS, rows: [] } });
    await expect.element(page.getByRole("heading", { name: "No results" })).toBeVisible();
    expect(empty.container.textContent).toContain("There is nothing to show yet.");
    expect(empty.container.querySelector(".e-grid-range")!.textContent).toBe("0 rows");
    empty.unmount();

    const { container } = await grid({
      props: { caption: "T", columns: COLS, rows: ROWS, searchable: true, emptyTitle: "Nothing here" },
    });
    await typeInto(input(container.querySelector(".e-grid-search input")), "zzz");
    await expect.element(page.getByRole("heading", { name: "Nothing here" })).toBeVisible();
    expect(container.textContent).toContain("Nothing matches these filters.");
    const clear = container.querySelector(".e-grid-empty button") as HTMLButtonElement;
    expect(clear.textContent).toContain("Clear filters");
    clear.click();
    await wait(30);
    expect(names(container)).toEqual(["Beta", "Alpha", "Gamma"]);
  });

  test("loading shows placeholder rows and marks the table busy", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: COLS, rows: [], loading: true, selectable: true },
    });
    expect(container.querySelectorAll(".e-skel").length).toBe(10);
    expect(container.querySelector("table")!.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector("[role=status]")!.textContent).toBe("Loading");
    expect(container.querySelector(".e-empty")).toBeNull();
  });

  test("selection: v-model:selected, count with bulk actions, page select-all with a mixed state", async () => {
    const selected = ref<(string | number)[]>([2]);
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            EDataGrid as any,
            {
              caption: "T",
              columns: COLS,
              rows: ROWS,
              selectable: true,
              selected: selected.value,
              "onUpdate:selected": (v: (string | number)[]) => (selected.value = v),
            },
            { "bulk-actions": () => h("button", { type: "button" }, "Download") },
          ),
      }),
    );
    expect(container.querySelector(".e-grid-count")!.textContent).toBe("1 selected");
    expect(page.getByRole("button", { name: "Download" }).elements().length).toBe(1);
    const rows = bodyRows(container);
    expect(rows[1]!.hasAttribute("data-selected")).toBe(true);
    const all = container.querySelector("thead .e-check") as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    expect(all.checked).toBe(false);
    expect(all.closest("label")!.textContent).toContain("Select all rows on this page");
    (rows[0]!.querySelector(".e-check") as HTMLInputElement).click();
    await wait(30);
    expect(selected.value.sort()).toEqual([1, 2]);
    all.click();
    await wait(30);
    expect(selected.value.sort()).toEqual([1, 2, 3]);
    expect(all.checked).toBe(true);
    all.click();
    await wait(30);
    expect(selected.value).toEqual([]);
    expect(container.querySelector(".e-grid-count")).toBeNull();
  });

  test("selection stays when the page changes and select-all covers the current page only", async () => {
    const { container } = await grid({
      props: {
        caption: "T",
        columns: [{ key: "n", label: "Name" }],
        rows: bigRows(25),
        selectable: true,
        pageSize: 10,
      },
    });
    (container.querySelector("thead .e-check") as HTMLInputElement).click();
    await wait(30);
    expect(container.querySelector(".e-grid-count")!.textContent).toBe("10 selected");
    await page.getByRole("button", { name: "Next" }).click();
    await wait(30);
    expect(names(container)[0]).toBe("Row 10");
    expect((container.querySelector("thead .e-check") as HTMLInputElement).checked).toBe(false);
    (container.querySelector("tbody .e-check") as HTMLInputElement).click();
    await wait(30);
    expect(container.querySelector(".e-grid-count")!.textContent).toBe("11 selected");
  });

  test("paging: a range line, Pagination, page size, v-model:page, and the page is clamped when rows shrink", async () => {
    const pageNo = ref(1);
    const rows = ref(bigRows(25));
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EDataGrid as any, {
            cards: false,
            caption: "T",
            columns: [{ key: "n", label: "Name" }],
            rows: rows.value,
            pageSize: 10,
            searchable: true,
            page: pageNo.value,
            "onUpdate:page": (p: number) => (pageNo.value = p),
          }),
      }),
    );
    expect(container.querySelector(".e-grid-range")!.textContent).toMatch(/^Showing 1\D+10 of 25$/);
    expect(bodyRows(container).length).toBe(10);
    // The page list may be hidden when the pager is narrow, so press the button itself.
    container.querySelector<HTMLElement>('.e-pager [aria-label="Page 3"]')!.click();
    await wait(30);
    expect(pageNo.value).toBe(3);
    expect(names(container)).toHaveLength(5);
    expect(container.querySelector(".e-grid-range")!.textContent).toMatch(/^Showing 21\D+25 of 25$/);
    rows.value = bigRows(12);
    await wait(30);
    expect(pageNo.value).toBe(2);
    expect(names(container)).toEqual(["Row 10", "Row 11"]);
    await typeInto(input(container.querySelector(".e-grid-search input")), "Row 1");
    expect(pageNo.value).toBe(1);
  });

  test("a single page has no Pagination, and pageSize 0 shows every row", async () => {
    const one = await grid({ props: { caption: "T", columns: COLS, rows: ROWS } });
    expect(one.container.querySelector(".e-pager")).toBeNull();
    one.unmount();
    const all = await grid({
      props: { caption: "T", columns: [{ key: "n", label: "Name" }], rows: bigRows(30), pageSize: 0 },
    });
    expect(bodyRows(all.container).length).toBe(30);
    expect(all.container.querySelector(".e-grid-range")!.textContent).toBe("30 rows");
  });

  test("column menu shows and hides columns", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: COLS, rows: ROWS, columnToggle: true },
    });
    expect(container.querySelectorAll("thead th").length).toBe(2);
    await page.getByRole("button", { name: "Choose columns" }).click();
    await expect.element(page.getByRole("dialog", { name: "Choose columns" })).toBeVisible();
    await page.getByRole("checkbox", { name: "Amount" }).click();
    await expect.poll(() => container.querySelectorAll("thead th").length).toBe(1);
    expect(container.querySelectorAll("tbody tr:first-child td").length).toBe(1);
    await page.getByRole("checkbox", { name: "Amount" }).click();
    await expect.poll(() => container.querySelectorAll("thead th").length).toBe(2);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector("[role=dialog]")).toBeNull();
  });

  test("sticky first column: marked, offset past the checkbox column", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: COLS, rows: ROWS, stickyFirst: true, selectable: true },
    });
    const sticky = [...container.querySelectorAll(".e-sticky")] as HTMLElement[];
    expect(sticky.length).toBe(4);
    expect(sticky.every((c) => getComputedStyle(c).insetInlineStart === "52px")).toBe(true);
    expect(getComputedStyle(sticky[0]!).position).toBe("sticky");
    expect(container.querySelectorAll("tbody tr:first-child td")[1]!.classList.contains("e-sticky")).toBe(true);
  });

  test("resizing: separators are keyboard operable and reset with Home, Escape or double click", async () => {
    const { container } = await grid({
      props: {
        caption: "T",
        columns: [
          { key: "n", label: "Name", width: 900 },
          { key: "a", label: "Amount", width: 900, resizable: false },
        ],
        rows: ROWS,
        resizable: true,
      },
    });
    const seps = container.querySelectorAll<HTMLElement>("[role=separator]");
    expect(seps.length).toBe(1);
    const sep = seps[0]!;
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
    expect(sep.getAttribute("aria-label")).toBe("Resize Name column");
    expect(sep.getAttribute("aria-valuenow")).toBe("900");
    expect(sep.getAttribute("aria-valuemin")).toBe("72");
    const colWidth = () => (container.querySelector("col") as HTMLElement).style.width;
    expect(colWidth()).toBe("900px");
    sep.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => colWidth()).toBe("910px");
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
    await expect.poll(() => colWidth()).toBe("950px");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => colWidth()).toBe("940px");
    expect(sep.getAttribute("aria-valuenow")).toBe("940");
    await userEvent.keyboard("{Home}");
    await expect.poll(() => colWidth()).toBe("900px");
    await userEvent.keyboard("{ArrowRight}{Escape}");
    await expect.poll(() => colWidth()).toBe("900px");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => colWidth()).toBe("910px");
    sep.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    await expect.poll(() => colWidth()).toBe("900px");
  });

  test("resizing: dragging the edge widens the column, never below its minimum, and keeps the table layout", async () => {
    const { container } = await grid({
      props: {
        caption: "T",
        columns: [{ key: "n", label: "Name", width: 2000, minWidth: 100 }],
        rows: ROWS,
        resizable: true,
      },
    });
    const sep = container.querySelector<HTMLElement>("[role=separator]")!;
    const colWidth = () => (container.querySelector("col") as HTMLElement).style.width;
    const x = sep.getBoundingClientRect().left;
    sep.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: x }));
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x + 60 }));
    await expect.poll(() => colWidth()).toBe("2060px");
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x - 5000 }));
    await expect.poll(() => colWidth()).toBe("100px");
    window.dispatchEvent(new PointerEvent("pointerup"));
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x + 300 }));
    await wait(30);
    expect(colWidth()).toBe("100px");
    expect(container.querySelector("table")!.classList.contains("e-gridtable--fixed")).toBe(true);
    expect(getComputedStyle(container.querySelector("table")!).tableLayout).toBe("fixed");
    expect(container.querySelector(".e-grid--cards")).toBeNull();
  });

  test("virtual rows: only a window of 2000 rows is rendered, with aria-rowcount and aria-rowindex, and it follows the scroll", async () => {
    const { container } = await grid({
      props: {
        caption: "Big",
        virtual: { height: 300, rowHeight: 40 },
        columns: [{ key: "n", label: "Name" }],
        rows: bigRows(2000),
      },
    });
    const count = () => bodyRows(container).length;
    await expect.poll(() => count()).toBeGreaterThan(5);
    expect(count()).toBeLessThan(60);
    const table = container.querySelector("table")!;
    expect(table.getAttribute("aria-rowcount")).toBe("2001");
    expect(bodyRows(container)[0]!.getAttribute("aria-rowindex")).toBe("2");
    expect(container.querySelector(".e-grid-range")!.textContent).toBe("2000 rows");
    expect(container.querySelector(".e-pager")).toBeNull();
    const scroll = container.querySelector<HTMLElement>(".e-grid-scroll")!;
    expect(scroll.style.height).toBe("300px");
    expect(names(container)[0]).toBe("Row 0");
    scroll.scrollTop = 40 * 1000;
    await expect.poll(() => names(container)[0], { timeout: 3000 }).not.toBe("Row 0");
    expect(count()).toBeLessThan(60);
    const first = Number(bodyRows(container)[0]!.getAttribute("aria-rowindex"));
    expect(first).toBeGreaterThan(900);
    expect(container.querySelectorAll("tr.e-spacer").length).toBe(2);
    const spacers = [...container.querySelectorAll<HTMLElement>("tr.e-spacer")];
    expect(spacers.every((s) => s.getAttribute("aria-hidden") === "true")).toBe(true);
    const total = spacers.reduce((s, r) => s + parseFloat(r.style.height), 0) + count() * 40;
    expect(Math.round(total)).toBe(2000 * 40);
  });

  test("virtual rows stay responsive with 10,000 rows: sorting and searching all rows, bounded DOM", async () => {
    const { container } = await grid({
      props: {
        caption: "Huge",
        virtual: { height: 300, rowHeight: 40 },
        selectable: true,
        searchable: true,
        columns: [
          { key: "n", label: "Name", sortable: true },
          { key: "a", label: "Amount", sortable: true, numeric: true },
        ],
        rows: bigRows(10000),
      },
    });
    await expect.poll(() => bodyRows(container).length).toBeGreaterThan(5);
    const t0 = performance.now();
    (container.querySelectorAll("th")[2]!.querySelector("button") as HTMLButtonElement).click();
    await expect.poll(() => container.querySelectorAll("th")[2]!.getAttribute("aria-sort")).toBe("ascending");
    (container.querySelectorAll("th")[2]!.querySelector("button") as HTMLButtonElement).click();
    await expect.poll(() => container.querySelectorAll("th")[2]!.getAttribute("aria-sort")).toBe("descending");
    await expect.poll(() => names(container)[0]).toBe("Row 9999");
    expect(bodyRows(container).length).toBeLessThan(60);
    await typeInto(input(container.querySelector(".e-grid-search input")), "Row 77");
    expect(container.querySelector("table")!.getAttribute("aria-rowcount")).toBe("112");
    expect(performance.now() - t0).toBeLessThan(5000);
    expect(container.querySelector("thead label")!.textContent).toContain("Select all rows");
    (container.querySelector("thead .e-check") as HTMLInputElement).click();
    await expect.poll(() => container.querySelector(".e-grid-count")?.textContent).toBe("111 selected");
  });

  test("becomes cards on a narrow container: rows are blocks, cells labelled, headings hidden, a Sort by menu appears", async () => {
    const props = { caption: "T", columns: COLS, rows: [{ id: 1, n: "A", a: 1 }] };
    const narrow = await render(boxed(320, props));
    const wide = await render(boxed(800, props));
    expect(getComputedStyle(narrow.container.querySelector("tbody tr")!).display).toBe("block");
    expect(getComputedStyle(wide.container.querySelector("tbody tr")!).display).toBe("table-row");
    const td = narrow.container.querySelector("tbody td") as HTMLElement;
    expect(td.getAttribute("data-label")).toBe("Name");
    expect(getComputedStyle(td, "::before").content).toBe('"Name"');
    expect(getComputedStyle(td).display).toBe("grid");
    expect(narrow.container.querySelector("table")!.getAttribute("role")).toBe("table");
    expect(narrow.container.querySelector("tr")!.getAttribute("role")).toBe("row");
    expect(narrow.container.querySelector("th")!.getAttribute("role")).toBe("columnheader");
    expect(wide.container.querySelector("table")!.getAttribute("role")).toBe("table");
    expect(getComputedStyle(narrow.container.querySelector(".e-grid-sortsel")!).display).toBe("block");
    expect(getComputedStyle(wide.container.querySelector(".e-grid-sortsel")!).display).toBe("none");
    expect(getComputedStyle(wide.container.querySelector(".e-grid-bar")!).display).toBe("none");
    expect(narrow.container.querySelector(".e-grid-bar")).not.toBeNull();
    expect(narrow.container.querySelector("thead")!.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  });

  test("cards: the Sort by menu sorts, and cards={false}, virtual and resizable grids keep the table", async () => {
    const sorted = await render(boxed(320, { caption: "T", columns: COLS, rows: ROWS }));
    await page.getByRole("combobox", { name: "Sort by" }).click();
    await page.getByRole("option", { name: "Name, descending" }).click();
    await expect.poll(() => names(sorted.container)).toEqual(["Gamma", "Beta", "Alpha"]);
    await expect.poll(() => sorted.container.querySelector("th")!.getAttribute("aria-sort")).toBe("descending");
    sorted.unmount();

    for (const extra of [{ cards: false }, { virtual: true }, { resizable: true }]) {
      const r = await render(boxed(320, { caption: "T", columns: COLS, rows: ROWS, ...extra }));
      expect(r.container.querySelector(".e-grid--cards")).toBeNull();
      expect(getComputedStyle(r.container.querySelector("tbody tr")!).display).toBe("table-row");
      expect(r.container.querySelector("table")!.hasAttribute("role")).toBe(false);
      r.unmount();
    }
  });

  test("cards: a fixed column width does not hold the card wider than its container", async () => {
    const { container } = await render(
      boxed(320, { caption: "T", columns: [{ key: "n", label: "Name", width: 500 }], rows: ROWS }),
    );
    const grid = container.querySelector(".e-grid")!.getBoundingClientRect().width;
    expect(container.querySelector("table")!.getBoundingClientRect().width).toBeLessThanOrEqual(grid);
    expect(getComputedStyle(container.querySelector("tbody tr")!).display).toBe("block");
  });

  test("slots: #cell-<key> gets { row, value } and #header-<key> replaces the label", async () => {
    const { container } = await grid({
      props: {
        caption: "T",
        rows: ROWS,
        columns: [
          { key: "n", label: "Name", sortable: true },
          { key: "a", label: "Amount", numeric: true, value: (r: Row) => r.a * 2 },
        ],
      },
      slots: {
        "cell-a": ({ row, value }: { row: Row; value: number }) => h("b", `${row.n}:${value}`),
        "header-n": () => h("em", "Who"),
      },
    });
    expect(container.querySelector("tbody tr td:nth-child(2)")!.innerHTML).toContain("<b>Beta:10</b>");
    expect(container.querySelector("th em")!.textContent).toBe("Who");
    expect(container.querySelector("th button")!.textContent).toContain("Who");
    expect(container.querySelector("th")!.getAttribute("aria-sort")).toBe("none");
  });

  test("the default cell shows row[key]; numeric and centred columns are marked", async () => {
    const { container } = await grid({
      props: {
        caption: "T",
        rows: ROWS,
        columns: [
          { key: "n", label: "Name", align: "center" },
          { key: "a", label: "Amount", numeric: true },
        ],
      },
    });
    const tds = container.querySelectorAll("tbody tr:first-child td");
    expect(tds[0]!.textContent).toBe("Beta");
    expect(tds[0]!.classList.contains("e-center")).toBe(true);
    expect(tds[1]!.classList.contains("e-num")).toBe(true);
    expect(getComputedStyle(tds[1]!).textAlign).toBe("end");
  });

  test("manual: shows the rows given, takes total, reports every change through queryChange", async () => {
    const queries: any[] = [];
    const { container } = await grid({
      props: {
        caption: "T",
        columns: [...COLS.slice(0, 1).map((c) => ({ ...c, filter: { type: "text" } })), COLS[1]],
        rows: ROWS.slice(0, 2),
        manual: true,
        total: 47,
        pageSize: 2,
        searchable: true,
        filterable: true,
        onQueryChange: (q: unknown) => queries.push(q),
      },
    });
    expect(names(container)).toEqual(["Beta", "Alpha"]);
    expect(container.querySelector(".e-grid-range")!.textContent).toMatch(/^Showing 1\D+2 of 47$/);
    // The first fetch: manual grids report their starting query once, on mount.
    expect(queries).toEqual([{ sort: null, page: 1, pageSize: 2, search: "", filters: {} }]);
    await page
      .getByRole("navigation", { name: /^Pagination/ })
      .getByRole("button", { name: "Next" })
      .click();
    await expect.poll(() => queries.length).toBe(2);
    expect(queries[1]).toEqual({ sort: null, page: 2, pageSize: 2, search: "", filters: {} });
    expect(names(container)).toEqual(["Beta", "Alpha"]);
    (container.querySelectorAll("th")[1]!.querySelector("button") as HTMLButtonElement).click();
    await expect.poll(() => queries.length).toBe(3);
    expect(queries[2]).toMatchObject({ sort: { key: "a", dir: "asc" }, page: 1 });
    await typeInto(input(container.querySelector(".e-grid-search input")), "x");
    expect(queries.at(-1)).toMatchObject({ search: "x", page: 1 });
    expect(names(container)).toEqual(["Beta", "Alpha"]);
  });

  test("bare: a bare table without toolbar, filters, paging or footer", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: FILTER_COLS, rows: bigRows(30), bare: true, searchable: true, filterable: true },
    });
    expect(container.querySelector(".e-grid--bare")).not.toBeNull();
    expect(container.querySelector(".e-grid-bar")).toBeNull();
    expect(container.querySelector(".e-filterrow")).toBeNull();
    expect(container.querySelector(".e-grid-foot")).toBeNull();
    expect(bodyRows(container).length).toBe(30);
  });

  test("bare is deprecated: it warns once in development, pointing to ETable", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await grid({ props: { caption: "T", columns: COLS, rows: ROWS, bare: true } });
    expect(warn.mock.calls.filter(([m]) => String(m).includes("bare"))).toHaveLength(1);
    expect(String(warn.mock.calls[0]![0])).toContain("ETable");
    warn.mockRestore();
  });

  test("toolbar slot and attribute fall-through", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: COLS, rows: ROWS, class: "mine", "data-x": "1" },
      slots: { toolbar: () => h("button", { type: "button" }, "Export") },
    });
    const root = container.querySelector(".e-grid")!;
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.getAttribute("data-x")).toBe("1");
    expect(container.querySelector(".e-grid-tools")!.textContent).toContain("Export");
  });

  test("works without the plugin and from a narrow viewport at the table's own width (no horizontal page scroll)", async () => {
    const { container } = await render(boxed(280, { caption: "T", columns: COLS, rows: ROWS, searchable: true }));
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    expect(container.querySelector(".e-grid")!.getBoundingClientRect().width).toBeLessThanOrEqual(280);
  });

  describe("axe", () => {
    test("default, sorted, filtered, selected", async () => {
      const { container } = await grid({
        props: {
          caption: "Payments",
          columns: FILTER_COLS,
          rows: ROWS,
          searchable: true,
          filterable: true,
          selectable: true,
          columnToggle: true,
          stickyFirst: true,
          sort: { key: "n", dir: "asc" },
        },
      });
      await expectNoViolations(container);
      await typeInto(input(page.getByLabelText("Filter Name").element()), "a");
      await expectNoViolations(container);
      (container.querySelector("tbody .e-check") as HTMLInputElement).click();
      await wait(30);
      await expectNoViolations(container);
      (container.querySelector("thead .e-check") as HTMLInputElement).click();
      await wait(30);
      await expectNoViolations(container);
    });

    test("empty, no matches and loading", async () => {
      const empty = await grid({ props: { caption: "T", columns: COLS, rows: [] } });
      await expectNoViolations(empty.container);
      empty.unmount();
      const none = await grid({ props: { caption: "T", columns: COLS, rows: ROWS, searchable: true } });
      await typeInto(input(none.container.querySelector(".e-grid-search input")), "zzz");
      await expectNoViolations(none.container);
      none.unmount();
      const loading = await grid({
        props: { caption: "T", columns: COLS, rows: [], loading: true, selectable: true },
      });
      await expectNoViolations(loading.container);
    });

    test("resizable and virtual", async () => {
      const resizable = await grid({
        props: { caption: "T", columns: COLS, rows: ROWS, resizable: true, filterable: true },
      });
      await expectNoViolations(resizable.container);
      resizable.unmount();
      const virtual = await grid({
        props: { caption: "T", columns: COLS, rows: bigRows(500), virtual: { height: 300 }, selectable: true },
      });
      await expect.poll(() => bodyRows(virtual.container).length).toBeGreaterThan(5);
      await expectNoViolations(virtual.container);
    });

    test("the card layout", async () => {
      const { container } = await render(
        boxed(320, { caption: "T", columns: COLS, rows: ROWS, selectable: true, searchable: true }),
      );
      expect(getComputedStyle(container.querySelector("tbody tr")!).display).toBe("block");
      await expectNoViolations(container);
    });

    test("the open column menu", async () => {
      await grid({ props: { caption: "T", columns: COLS, rows: ROWS, columnToggle: true } });
      await page.getByRole("button", { name: "Choose columns" }).click();
      await expect.element(page.getByRole("dialog", { name: "Choose columns" })).toBeVisible();
      await expectNoViolations(document.querySelector("[role=dialog]")!);
    });
  });

  test("a client-side grid does not report a query on mount", async () => {
    const queries: unknown[] = [];
    await grid({ props: { caption: "T", columns: COLS, rows: ROWS, onQueryChange: (q: unknown) => queries.push(q) } });
    await wait(30);
    expect(queries).toEqual([]);
  });

  test("manual: searchDebounce waits for a pause in typing, other changes go at once", async () => {
    const queries: any[] = [];
    const { container } = await grid({
      props: {
        caption: "T",
        columns: COLS,
        rows: ROWS,
        manual: true,
        searchable: true,
        searchDebounce: 120,
        onQueryChange: (q: unknown) => queries.push(q),
      },
    });
    expect(queries).toHaveLength(1);
    const box = input(container.querySelector(".e-grid-search input"));
    await typeInto(box, "a");
    await typeInto(box, "al");
    await typeInto(box, "alp");
    expect(queries).toHaveLength(1);
    await expect.poll(() => queries.length).toBe(2);
    expect(queries[1]).toMatchObject({ search: "alp", page: 1 });
    (container.querySelectorAll("th")[1]!.querySelector("button") as HTMLButtonElement).click();
    await expect.poll(() => queries.length).toBe(3);
    expect(queries[2]).toMatchObject({ sort: { key: "a", dir: "asc" }, search: "alp" });
  });

  test("selected keeps the id type of the rows: numbers stay numbers", async () => {
    const picked: unknown[][] = [];
    const { container } = await grid({
      props: {
        caption: "T",
        columns: COLS,
        rows: ROWS.slice(0, 2),
        selectable: true,
        selected: [2],
        "onUpdate:selected": (ids: unknown[]) => picked.push(ids),
      },
    });
    const boxes = () => [...container.querySelectorAll<HTMLInputElement>("tbody input[type=checkbox]")];
    expect(boxes().map((b) => b.checked)).toEqual([false, true]);
    boxes()[0]!.click();
    await wait(30);
    expect([...picked.at(-1)!].sort()).toEqual([1, 2]);
    expect(picked.at(-1)!.every((id) => typeof id === "number")).toBe(true);
  });

  test("selected ids that are not among the rows (another page, a server) are kept", async () => {
    const picked: unknown[][] = [];
    const { container } = await grid({
      props: {
        caption: "T",
        columns: COLS,
        rows: ROWS.slice(0, 2),
        selectable: true,
        selected: [99],
        "onUpdate:selected": (ids: unknown[]) => picked.push(ids),
      },
    });
    container.querySelector<HTMLInputElement>("tbody input[type=checkbox]")!.click();
    await wait(30);
    expect([...picked.at(-1)!].sort()).toEqual([1, 99]);
  });

  test("default cells write dates, numbers and currency in the configured locale; format overrides", async () => {
    const rows = [{ id: 1, when: new Date(2026, 9, 22, 12), amount: 1234567.5, price: 12.5, plain: 2026, own: 3 }];
    const { container } = await render(
      EDataGrid as any,
      {
        props: {
          cards: false,
          caption: "T",
          rows,
          columns: [
            { key: "when", label: "When" },
            { key: "amount", label: "Amount", numeric: true },
            { key: "price", label: "Price", numeric: true, format: "currency" },
            { key: "plain", label: "Year" },
            { key: "own", label: "Own", format: (v: number) => `#${v}` },
          ],
        },
        global: { plugins: [createEos({ themeTarget: null, locale: "de-DE", currency: "EUR" })] },
      } as any,
    );
    const cells = [...container.querySelectorAll("tbody tr:first-child td")].map((td) => td.textContent!.trim());
    expect(cells[0]).toBe("22.10.2026");
    expect(cells[1]).toBe("1.234.567,5");
    expect(cells[2]).toMatch(/^12,50\s€$/);
    expect(cells[3]).toBe("2026");
    expect(cells[4]).toBe("#3");
  });

  test("sorting follows the configured locale, not the browser's", async () => {
    const rows = [
      { id: 1, n: "Zebra" },
      { id: 2, n: "Äpfel" },
      { id: 3, n: "Apfel" },
      { id: 4, n: "Ödem" },
      { id: 5, n: "Ozon" },
    ];
    const sv = await render(
      EDataGrid as any,
      {
        props: {
          cards: false,
          caption: "T",
          rows,
          columns: [{ key: "n", label: "N", sortable: true }],
          sort: { key: "n", dir: "asc" },
        },
        global: { plugins: [createEos({ themeTarget: null, locale: "sv-SE" })] },
      } as any,
    );
    // In Swedish Ä and Ö sort after Z.
    expect(names(sv.container)).toEqual(["Apfel", "Ozon", "Zebra", "Äpfel", "Ödem"]);
  });

  test("the number filter does not treat an empty cell as zero", async () => {
    const rows = [
      { id: 1, n: "A", a: 0 },
      { id: 2, n: "B", a: null },
      { id: 3, n: "C", a: "" },
      { id: 4, n: "D", a: 5 },
    ];
    const { container } = await grid({
      props: {
        caption: "T",
        rows,
        filterable: true,
        filters: { a: { min: "", max: "3" } },
        columns: [
          { key: "n", label: "N" },
          { key: "a", label: "A", numeric: true, filter: { type: "number" } },
        ],
      },
    });
    expect(names(container)).toEqual(["A"]);
  });

  test("search and text filters ignore accents and case", async () => {
    const rows = [
      { id: 1, n: "Café Zoë" },
      { id: 2, n: "Tea" },
    ];
    const { container } = await grid({
      props: {
        caption: "T",
        rows,
        searchable: true,
        filterable: true,
        columns: [{ key: "n", label: "N", filter: { type: "text" } }],
      },
    });
    await typeInto(input(container.querySelector(".e-grid-search input")), "cafe zoe");
    expect(names(container)).toEqual(["Café Zoë"]);
    await typeInto(input(container.querySelector(".e-grid-search input")), "");
    await typeInto(input(container.querySelector(".e-filterrow input")), "CAFÉ");
    expect(names(container)).toEqual(["Café Zoë"]);
  });

  test("search matches the text a date or number cell shows", async () => {
    const rows = [
      { id: 1, n: "A", when: new Date(2026, 9, 22, 12) },
      { id: 2, n: "B", when: new Date(2025, 0, 3, 12) },
    ];
    const { container } = await grid({
      props: {
        caption: "T",
        rows,
        searchable: true,
        columns: [
          { key: "n", label: "N" },
          { key: "when", label: "When" },
        ],
      },
    });
    await typeInto(input(container.querySelector(".e-grid-search input")), "10/22/2026");
    expect(names(container)).toEqual(["A"]);
  });

  test("skeletonRows sets how many placeholder rows loading shows", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: COLS, rows: [], loading: true, skeletonRows: 3 },
    });
    expect(container.querySelectorAll("tbody tr").length).toBe(3);
  });

  test("the status line is one live region", async () => {
    const { container } = await grid({ props: { caption: "T", columns: COLS, rows: ROWS } });
    const status = container.querySelector("[role=status]")!;
    expect(status.hasAttribute("aria-live")).toBe(false);
  });

  test("the Columns menu is a dialog named by its trigger, with no patched attributes", async () => {
    await grid({ props: { caption: "T", columns: COLS, rows: ROWS, columnToggle: true } });
    await page.getByRole("button", { name: "Choose columns" }).click();
    await wait(80);
    await expect.element(page.getByRole("dialog", { name: "Choose columns" })).toBeVisible();
  });

  test("the filter row sticks right under a heading row of any height", async () => {
    const { container } = await grid({
      props: { caption: "T", columns: FILTER_COLS, rows: ROWS, filterable: true, maxHeight: "200px" },
    });
    await wait(60);
    const head = container.querySelector<HTMLElement>("thead tr")!.getBoundingClientRect().height;
    const filter = container.querySelector<HTMLElement>(".e-filterrow td")!;
    expect(parseFloat(getComputedStyle(filter).top)).toBeCloseTo(head, 0);
  });

  test("resizer: aria-valuemax, Escape restores the starting width, pointercancel ends a drag, unmount lets go", async () => {
    const shown = ref(true);
    const { container } = await render(
      defineComponent({
        render: () =>
          shown.value
            ? h(EDataGrid as any, {
                cards: false,
                caption: "T",
                rows: ROWS,
                resizable: true,
                columns: [{ key: "n", label: "Name", width: 2000, minWidth: 100, maxWidth: 2200 }],
              })
            : h("div"),
      }),
    );
    const sep = container.querySelector<HTMLElement>("[role=separator]")!;
    const colWidth = () => (container.querySelector("col") as HTMLElement | null)?.style.width;
    expect(sep.getAttribute("aria-valuemax")).toBe("2200");
    const x = sep.getBoundingClientRect().left;
    // Escape during a drag goes back to where it started.
    sep.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: x }));
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x + 80 }));
    await expect.poll(() => colWidth()).toBe("2080px");
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x + 5000 }));
    await expect.poll(() => colWidth()).toBe("2200px");
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await expect.poll(() => colWidth()).toBe("2000px");
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x + 50 }));
    await wait(30);
    expect(colWidth()).toBe("2000px");
    expect(document.body.style.cursor).toBe("");
    // A cancelled pointer (a touch taken over by scrolling) stops the drag where it is... and back at the start.
    sep.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: x }));
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x + 40 }));
    await expect.poll(() => colWidth()).toBe("2040px");
    window.dispatchEvent(new PointerEvent("pointercancel"));
    await expect.poll(() => colWidth()).toBe("2000px");
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x + 90 }));
    await wait(30);
    expect(colWidth()).toBe("2000px");
    // Escape on the focused edge goes back to the width it had when focused.
    sep.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect.poll(() => colWidth()).toBe("2020px");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => colWidth()).toBe("2000px");
    // Unmounting mid-drag removes the listeners and the cursor.
    sep.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, clientX: x }));
    expect(document.body.style.cursor).toBe("col-resize");
    shown.value = false;
    await expect.poll(() => document.body.style.cursor).toBe("");
  });

  describe("names, announcements and states", () => {
    test("each row checkbox is named after the row: its first column, or rowLabel", async () => {
      const { container } = await grid({ props: { caption: "T", columns: COLS, rows: ROWS, selectable: true } });
      await expect.element(page.getByRole("checkbox", { name: "Select Alpha" })).toBeVisible();
      await expect.element(page.getByRole("checkbox", { name: "Select Gamma" })).toBeVisible();
      expect(container.querySelectorAll("tbody input[type=checkbox]").length).toBe(3);
    });

    test("rowLabel names the checkboxes when the first column is not a good name", async () => {
      await grid({
        props: { caption: "T", columns: COLS, rows: ROWS, selectable: true, rowLabel: (r: Row) => `order ${r.id}` },
      });
      await expect.element(page.getByRole("checkbox", { name: "Select order 2" })).toBeVisible();
    });

    test("a change of selection is announced in its own live region", async () => {
      const { container } = await grid({ props: { caption: "T", columns: COLS, rows: ROWS, selectable: true } });
      const live = () => container.querySelectorAll("[role=status]")[1]!.textContent;
      expect(live()).toBe("");
      (container.querySelector("tbody input[type=checkbox]") as HTMLInputElement).click();
      await expect.poll(live).toBe("1 selected");
      expect(container.querySelector(".e-grid-count")!.getAttribute("aria-hidden")).toBe("true");
    });

    test("the pager is named after the grid", async () => {
      const { container } = await grid({ props: { caption: "Statements", columns: COLS, rows: bigRows(25) } });
      expect(container.querySelector("nav.e-pager")!.getAttribute("aria-label")).toBe("Pagination: Statements");
    });

    test("loading keeps the rows it has, dimmed and busy, instead of swapping them for placeholders", async () => {
      const { container } = await grid({ props: { caption: "T", columns: COLS, rows: ROWS, loading: true } });
      expect(container.querySelectorAll(".e-skel").length).toBe(0);
      expect(names(container).length).toBe(3);
      const table = container.querySelector("table")!;
      expect(table.getAttribute("aria-busy")).toBe("true");
      expect(getComputedStyle(table.querySelector("tbody")!).opacity).toBe("0.5");
    });

    test("error shows a sentence and a Try again button that emits retry; a string says your own", async () => {
      let retries = 0;
      const { container } = await grid({
        props: { caption: "T", columns: COLS, rows: [], error: true, onRetry: () => retries++ },
      });
      expect(container.textContent).toContain("The data could not be loaded.");
      // The EOS name "alert", which every icon set maps, so the built-in set draws it too.
      expect(container.querySelector(".e-empty-icon .e-icon")).not.toBeNull();
      await page.getByRole("button", { name: "Try again" }).click();
      expect(retries).toBe(1);
      const own = await grid({ props: { caption: "T", columns: COLS, rows: [], error: "Offline" } });
      expect(own.container.textContent).toContain("Offline");
    });

    test("as cards on a narrow grid the heading row is inert, so no hidden control takes focus", async () => {
      const props = { caption: "T", columns: COLS, rows: ROWS, selectable: true, cards: true };
      const wide = await render(boxed(900, props));
      const narrow = await render(boxed(300, props));
      await expect.poll(() => narrow.container.querySelector("thead")!.hasAttribute("inert")).toBe(true);
      expect(wide.container.querySelector("thead")!.hasAttribute("inert")).toBe(false);
    });
  });

  describe("small screens", () => {
    const manyCols: DataGridColumn<Row>[] = [
      { key: "n", label: "Name", sortable: true, filter: { type: "text" } },
      { key: "s", label: "Status", filter: { type: "select", options: ["paid", "due"] } },
      { key: "a", label: "Amount", numeric: true, sortable: true },
    ];
    const phone = () =>
      render(
        boxed(343, {
          caption: "Statements",
          columns: manyCols,
          rows: bigRows(25),
          searchable: true,
          selectable: true,
          columnToggle: true,
          pageSize: 5,
          selected: [1, 2],
          cards: true,
        }),
      );

    test("nothing overflows sideways at 343px: toolbar controls and the footer fit and align", async () => {
      const { container } = await phone();
      await wait(80);
      const box = container.firstElementChild!.getBoundingClientRect();
      const inside = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.left >= box.left - 0.5 && r.right <= box.right + 0.5;
      };
      for (const el of container.querySelectorAll(
        ".e-grid-bar > *, .e-grid-bar button, .e-grid-foot > *, .e-pager > *",
      ))
        expect(inside(el), el.className || el.tagName).toBe(true);
      const search = container.querySelector(".e-grid-search")!.getBoundingClientRect();
      const sortsel = container.querySelector(".e-grid-sortsel")!.getBoundingClientRect();
      const tools = container.querySelector(".e-grid-tools")!.getBoundingClientRect();
      expect(sortsel.left).toBeCloseTo(search.left, 0);
      expect(sortsel.width).toBeCloseTo(search.width, 0);
      expect(tools.width).toBeCloseTo(search.width, 0);
    });

    test("the footer stacks the pager above its range, with Previous and Next on one line", async () => {
      const { container } = await phone();
      await wait(80);
      const pager = container.querySelector(".e-pager")!.getBoundingClientRect();
      const range = container.querySelector(".e-grid-range")!.getBoundingClientRect();
      expect(pager.bottom).toBeLessThanOrEqual(range.top + 0.5);
      expect(container.querySelector(".e-pager-status")!.getBoundingClientRect().width).toBeGreaterThan(40);
      const ends = container.querySelectorAll(".e-pager > a, .e-pager > button");
      expect(
        Math.abs(ends[0]!.getBoundingClientRect().top - ends[ends.length - 1]!.getBoundingClientRect().top),
      ).toBeLessThan(2);
    });
  });

  test("the scroller carries the frame's corners where it meets them, so the frame's clip cannot cut its focus ring", async () => {
    const corner = (el: Element, which: string) =>
      parseFloat(getComputedStyle(el).getPropertyValue(`border-${which}-radius`));
    const { container } = await grid({
      props: { columns: COLS, rows: ROWS, caption: "Invoices", bare: true, maxHeight: "3rem" },
    });
    container.classList.add("e-root");
    const frame = container.querySelector(".e-grid-frame")!;
    const scroll = container.querySelector(".e-grid-scroll")!;
    for (const md of ["2px", "8px", "14px"]) {
      (container as HTMLElement).style.setProperty("--e-radius-md", md);
      for (const which of ["top-left", "top-right", "bottom-left", "bottom-right"]) {
        expect(corner(frame, which)).toBe(parseFloat(md));
        expect(corner(scroll, which)).toBe(parseFloat(md));
      }
    }
    // With the toolbar above and the pager below, the scroller is square.
    const full = await grid({
      props: { columns: COLS, rows: ROWS, caption: "Invoices", searchable: true },
    });
    expect(corner(full.container.querySelector(".e-grid-scroll")!, "top-left")).toBe(0);
    expect(corner(full.container.querySelector(".e-grid-scroll")!, "bottom-left")).toBe(0);
  });

  test("the frame does not clip: its outline is drawn once and the scroller owns the overflow and the corners", async () => {
    const { container } = await grid({
      props: { rows: bigRows(3), columns: [{ key: "n", label: "Name" }], caption: "x" },
    });
    container.classList.add("e-root");
    const frame = getComputedStyle(container.querySelector(".e-grid-frame")!);
    expect(frame.overflowX).toBe("visible");
    expect(frame.overflowY).toBe("visible");
    expect(getComputedStyle(container.querySelector(".e-grid-scroll")!).overflowX).toBe("auto");
  });
});
