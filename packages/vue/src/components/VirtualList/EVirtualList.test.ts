/* eslint-disable @typescript-eslint/no-explicit-any -- the list is generic over the item, which the tests leave open */
import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EVirtualList from "./EVirtualList.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = Array.from({ length: 1000 }, (_, i) => ({ id: `r${i}`, name: `Row ${i + 1}` }));
const rendered = (c: Element) => [...c.querySelectorAll<HTMLElement>(".e-vlist-item")];

function mount(props: Record<string, unknown> = {}) {
  return render(EVirtualList as any, {
    props: { items, rowHeight: 40, itemKey: "id", style: "height: 400px", ...props },
    slots: { default: ({ item }: { item: { name: string } }) => h("div", { class: "row" }, item.name) },
  });
}

describe("EVirtualList", () => {
  test("renders only the rows in view and a few around them, in a scroller as tall as every row", async () => {
    const { container } = await mount();
    await expect.poll(() => rendered(container).length).toBeGreaterThan(0);
    expect(rendered(container).length).toBeLessThanOrEqual(10 + 4 + 1);
    const space = container.querySelector<HTMLElement>(".e-vlist-space")!;
    expect(space.getBoundingClientRect().height).toBe(40000);
    expect(rendered(container)[0]!.textContent).toBe("Row 1");
    expect(rendered(container)[0]!.getBoundingClientRect().height).toBe(40);
  });

  test("scrolling brings later rows in and lets earlier ones go", async () => {
    const { container } = await mount();
    const scroller = container.querySelector<HTMLElement>(".e-vlist")!;
    await expect.poll(() => rendered(container).length).toBeGreaterThan(0);
    scroller.scrollTop = 20000;
    await expect.poll(() => rendered(container).some((r) => r.textContent === "Row 501")).toBe(true);
    expect(rendered(container).some((r) => r.textContent === "Row 1")).toBe(false);
  });

  test("measure sizes each row from what it renders", async () => {
    const { container } = await render(EVirtualList as any, {
      props: { items, rowHeight: 40, measure: true, style: "height: 400px" },
      slots: {
        default: ({ index }: { index: number }) => h("div", { style: `height: ${index % 2 ? 60 : 30}px` }, `R${index}`),
      },
    });
    await expect
      .poll(() => Math.round(container.querySelector<HTMLElement>(".e-vlist-space")!.getBoundingClientRect().height))
      .not.toBe(40000);
    const [a, b] = rendered(container);
    expect(Math.round(a!.getBoundingClientRect().height)).toBe(30);
    expect(Math.round(b!.getBoundingClientRect().height)).toBe(60);
    expect(Math.round(b!.getBoundingClientRect().top - a!.getBoundingClientRect().top)).toBe(30);
  });

  test("scrollToIndex brings a row into view", async () => {
    const list = ref<{ scrollToIndex(i: number): void } | null>(null);
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            EVirtualList as any,
            { ref: list, items, rowHeight: 40, style: "height: 400px" },
            { default: ({ item }: { item: { name: string } }) => item.name },
          ),
      }),
    );
    await expect.poll(() => rendered(container).length).toBeGreaterThan(0);
    list.value!.scrollToIndex(700);
    await expect.poll(() => rendered(container).some((r) => r.textContent === "Row 701")).toBe(true);
  });

  test("a list that scrolls is a tab stop, named when it has a label, and scrolls with the keys", async () => {
    const { container } = await mount({ label: "Rows" });
    const scroller = container.querySelector<HTMLElement>(".e-vlist")!;
    await expect.poll(() => scroller.tabIndex).toBe(0);
    await expect.element(page.getByRole("region", { name: "Rows" })).toBeVisible();
    await userEvent.tab();
    expect(document.activeElement).toBe(scroller);
    expect(getComputedStyle(scroller).outlineStyle).toBe("solid");
    await userEvent.keyboard("{PageDown}");
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(0);
  });

  test("a short list that does not scroll is not a tab stop", async () => {
    const { container } = await mount({ items: items.slice(0, 3) });
    await nextTick();
    expect(container.querySelector<HTMLElement>(".e-vlist")!.hasAttribute("tabindex")).toBe(false);
  });

  test("keys keep a row's element when the list changes", async () => {
    const list = ref(items.slice(0, 20));
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            EVirtualList as any,
            { items: list.value, rowHeight: 40, itemKey: (item: { id: string }) => item.id, style: "height: 400px" },
            { default: ({ item }: { item: { name: string } }) => item.name },
          ),
      }),
    );
    await expect.poll(() => rendered(container).length).toBeGreaterThan(0);
    const second = rendered(container)[1]!;
    expect(second.textContent).toBe("Row 2");
    list.value = list.value.slice(1);
    await expect.poll(() => rendered(container)[0]!.textContent).toBe("Row 2");
    expect(rendered(container)[0]).toBe(second);
  });

  test("class, style and attributes land on the scroller", async () => {
    const { container } = await render(EVirtualList as any, {
      props: { items, rowHeight: 40 },
      attrs: { class: "mine", "data-x": "1", style: "height: 200px" },
      slots: { default: () => "x" },
    });
    const scroller = container.querySelector<HTMLElement>(".e-vlist")!;
    expect(scroller.classList.contains("mine")).toBe(true);
    expect(scroller.getAttribute("data-x")).toBe("1");
    expect(scroller.getBoundingClientRect().height).toBe(200);
  });

  test("has no axe violations", async () => {
    const { container } = await mount({ label: "Rows" });
    await expect.poll(() => rendered(container).length).toBeGreaterThan(0);
    await expectNoViolations(container);
  });
});
