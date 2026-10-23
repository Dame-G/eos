import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EStack from "./EStack.vue";
import { expectNoViolations } from "../../../test/axe.js";

const kids = () => [h("p", "One"), h("p", "Two")];

describe("EStack", () => {
  test("a number gap becomes the space token, default is the base gap", async () => {
    const a = await render(EStack, { props: { gap: 6 }, slots: { default: kids } });
    expect((a.container.firstElementChild as HTMLElement).style.getPropertyValue("--_gap")).toBe("var(--e-space-6)");
    const b = await render(EStack, { slots: { default: kids } });
    expect((b.container.firstElementChild as HTMLElement).style.getPropertyValue("--_gap")).toBe("var(--e-gap-base)");
  });

  test("a gap name becomes the gap token", async () => {
    for (const name of ["tight", "snug", "base", "loose", "section"] as const) {
      const { container } = await render(EStack, { props: { gap: name }, slots: { default: kids } });
      expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--_gap")).toBe(
        `var(--e-gap-${name})`,
      );
    }
  });

  test("a string gap is used as given", async () => {
    const { container } = await render(EStack, { props: { gap: "10px" }, slots: { default: kids } });
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--_gap")).toBe("10px");
  });

  test("children sit one under another with the gap between them", async () => {
    const { container } = await render(EStack, {
      props: { gap: "10px" },
      slots: { default: () => [h("p", { style: { margin: "0" } }, "One"), h("p", { style: { margin: "0" } }, "Two")] },
    });
    const [a, b] = [...container.querySelectorAll("p")].map((p) => p.getBoundingClientRect());
    expect(Math.round(b!.top - a!.bottom)).toBe(10);
  });

  test("align aligns across the column", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", { style: { width: "400px" } }, [h(EStack, { align: "end" }, () => h("span", "x"))]),
      }),
    );
    const span = container.querySelector("span")!.getBoundingClientRect();
    const stack = container.querySelector(".e-stack")!.getBoundingClientRect();
    expect(Math.round(span.right)).toBe(Math.round(stack.right));
  });

  test("every align value is accepted and justify places the children down a taller stack", async () => {
    for (const align of ["start", "center", "end", "stretch", "baseline"] as const) {
      const { container } = await render(EStack, { props: { align }, slots: { default: kids } });
      expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--_a")).toBe(align);
    }
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { height: "300px" } }, [
            h(EStack, { justify: "end", style: { height: "100%" } }, () => h("p", { style: { margin: "0" } }, "x")),
          ]),
      }),
    );
    const p = container.querySelector("p")!.getBoundingClientRect();
    const stack = container.querySelector(".e-stack")!.getBoundingClientRect();
    expect(Math.round(p.bottom)).toBe(Math.round(stack.bottom));
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
    expect(el.style.getPropertyValue("--_gap")).toBe("var(--e-gap-base)");
    expect(el.getAttribute("aria-label")).toBe("List");
  });

  test("a list loses its bullets and padding but keeps its role", async () => {
    const { container } = await render(EStack, { props: { as: "ul" }, slots: { default: () => h("li", "x") } });
    const el = container.querySelector("ul")!;
    expect(el.getAttribute("role")).toBe("list");
    expect(getComputedStyle(el).listStyleType).toBe("none");
    expect(getComputedStyle(el).paddingInlineStart).toBe("0px");
  });

  test("divider draws a hairline between the children, not before the first", async () => {
    const { container } = await render(EStack, {
      props: { divider: true },
      slots: { default: () => [h("p", "A"), h("p", "B")] },
    });
    const [a, b] = [...container.querySelectorAll("p")];
    expect(getComputedStyle(a!).borderBlockStartWidth).toBe("0px");
    expect(getComputedStyle(b!).borderBlockStartWidth).not.toBe("0px");
  });

  test("wrapBelow puts the children side by side when there is room and stacks them when there is not", async () => {
    const cell = (t: string) => h("p", { style: { margin: "0" } }, t);
    const wide = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "600px" } }, [h(EStack, { wrapBelow: "30rem" }, () => [cell("A"), cell("B")])]),
      }),
    );
    const [a, b] = [...wide.container.querySelectorAll("p")].map((p) => p.getBoundingClientRect());
    expect(Math.abs(a!.top - b!.top)).toBeLessThan(1);
    const narrow = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "300px" } }, [h(EStack, { wrapBelow: "30rem" }, () => [cell("A"), cell("B")])]),
      }),
    );
    const [c, d] = [...narrow.container.querySelectorAll("p")].map((p) => p.getBoundingClientRect());
    expect(d!.top).toBeGreaterThan(c!.bottom - 1);
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
