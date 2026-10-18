import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import AeStack from "./AeStack.vue";
import { expectNoViolations } from "../../../test/axe.js";

const kids = () => [h("p", "One"), h("p", "Two")];

describe("AeStack", () => {
  test("a number gap becomes the space token, default 4", async () => {
    const a = await render(AeStack, { props: { gap: 6 }, slots: { default: kids } });
    expect((a.container.firstElementChild as HTMLElement).style.getPropertyValue("--ae-gap")).toBe("var(--ae-space-6)");
    const b = await render(AeStack, { slots: { default: kids } });
    expect((b.container.firstElementChild as HTMLElement).style.getPropertyValue("--ae-gap")).toBe("var(--ae-space-4)");
  });

  test("a string gap is used as given", async () => {
    const { container } = await render(AeStack, { props: { gap: "10px" }, slots: { default: kids } });
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--ae-gap")).toBe("10px");
  });

  test("children sit one under another with the gap between them", async () => {
    const { container } = await render(AeStack, {
      props: { gap: "10px" },
      slots: { default: () => [h("p", { style: { margin: "0" } }, "One"), h("p", { style: { margin: "0" } }, "Two")] },
    });
    const [a, b] = [...container.querySelectorAll("p")].map((p) => p.getBoundingClientRect());
    expect(Math.round(b!.top - a!.bottom)).toBe(10);
  });

  test("align adds a modifier and aligns across the column", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", { style: { width: "400px" } }, [h(AeStack, { align: "end" }, () => h("span", "x"))]),
      }),
    );
    expect(container.querySelector(".ae-stack--end")).not.toBeNull();
    const span = container.querySelector("span")!.getBoundingClientRect();
    const stack = container.querySelector(".ae-stack")!.getBoundingClientRect();
    expect(Math.round(span.right)).toBe(Math.round(stack.right));
  });

  test("`as` chooses the element; class, style and attributes fall through", async () => {
    const { container } = await render(AeStack, {
      props: { as: "ul" },
      attrs: { class: "mine", style: "margin-top: 5px", "aria-label": "List", "data-x": "1" },
      slots: { default: () => h("li", "x") },
    });
    const el = container.querySelector("ul")!;
    expect(el.classList.contains("ae-stack")).toBe(true);
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.style.marginTop).toBe("5px");
    expect(el.style.getPropertyValue("--ae-gap")).toBe("var(--ae-space-4)");
    expect(el.getAttribute("aria-label")).toBe("List");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(AeStack, { align: "center" }, kids), h(AeStack, { as: "ul" }, () => h("li", "x"))]),
      }),
    );
    await expectNoViolations(container);
  });
});
