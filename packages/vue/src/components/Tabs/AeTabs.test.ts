import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeTabs from "./AeTabs.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { id: "a", label: "One" },
  { id: "b", label: "Two", count: 3 },
  { id: "c", label: "Three" },
];
const slots = { a: () => "Panel A", b: () => "Panel B", c: () => "Panel C" };

describe("AeTabs", () => {
  test("is a tablist of tabs with one selected tab and its panel", async () => {
    const { container } = await render(AeTabs, { props: { items }, slots });
    await expect.element(page.getByRole("tablist")).toBeVisible();
    const tabs = container.querySelectorAll<HTMLElement>("[role=tab]");
    expect(tabs.length).toBe(3);
    expect(tabs[0]!.className).toBe("ae-tab");
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("false");
    expect(tabs[0]!.tabIndex).toBe(-1);
    expect(tabs[1]!.tabIndex).toBe(-1);
    const panel = page.getByRole("tabpanel", { name: "One" });
    await expect.element(panel).toHaveTextContent("Panel A");
    expect(container.querySelectorAll("[role=tabpanel]:not([hidden])").length).toBe(1);
    expect(container.querySelector(".ae-tabs > .ae-tablist")).not.toBeNull();
  });

  test("the count shows in a badge after the label", async () => {
    const { container } = await render(AeTabs, { props: { items }, slots });
    expect(container.querySelector(".ae-tab-count")!.textContent).toBe("3");
    expect(container.querySelectorAll(".ae-tab-count").length).toBe(1);
  });

  test("v-model round trip: a click selects, the model selects", async () => {
    const value = ref("a");
    const got: string[] = [];
    await render(
      defineComponent({
        render: () =>
          h(
            AeTabs,
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
    await render(AeTabs, {
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
    await render(AeTabs, { props: { items }, slots });
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("role")).toBe("tab");
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("role")).toBe("tabpanel");
    await userEvent.tab({ shift: true });
    expect(document.activeElement!.textContent).toContain("One");
  });

  test("Enter and Space on a focused tab keep it selected", async () => {
    await render(AeTabs, { props: { items }, slots });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
  });

  test("a tab without its own slot falls back to the panel slot", async () => {
    await render(AeTabs, {
      props: { items },
      slots: { a: () => "Own", panel: ({ item }: { item: { id: string } }) => `Fallback ${item.id}` },
    });
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Own");
    await page.getByRole("tab", { name: "Three" }).click();
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Fallback c");
  });

  test("the selected tab has the primary underline and heavier text", async () => {
    const { container } = await render(AeTabs, { props: { items }, slots });
    container.classList.add("ae-root");
    const [first, second] = [...container.querySelectorAll<HTMLElement>("[role=tab]")] as [HTMLElement, HTMLElement];
    expect(getComputedStyle(first).fontWeight).toBe("600");
    expect(getComputedStyle(second).fontWeight).toBe("500");
    expect(getComputedStyle(first).borderBottomColor).not.toBe(getComputedStyle(second).borderBottomColor);
    expect(getComputedStyle(first).borderBottomWidth).toBe("3px");
  });

  test("the strip scrolls sideways when the tabs do not fit", async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `t${i}`, label: `A longer tab label ${i}` }));
    const { container } = await render(AeTabs, { props: { items: many }, slots: { panel: () => "x" } });
    container.classList.add("ae-root");
    const list = container.querySelector<HTMLElement>(".ae-tablist")!;
    expect(getComputedStyle(list).overflowX).toBe("auto");
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
  });

  test("class and attributes fall through to the root", async () => {
    const { container } = await render(AeTabs, {
      props: { items },
      attrs: { class: "mine", "data-x": "1", id: "tabs" },
      slots,
    });
    const root = container.querySelector<HTMLElement>(".ae-tabs")!;
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.id).toBe("tabs");
    expect(root.dataset.x).toBe("1");
  });

  test("axe finds nothing, with the first and another tab selected", async () => {
    const { container } = await render(AeTabs, { props: { items }, slots });
    await expectNoViolations(container);
    await page.getByRole("tab", { name: "Three" }).click();
    await expect.element(page.getByRole("tabpanel")).toHaveTextContent("Panel C");
    await expectNoViolations(container);
  });
});
