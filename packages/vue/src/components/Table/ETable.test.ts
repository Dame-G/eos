import { describe, expect, test } from "vitest";
import { h } from "vue";
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
  test("is a native table in a named, focusable scroll region with a visible caption", async () => {
    const { container } = await render(ETable, { props: { caption: "Plans" }, slots: { default: rows } });
    const region = container.querySelector(".e-table-scroll")!;
    expect(region.getAttribute("role")).toBe("region");
    expect(region.getAttribute("aria-label")).toBe("Plans");
    expect(region.getAttribute("tabindex")).toBe("0");
    const caption = container.querySelector("table.e-table > caption")!;
    expect(caption.textContent).toBe("Plans");
    expect(caption.className).toBe("e-table-caption");
    expect(container.querySelectorAll("tbody tr").length).toBe(3);
  });

  test("hideCaption keeps the caption for screen readers only", async () => {
    const { container } = await render(ETable, { props: { caption: "Plans", hideCaption: true }, slots: { default: rows } });
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
    expect(container.querySelector(".e-table-wrap")!.className).toBe("e-table-wrap e-table-wrap--striped e-table-wrap--dense");
    const cells = [...container.querySelectorAll<HTMLElement>("tbody tr > td")];
    expect(getComputedStyle(cells[0]!).backgroundColor).not.toBe(getComputedStyle(cells[1]!).backgroundColor);
  });

  test("maxHeight scrolls inside the frame and keeps the heading row stuck", async () => {
    const many = [
      h("thead", [h("tr", [h("th", { scope: "col" }, "n")])]),
      h("tbody", Array.from({ length: 40 }, (_, i) => h("tr", [h("td", String(i))]))),
    ];
    const { container } = await render(ETable, { props: { caption: "Long", maxHeight: "200px" }, slots: { default: () => many } });
    container.classList.add("e-root");
    const region = container.querySelector<HTMLElement>(".e-table-scroll")!;
    expect(region.getBoundingClientRect().height).toBeLessThanOrEqual(200);
    expect(region.scrollHeight).toBeGreaterThan(200);
    expect(getComputedStyle(container.querySelector("th")!).position).toBe("sticky");
  });

  test("the frame outline is one border outside the scroller, and the fill stops inside it", async () => {
    const { container } = await render(ETable, { props: { caption: "Plans" }, slots: { default: rows } });
    container.classList.add("e-root");
    const wrap = container.querySelector(".e-table-wrap")!;
    expect(getComputedStyle(wrap).borderTopWidth).not.toBe("0px");
    expect(getComputedStyle(wrap).backgroundClip).toBe("padding-box");
    expect(getComputedStyle(container.querySelector(".e-table-scroll")!).borderTopWidth).toBe("0px");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ETable, { props: { caption: "Plans", striped: true }, slots: { default: rows } });
    await expectNoViolations(container);
  });
});
