import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ETabs from "./ETabs.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { id: "a", label: "One" },
  { id: "b", label: "Two", count: 3 },
  { id: "c", label: "Three" },
];
const slots = { a: () => "Panel A", b: () => "Panel B", c: () => "Panel C" };

describe("ETabs", () => {
  test("is a tablist of tabs with one selected tab and its panel", async () => {
    const { container } = await render(ETabs, { props: { items }, slots });
    await expect.element(page.getByRole("tablist")).toBeVisible();
    const tabs = container.querySelectorAll<HTMLElement>("[role=tab]");
    expect(tabs.length).toBe(3);
    expect(tabs[0]!.className).toBe("e-tab");
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("false");
    expect(tabs[0]!.tabIndex).toBe(-1);
    expect(tabs[1]!.tabIndex).toBe(-1);
    const panel = page.getByRole("tabpanel", { name: "One" });
    await expect.element(panel).toHaveTextContent("Panel A");
    expect(container.querySelectorAll("[role=tabpanel]:not([hidden])").length).toBe(1);
    expect(container.querySelector(".e-tabs > .e-tablist")).not.toBeNull();
  });

  test("fill shares the width equally between the tabs", async () => {
    const { container } = await render(ETabs, { props: { items, fill: true }, slots });
    expect(container.querySelector(".e-tabs")!.classList.contains("e-tabs--fill")).toBe(true);
    const widths = [...container.querySelectorAll<HTMLElement>("[role=tab]")].map((t) =>
      Math.round(t.getBoundingClientRect().width),
    );
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
  });

  test("vertical stacks the tabs in a column beside the panel and keeps the arrow keys", async () => {
    const { container } = await render(ETabs, { props: { items, orientation: "vertical" }, slots });
    const root = container.querySelector(".e-tabs")!;
    expect(root.classList.contains("e-tabs--vertical")).toBe(true);
    expect(root.querySelector("[role=tablist]")!.getAttribute("aria-orientation")).toBe("vertical");
    const tabs = [...container.querySelectorAll<HTMLElement>("[role=tab]")].map((x) => x.getBoundingClientRect());
    expect(tabs[1]!.top).toBeGreaterThan(tabs[0]!.top);
    expect(Math.round(tabs[1]!.right)).toBe(Math.round(tabs[0]!.right));
    const panel = container.querySelector("[role=tabpanel]")!.getBoundingClientRect();
    expect(panel.left).toBeGreaterThanOrEqual(tabs[0]!.right);
    container.querySelector<HTMLElement>("[role=tab]")!.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByRole("tab", { name: "Two 3" })).toHaveFocus();
  });

  test("side=end puts a vertical list on the far side of its panel, and does nothing to a horizontal row", async () => {
    const { container } = await render(ETabs, {
      props: { items, orientation: "vertical", side: "end", framed: true },
      slots,
    });
    const tab = container.querySelector("[role=tab]")!.getBoundingClientRect();
    const panel = container.querySelector("[role=tabpanel]")!.getBoundingClientRect();
    expect(container.querySelector(".e-tabs")!.classList.contains("e-tabs--end")).toBe(true);
    expect(tab.left).toBeGreaterThanOrEqual(panel.right - 2);
    const row = await render(ETabs, { props: { items, side: "end" }, slots });
    expect(row.container.querySelector(".e-tabs")!.classList.contains("e-tabs--end")).toBe(false);
  });

  test("tabs inside a vertical, framed panel keep their own plain horizontal look", async () => {
    const inner = () =>
      h(
        ETabs,
        {
          items: [
            { id: "x", label: "Inner one" },
            { id: "y", label: "Inner two" },
          ],
        },
        { x: () => "X", y: () => "Y" },
      );
    const { container } = await render(ETabs, {
      props: { items: [{ id: "a", label: "Outer" }], orientation: "vertical", framed: true },
      slots: { a: inner },
    });
    const lists = container.querySelectorAll<HTMLElement>(".e-tablist");
    expect(getComputedStyle(lists[0]!).flexDirection).toBe("column");
    expect(getComputedStyle(lists[1]!).flexDirection).toBe("row");
    const innerTabs = [...lists[1]!.querySelectorAll<HTMLElement>("[role=tab]")].map((x) => x.getBoundingClientRect());
    expect(Math.round(innerTabs[1]!.top)).toBe(Math.round(innerTabs[0]!.top));
  });

  test("the count shows in a badge after the label", async () => {
    const { container } = await render(ETabs, { props: { items }, slots });
    expect(container.querySelector(".e-tab-count")!.textContent).toBe("3");
    expect(container.querySelectorAll(".e-tab-count").length).toBe(1);
  });

  test("v-model round trip: a click selects, the model selects", async () => {
    const value = ref("a");
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(
            ETabs,
            {
              items,
              modelValue: value.value,
              "onUpdate:modelValue": (v: string | undefined) => {
                got.push(String(v));
                value.value = String(v);
              },
            },
            slots,
          ),
      }),
    );
    await page.getByRole("tab", { name: /^Two/ }).click();
    expect(got).toEqual(["b"]);
    await expect.element(page.getByRole("tab", { name: /^Two/ })).toHaveAttribute("aria-selected", "true");
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Panel B");
    value.value = "c";
    await nextTick();
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Panel C");
  });

  test("arrow keys move the selection, wrap around, and Home and End jump", async () => {
    const got: string[] = [];
    await render(ETabs, {
      props: { items, "onUpdate:modelValue": (v: string | undefined) => got.push(String(v)) },
      slots,
    });
    (document.querySelector("[role=tab]") as HTMLElement).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByRole("tab", { name: /^Two/ })).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement!.textContent).toContain("Two");
    await userEvent.keyboard("{End}");
    await expect.element(page.getByRole("tab", { name: "Three" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(page.getByRole("tab", { name: "Three" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Home}");
    await expect.element(page.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
    expect(got).toEqual(["b", "c", "a", "c", "a"]);
  });

  test("Tab leaves the strip for the panel, then Shift+Tab comes back to the selected tab", async () => {
    await render(ETabs, { props: { items }, slots });
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("role")).toBe("tab");
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("role")).toBe("tabpanel");
    await userEvent.tab({ shift: true });
    expect(document.activeElement!.textContent).toContain("One");
  });

  test("Enter and Space on a focused tab keep it selected", async () => {
    await render(ETabs, { props: { items }, slots });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
  });

  test("a tab without its own slot falls back to the panel slot", async () => {
    await render(ETabs, {
      props: { items },
      slots: { a: () => "Own", panel: ({ item }: { item: { id?: string } }) => `Fallback ${item.id}` },
    });
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Own");
    await page.getByRole("tab", { name: "Three" }).click();
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Fallback c");
  });

  test("the selected tab has the primary underline and heavier text", async () => {
    const { container } = await render(ETabs, { props: { items }, slots });
    container.classList.add("e-root");
    const [first, second] = [...container.querySelectorAll<HTMLElement>("[role=tab]")] as [HTMLElement, HTMLElement];
    expect(getComputedStyle(first).fontWeight).toBe("600");
    expect(getComputedStyle(second).fontWeight).toBe("500");
    // The selected tab's edges are all as thick as its slab, and thicker than the even edge of the others. No tab uses a shadow.
    const chosen = getComputedStyle(first);
    const other = getComputedStyle(second);
    expect(parseFloat(chosen.borderTopWidth)).toBeGreaterThan(parseFloat(other.borderTopWidth));
    expect(chosen.borderTopWidth).toBe(chosen.borderBottomWidth);
    expect(chosen.borderTopWidth).toBe(chosen.borderLeftWidth);
    expect(chosen.borderTopWidth).toBe(chosen.borderRightWidth);
    expect(other.borderBottomWidth).toBe(other.borderTopWidth);
    expect(getComputedStyle(first).boxShadow).toBe("none");
  });

  test("the strip scrolls sideways when the tabs do not fit", async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `t${i}`, label: `A longer tab label ${i}` }));
    const { container } = await render(ETabs, { props: { items: many }, slots: { panel: () => "x" } });
    container.classList.add("e-root");
    const list = container.querySelector<HTMLElement>(".e-tablist")!;
    expect(getComputedStyle(list).overflowX).toBe("auto");
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
  });

  test("class and attributes fall through to the root", async () => {
    const { container } = await render(ETabs, {
      props: { items },
      attrs: { class: "mine", "data-x": "1", id: "tabs" },
      slots,
    });
    const root = container.querySelector<HTMLElement>(".e-tabs")!;
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.id).toBe("tabs");
    expect(root.dataset.x).toBe("1");
  });

  test("a framed panel squares its top corner at the end of a row that scrolls", async () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ id: `t${i}`, label: `Section number ${i}` }));
    const { container } = await render(ETabs, { props: { items: many, framed: true }, slots: { t0: "x" } });
    container.classList.add("e-root");
    const root = container.querySelector<HTMLElement>(".e-tabs")!;
    root.style.width = "20rem";
    await expect.poll(() => root.classList.contains("e-tabs--scrolls")).toBe(true);
    expect(getComputedStyle(container.querySelector(".e-tabpanel")!).borderStartEndRadius).toBe("0px");
    root.style.width = "100rem";
    await expect.poll(() => root.classList.contains("e-tabs--scrolls")).toBe(false);
    expect(parseFloat(getComputedStyle(container.querySelector(".e-tabpanel")!).borderStartEndRadius)).toBeGreaterThan(
      0,
    );
  });

  test("axe finds nothing, with the first and another tab selected", async () => {
    const { container } = await render(ETabs, { props: { items }, slots });
    await expectNoViolations(container);
    await page.getByRole("tab", { name: "Three" }).click();
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Panel C");
    await expectNoViolations(container);
  });
});
