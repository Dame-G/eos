import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EGrid from "./EGrid.vue";
import { expectNoViolations } from "../../../test/axe.js";

const cell = (text: string, style: Record<string, string> = {}) => h("div", { class: "cell", style }, text);

describe("EGrid", () => {
  test("sets --e-gap (default space 4) and --e-min (default 16rem)", async () => {
    const { container } = await render(EGrid, { slots: { default: () => cell("a") } });
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toBe("e-grid-layout");
    expect(el.style.getPropertyValue("--e-gap")).toBe("var(--e-space-4)");
    expect(el.style.getPropertyValue("--e-min")).toBe("16rem");
  });

  test("gap and min are taken from the props", async () => {
    const { container } = await render(EGrid, {
      props: { gap: 3, min: "10rem" },
      slots: { default: () => cell("a") },
    });
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--e-gap")).toBe("var(--e-space-3)");
    expect(el.style.getPropertyValue("--e-min")).toBe("10rem");
  });

  test("makes as many equal columns as fit, and one below the minimum", async () => {
    const items = () => [cell("a"), cell("b"), cell("c")];
    const wide = await render(
      defineComponent({ render: () => h("div", { style: { width: "800px" } }, [h(EGrid, { min: "15rem" }, items)]) }),
    );
    const tops = [...wide.container.querySelectorAll<HTMLElement>(".cell")].map((c) =>
      Math.round(c.getBoundingClientRect().top),
    );
    expect(new Set(tops).size).toBe(1);
    const widths = [...wide.container.querySelectorAll<HTMLElement>(".cell")].map((c) =>
      Math.round(c.getBoundingClientRect().width),
    );
    expect(new Set(widths).size).toBe(1);

    const narrow = await render(
      defineComponent({ render: () => h("div", { style: { width: "200px" } }, [h(EGrid, { min: "15rem" }, items)]) }),
    );
    const lefts = [...narrow.container.querySelectorAll<HTMLElement>(".cell")].map((c) =>
      Math.round(c.getBoundingClientRect().left),
    );
    expect(new Set(lefts).size).toBe(1);
  });

  test("items stretch to the tallest in their row", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "600px" } }, [
            h(EGrid, { min: "15rem", gap: 3 }, () => [cell("short"), cell("tall", { height: "120px" })]),
          ]),
      }),
    );
    const [a, b] = [...container.querySelectorAll<HTMLElement>(".cell")];
    expect(Math.round(a!.getBoundingClientRect().height)).toBe(120);
    expect(Math.round(b!.getBoundingClientRect().height)).toBe(120);
  });

  test("masonry packs uneven cards into columns without stretching them", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "600px" } }, [
            h(EGrid, { min: "15rem", gap: 3, masonry: true }, () => [
              cell("a", { height: "120px" }),
              cell("b", { height: "40px" }),
              cell("c", { height: "40px" }),
            ]),
          ]),
      }),
    );
    expect(container.querySelector(".e-grid-layout")!.classList.contains("e-grid-layout--masonry")).toBe(true);
    const [a, b, c] = [...container.querySelectorAll<HTMLElement>(".cell")].map((x) => x.getBoundingClientRect());
    expect(Math.round(a!.height)).toBe(120);
    expect(Math.round(b!.height)).toBe(40);
    expect(b!.left).toBeGreaterThan(a!.left);
    expect(Math.round(c!.top)).toBeGreaterThan(Math.round(b!.top));
  });

  test("`as` chooses the element; class, style and attributes fall through", async () => {
    const { container } = await render(EGrid, {
      props: { as: "ul" },
      attrs: { class: "mine", style: "margin-top: 5px", "aria-label": "Cards" },
      slots: { default: () => h("li", "x") },
    });
    const el = container.querySelector("ul")!;
    expect(el.classList.contains("e-grid-layout")).toBe(true);
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.style.marginTop).toBe("5px");
    expect(el.style.getPropertyValue("--e-min")).toBe("16rem");
    expect(el.getAttribute("aria-label")).toBe("Cards");
  });

  test("a cell with wide content stays inside its column", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: "width: 300px" }, [
            h(EGrid, { min: "9rem" }, () => [h("div", { style: "white-space: nowrap" }, "x".repeat(80)), cell("b")]),
          ]),
      }),
    );
    const grid = container.querySelector(".e-grid-layout")!.getBoundingClientRect();
    for (const c of container.querySelectorAll(".e-grid-layout > *")) {
      expect(c.getBoundingClientRect().right).toBeLessThanOrEqual(grid.right + 1);
    }
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h(EGrid, null, () => [cell("a"), cell("b")]), h(EGrid, { as: "ul" }, () => h("li", "x"))]),
      }),
    );
    await expectNoViolations(container);
  });
});
