import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import ETable from "./ETable.vue";
import { expectNoViolations } from "../../../test/axe.js";

const rows = () => [
  h("thead", [h("tr", [h("th", { scope: "col" }, "Plan"), h("th", { scope: "col", class: "e-num" }, "Visits")])]),
  h("tbody", [
    h("tr", [h("th", { scope: "row" }, "Basic"), h("td", { class: "e-num" }, "4")]),
    h("tr", [h("th", { scope: "row" }, "Plus"), h("td", { class: "e-num" }, "12")]),
    h("tr", [h("th", { scope: "row" }, "Pro"), h("td", { class: "e-num" }, "24")]),
  ]),
];

describe("ETable", () => {
  test("is a native table with a visible caption, and no tab stop while nothing scrolls", async () => {
    const { container } = await render(ETable, { props: { caption: "Plans" }, slots: { default: rows } });
    const region = container.querySelector(".e-table-scroll")!;
    expect(region.hasAttribute("role")).toBe(false);
    expect(region.hasAttribute("tabindex")).toBe(false);
    expect(region.hasAttribute("aria-label")).toBe(false);
    const caption = container.querySelector("table.e-table > caption")!;
    expect(caption.textContent).toBe("Plans");
    expect(caption.className).toBe("e-table-caption");
    expect(container.querySelectorAll("tbody tr").length).toBe(3);
  });

  test("it becomes a named, focusable region once the table is wider than its space", async () => {
    const wide = () => [
      h("tbody", [
        h(
          "tr",
          Array.from({ length: 12 }, (_, i) => h("td", { style: "min-width: 120px" }, `Cell ${i}`)),
        ),
      ]),
    ];
    const { container } = await render(
      defineComponent({
        render: () => h("div", { id: "box", style: { width: "800px" } }, [h(ETable, { caption: "Wide" }, wide)]),
      }),
    );
    const region = container.querySelector(".e-table-scroll")!;
    await expect.poll(() => region.getAttribute("role")).toBe("region");
    expect(region.getAttribute("aria-label")).toBe("Wide");
    expect(region.getAttribute("tabindex")).toBe("0");
    container.querySelector<HTMLElement>("#box")!.style.width = "2400px";
    await expect.poll(() => region.hasAttribute("role")).toBe(false);
    expect(region.hasAttribute("tabindex")).toBe(false);
  });

  test("hideCaption keeps the caption for screen readers only", async () => {
    const { container } = await render(ETable, {
      props: { caption: "Plans", hideCaption: true },
      slots: { default: rows },
    });
    container.classList.add("e-root");
    const caption = container.querySelector("caption")!;
    expect(caption.className).toBe("e-sr");
    expect(caption.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  });

  test("striped and dense add modifiers; striped tints every other row", async () => {
    const { container } = await render(ETable, {
      props: { caption: "Plans", striped: true, dense: true },
      slots: { default: rows },
    });
    container.classList.add("e-root");
    expect(container.querySelector(".e-table-wrap")!.className).toBe(
      "e-table-wrap e-table-wrap--striped e-table-wrap--dense",
    );
    const cells = [...container.querySelectorAll<HTMLElement>("tbody tr > td")];
    expect(getComputedStyle(cells[0]!).backgroundColor).not.toBe(getComputedStyle(cells[1]!).backgroundColor);
  });

  test("maxHeight scrolls inside the frame and keeps the heading row stuck", async () => {
    const many = [
      h("thead", [h("tr", [h("th", { scope: "col" }, "n")])]),
      h(
        "tbody",
        Array.from({ length: 40 }, (_, i) => h("tr", [h("td", String(i))])),
      ),
    ];
    const { container } = await render(ETable, {
      props: { caption: "Long", maxHeight: "200px" },
      slots: { default: () => many },
    });
    container.classList.add("e-root");
    const region = container.querySelector<HTMLElement>(".e-table-scroll")!;
    expect(region.getAttribute("role")).toBe("region");
    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.getBoundingClientRect().height).toBeLessThanOrEqual(200);
    expect(region.scrollHeight).toBeGreaterThan(200);
    expect(getComputedStyle(container.querySelector("th")!).position).toBe("sticky");
  });

  test("the frame outline is drawn once, as a ring over the scroller", async () => {
    const { container } = await render(ETable, { props: { caption: "Plans" }, slots: { default: rows } });
    container.classList.add("e-root");
    const wrap = container.querySelector(".e-table-wrap")!;
    expect(getComputedStyle(wrap).borderTopWidth).toBe("0px");
    expect(getComputedStyle(wrap, "::after").boxShadow).not.toBe("none");
  });

  test("size sm and the older dense both tighten the cells", async () => {
    const pad = async (props: Record<string, unknown>) => {
      const { container } = await render(ETable, { props: { caption: "P", ...props }, slots: { default: rows } });
      container.classList.add("e-root");
      return getComputedStyle(container.querySelector("td")!).paddingTop;
    };
    const normal = await pad({});
    expect(await pad({ size: "sm" })).not.toBe(normal);
    expect(await pad({ dense: true })).not.toBe(normal);
    expect(await pad({ size: "md", dense: true })).toBe(normal);
  });

  test("loading marks the table busy, dims its rows and shows placeholder lines", async () => {
    const { container } = await render(ETable, {
      props: { caption: "Plans", loading: true, skeletonRows: 4 },
      slots: { default: rows },
    });
    container.classList.add("e-root");
    expect(container.querySelector("table")!.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll(".e-table-loading .e-skel").length).toBe(4);
    expect(getComputedStyle(container.querySelector("tbody")!).opacity).toBe("0.5");
    expect(container.querySelector("[role=status]")!.textContent).toBe("Loading");
  });

  test("the loading status region is in the page before loading starts, so only its text changes", async () => {
    const view = await render(ETable, { props: { caption: "Plans", loading: false }, slots: { default: rows } });
    const status = view.container.querySelector("[role=status]");
    expect(status).not.toBeNull();
    expect(status!.textContent).toBe("");
    await view.rerender({ loading: true });
    expect(view.container.querySelector("[role=status]")).toBe(status);
    expect(status!.textContent).toBe("Loading");
    await view.rerender({ loading: false });
    expect(view.container.querySelector("[role=status]")).toBe(status);
    expect(status!.textContent).toBe("");
  });

  test("loading shows five placeholder lines by default, as EDataGrid shows five rows", async () => {
    const { container } = await render(ETable, {
      props: { caption: "Plans", loading: true },
      slots: { default: rows },
    });
    expect(container.querySelectorAll(".e-table-loading .e-skel").length).toBe(5);
  });

  test("empty shows the empty state under the headings, or your own slot", async () => {
    const head = () => [h("thead", [h("tr", [h("th", { scope: "col" }, "Plan")])])];
    const { container } = await render(ETable, {
      props: { caption: "Plans", empty: true, emptyTitle: "No plans", emptyText: "Add one." },
      slots: { default: head },
    });
    expect(container.querySelector(".e-table-empty")!.textContent).toContain("No plans");
    expect(container.querySelector(".e-table-empty")!.textContent).toContain("Add one.");
    const own = await render(ETable, {
      props: { caption: "Plans", empty: true },
      slots: { default: head, empty: () => h("p", "Nothing here") },
    });
    expect(own.container.querySelector(".e-table-empty")!.textContent).toBe("Nothing here");
  });

  test("cards turns rows into labelled cards below 40rem and keeps a table above it", async () => {
    const labelled = () => [
      h("thead", [h("tr", [h("th", { scope: "col" }, "Plan"), h("th", { scope: "col" }, "Visits")])]),
      h("tbody", [h("tr", [h("td", { "data-label": "Plan" }, "Basic"), h("td", { "data-label": "Visits" }, "4")])]),
    ];
    const at = async (width: number) => {
      const { container } = await render(
        defineComponent({
          render: () =>
            h("div", { style: { width: `${width}px` } }, [h(ETable, { caption: "Plans", cards: true }, labelled)]),
        }),
      );
      container.classList.add("e-root");
      return container;
    };
    const narrow = await at(320);
    await expect.poll(() => getComputedStyle(narrow.querySelector("tbody tr")!).display).toBe("block");
    expect(getComputedStyle(narrow.querySelector("td")!, "::before").content).toBe('"Plan"');
    expect(getComputedStyle(narrow.querySelector(".e-table-wrap")!, "::after").content).toBe("none");
    const wide = await at(900);
    expect(getComputedStyle(wide.querySelector("tbody tr")!).display).toBe("table-row");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ETable, {
      props: { caption: "Plans", striped: true },
      slots: { default: rows },
    });
    await expectNoViolations(container);
  });
});
