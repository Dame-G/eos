import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EStack from "./EStack.vue";
import { expectNoViolations } from "../../../test/axe.js";

const kids = () => [h("p", "One"), h("p", "Two")];

describe("EStack", () => {
  test("a number gap becomes the space token, default 4", async () => {
    const a = await render(EStack, { props: { gap: 6 }, slots: { default: kids } });
    expect((a.container.firstElementChild as HTMLElement).style.getPropertyValue("--e-gap")).toBe("var(--e-space-6)");
    const b = await render(EStack, { slots: { default: kids } });
    expect((b.container.firstElementChild as HTMLElement).style.getPropertyValue("--e-gap")).toBe("var(--e-space-4)");
  });

  test("a string gap is used as given", async () => {
    const { container } = await render(EStack, { props: { gap: "10px" }, slots: { default: kids } });
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--e-gap")).toBe("10px");
  });

  test("children sit one under another with the gap between them", async () => {
    const { container } = await render(EStack, {
      props: { gap: "10px" },
      slots: { default: () => [h("p", { style: { margin: "0" } }, "One"), h("p", { style: { margin: "0" } }, "Two")] },
    });
    const [a, b] = [...container.querySelectorAll("p")].map((p) => p.getBoundingClientRect());
    expect(Math.round(b!.top - a!.bottom)).toBe(10);
  });

  test("align adds a modifier and aligns across the column", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", { style: { width: "400px" } }, [h(EStack, { align: "end" }, () => h("span", "x"))]),
      }),
    );
    expect(container.querySelector(".e-stack--end")).not.toBeNull();
    const span = container.querySelector("span")!.getBoundingClientRect();
    const stack = container.querySelector(".e-stack")!.getBoundingClientRect();
    expect(Math.round(span.right)).toBe(Math.round(stack.right));
  });

  test("`as` chooses the element; class, style and attributes fall through", async () => {
    const { container } = await render(EStack, {
      props: { as: "ul" },
      attrs: { class: "mine", style: "margin-top: 5px", "aria-label": "List", "data-x": "1" },
      slots: { default: () => h("li", "x") },
    });
    const el = container.querySelector("ul")!;
    expect(el.classList.contains("e-stack")).toBe(true);
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.style.marginTop).toBe("5px");
    expect(el.style.getPropertyValue("--e-gap")).toBe("var(--e-space-4)");
    expect(el.getAttribute("aria-label")).toBe("List");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EStack, { align: "center" }, kids), h(EStack, { as: "ul" }, () => h("li", "x"))]),
      }),
    );
    await expectNoViolations(container);
  });

  test("a child wider than the room shrinks to it instead of widening the stack", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "200px" } }, [
            h(EStack, null, () =>
              h("div", { class: "wide", style: { width: "20.5rem", maxWidth: "100%" } }, "A fixed width"),
            ),
          ]),
      }),
    );
    expect(Math.round(container.querySelector(".wide")!.getBoundingClientRect().width)).toBe(200);
  });
});
