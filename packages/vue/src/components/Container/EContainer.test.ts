import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EContainer from "./EContainer.vue";
import { expectNoViolations } from "../../../test/axe.js";

const inPage = (width: number, props: Record<string, unknown> = {}) =>
  render(
    defineComponent({
      render: () =>
        h("div", { class: "e-root", style: { width: `${width}px` } }, [h(EContainer, props, () => "Content")]),
    }),
  );

describe("EContainer", () => {
  test("is as wide as its size allows and centred", async () => {
    const { container } = await inPage(2000);
    const rect = container.querySelector(".e-container")!.getBoundingClientRect();
    expect(rect.width).toBe(80 * 16);
    const outer = container.firstElementChild!.getBoundingClientRect();
    expect(Math.round(rect.left - outer.left)).toBe(Math.round(outer.right - rect.right));
  });

  test("each size sets its own maximum, and full has none", async () => {
    const widths: number[] = [];
    for (const size of ["sm", "md", "lg", "full"]) {
      const { container } = await inPage(2000, { size });
      widths.push(container.querySelector(".e-container")!.getBoundingClientRect().width);
    }
    expect(widths).toEqual([640, 960, 1280, 2000]);
  });

  test("keeps the gutter at its sides unless told not to", async () => {
    const a = await inPage(400);
    expect(
      parseFloat(getComputedStyle(a.container.querySelector(".e-container")!).paddingInlineStart),
    ).toBeGreaterThanOrEqual(16);
    const b = await inPage(400, { gutter: false });
    expect(getComputedStyle(b.container.querySelector(".e-container")!).paddingInlineStart).toBe("0px");
  });

  test("`as` chooses the element and attributes fall through", async () => {
    const { container } = await render(EContainer, {
      props: { as: "main" },
      attrs: { id: "m", class: "mine" },
      slots: { default: "x" },
    });
    const el = container.querySelector("main")!;
    expect(el.id).toBe("m");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(EContainer, {
      props: { as: "section" },
      attrs: { "aria-label": "Page" },
      slots: { default: "x" },
    });
    await expectNoViolations(container);
  });
});
