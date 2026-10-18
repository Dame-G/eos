import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EInline from "./EInline.vue";
import { expectNoViolations } from "../../../test/axe.js";

const box = { width: "100px", display: "inline-block" };
const kids = () => [h("span", { style: box }, "One"), h("span", { style: box }, "Two")];

describe("EInline", () => {
  test("a number gap becomes the space token, default 2", async () => {
    const a = await render(EInline, { props: { gap: 3 }, slots: { default: kids } });
    expect((a.container.firstElementChild as HTMLElement).style.getPropertyValue("--e-gap")).toBe("var(--e-space-3)");
    const b = await render(EInline, { slots: { default: kids } });
    expect((b.container.firstElementChild as HTMLElement).style.getPropertyValue("--e-gap")).toBe("var(--e-space-2)");
  });

  test("justify and align and nowrap add modifier classes", async () => {
    const { container } = await render(EInline, {
      props: { justify: "between", align: "baseline", nowrap: true },
      slots: { default: kids },
    });
    expect(container.firstElementChild!.className).toBe(
      "e-inline e-inline--nowrap e-inline--between e-inline--a-baseline",
    );
  });

  test("justify between pushes the ends apart", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", { style: { width: "500px" } }, [h(EInline, { justify: "between" }, kids)]),
      }),
    );
    const [a, b] = [...container.querySelectorAll("span")].map((s) => s.getBoundingClientRect());
    const row = container.querySelector(".e-inline")!.getBoundingClientRect();
    expect(Math.round(a!.left)).toBe(Math.round(row.left));
    expect(Math.round(b!.right)).toBe(Math.round(row.right));
  });

  test("wraps when it runs out of room, and not with nowrap", async () => {
    const wrapped = await render(
      defineComponent({ render: () => h("div", { style: { width: "150px" } }, [h(EInline, null, kids)]) }),
    );
    const [a, b] = [...wrapped.container.querySelectorAll("span")].map((s) => s.getBoundingClientRect());
    expect(b!.top).toBeGreaterThan(a!.bottom - 1);
    const single = await render(
      defineComponent({ render: () => h("div", { style: { width: "150px" } }, [h(EInline, { nowrap: true }, kids)]) }),
    );
    const [c, d] = [...single.container.querySelectorAll("span")].map((s) => s.getBoundingClientRect());
    expect(Math.abs(c!.top - d!.top)).toBeLessThan(1);
  });

  test("`as` chooses the element; class, style and attributes fall through", async () => {
    const { container } = await render(EInline, {
      props: { as: "ul" },
      attrs: { class: "mine", style: "margin-top: 5px", "aria-label": "Tags" },
      slots: { default: () => h("li", "x") },
    });
    const el = container.querySelector("ul")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.style.marginTop).toBe("5px");
    expect(el.style.getPropertyValue("--e-gap")).toBe("var(--e-space-2)");
    expect(el.getAttribute("aria-label")).toBe("Tags");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EInline, { justify: "end" }, kids), h(EInline, { as: "ul" }, () => h("li", "x"))]),
      }),
    );
    await expectNoViolations(container);
  });
});
