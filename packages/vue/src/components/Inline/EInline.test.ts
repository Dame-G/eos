import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EInline from "./EInline.vue";
import { expectNoViolations } from "../../../test/axe.js";

const box = { width: "100px", display: "inline-block" };
const kids = () => [h("span", { style: box }, "One"), h("span", { style: box }, "Two")];

describe("EInline", () => {
  test("a number gap becomes the space token, default is the snug gap", async () => {
    const a = await render(EInline, { props: { gap: 3 }, slots: { default: kids } });
    expect((a.container.firstElementChild as HTMLElement).style.getPropertyValue("--_gap")).toBe("var(--e-space-3)");
    const b = await render(EInline, { slots: { default: kids } });
    expect((b.container.firstElementChild as HTMLElement).style.getPropertyValue("--_gap")).toBe("var(--e-gap-snug)");
    const c = await render(EInline, { props: { gap: "section" }, slots: { default: kids } });
    expect((c.container.firstElementChild as HTMLElement).style.getPropertyValue("--_gap")).toBe(
      "var(--e-gap-section)",
    );
  });

  test("wrap=false keeps the children on one line", async () => {
    const { container } = await render(EInline, { props: { wrap: false }, slots: { default: kids } });
    expect(container.firstElementChild!.classList.contains("e-inline--nowrap")).toBe(true);
  });

  test("justify and align and wrap=false add modifier classes", async () => {
    const { container } = await render(EInline, {
      props: { justify: "between", align: "baseline", wrap: false },
      slots: { default: kids },
    });
    expect(container.firstElementChild!.className).toBe(
      "e-inline e-inline--nowrap e-inline--j-between e-inline--a-baseline",
    );
  });

  test("justify and align take the standard values", async () => {
    const { container } = await render(EInline, {
      props: { justify: "center", align: "stretch" },
      slots: { default: kids },
    });
    const el = container.firstElementChild as HTMLElement;
    expect(getComputedStyle(el).justifyContent).toBe("center");
    expect(getComputedStyle(el).alignItems).toBe("stretch");
  });

  test("a gap above 8 is a space token", async () => {
    const { container } = await render(EInline, { props: { gap: 12 }, slots: { default: kids } });
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--_gap")).toBe("var(--e-space-12)");
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

  test("wraps when it runs out of room, and not with wrap=false", async () => {
    const wrapped = await render(
      defineComponent({ render: () => h("div", { style: { width: "150px" } }, [h(EInline, null, kids)]) }),
    );
    const [a, b] = [...wrapped.container.querySelectorAll("span")].map((s) => s.getBoundingClientRect());
    expect(b!.top).toBeGreaterThan(a!.bottom - 1);
    const single = await render(
      defineComponent({ render: () => h("div", { style: { width: "150px" } }, [h(EInline, { wrap: false }, kids)]) }),
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
    expect(el.style.getPropertyValue("--_gap")).toBe("var(--e-gap-snug)");
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
