import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EText from "./EText.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EText", () => {
  test("is a paragraph in the body size by default", async () => {
    const { container } = await render(EText, { slots: { default: "You paid in full." } });
    const p = container.querySelector("p")!;
    expect(p.className).toBe("e-text");
    expect(p.textContent).toBe("You paid in full.");
    const style = getComputedStyle(p);
    expect(style.fontSize).toBe("16px");
    expect(style.lineHeight).toBe("24px");
  });

  test("large is 18px and small is 14px", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EText, { large: true }, () => "D"), h(EText, { small: true }, () => "S")]),
      }),
    );
    const [deck, small] = [...container.querySelectorAll("p")];
    expect(getComputedStyle(deck!).fontSize).toBe("18px");
    expect(getComputedStyle(deck!).lineHeight).toBe("27px");
    expect(getComputedStyle(small!).fontSize).toBe("14px");
    expect(getComputedStyle(small!).lineHeight).toBe("21px");
  });

  test("size sm and lg match the small and large flags", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EText, { size: "lg" }, () => "D"), h(EText, { size: "sm" }, () => "S")]),
      }),
    );
    const [deck, small] = [...container.querySelectorAll("p")];
    expect(getComputedStyle(deck!).fontSize).toBe("18px");
    expect(getComputedStyle(small!).fontSize).toBe("14px");
  });

  test("size wins over the flags and warns in development", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = await render(EText, { props: { size: "lg", small: true }, slots: { default: "x" } });
    expect(getComputedStyle(container.querySelector("p")!).fontSize).toBe("18px");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("EText"));
    warn.mockRestore();
  });

  test("tone colours the text, and muted is the muted tone", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EText, null, () => "A"),
            h(EText, { tone: "danger" }, () => "B"),
            h(EText, { tone: "muted" }, () => "C"),
            h(EText, { muted: true }, () => "D"),
          ]),
      }),
    );
    const [a, b, c, d] = [...container.querySelectorAll("p")].map((p) => getComputedStyle(p).color);
    expect(b).not.toBe(a);
    expect(c).not.toBe(a);
    expect(d).toBe(c);
  });

  test("align, weight and mono change the text", async () => {
    const { container } = await render(EText, {
      props: { align: "center", weight: "strong", mono: true },
      slots: { default: "x" },
    });
    const style = getComputedStyle(container.querySelector("p")!);
    expect(style.textAlign).toBe("center");
    expect(style.fontWeight).toBe("600");
    expect(style.fontFamily).toContain("mono");
  });

  test("truncate keeps one line with an ellipsis, and lines cuts after that many", async () => {
    const long = "word ".repeat(100);
    const box = (props: Record<string, unknown>) =>
      render(defineComponent({ render: () => h("div", { style: { width: "200px" } }, [h(EText, props, () => long)]) }));
    const one = await box({ truncate: true });
    expect(one.container.querySelector("p")!.getBoundingClientRect().height).toBeLessThan(30);
    const two = await box({ lines: 2 });
    const height = two.container.querySelector("p")!.getBoundingClientRect().height;
    expect(height).toBeGreaterThan(30);
    expect(height).toBeLessThan(60);
  });

  test("measure=false lets the text fill a wide cell", async () => {
    const wide = (props: Record<string, unknown>) =>
      render(
        defineComponent({
          render: () => h("div", { style: { width: "1400px" } }, [h(EText, props, () => "word ".repeat(300))]),
        }),
      );
    const capped = await wide({});
    expect(capped.container.querySelector("p")!.getBoundingClientRect().width).toBeLessThanOrEqual(62 * 16);
    const free = await wide({ measure: false });
    expect(free.container.querySelector("p")!.getBoundingClientRect().width).toBeGreaterThan(1300);
  });

  test("muted changes the colour", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EText, null, () => "A"), h(EText, { muted: true }, () => "B")]),
      }),
    );
    const [a, b] = [...container.querySelectorAll("p")];
    expect(b!.className).toBe("e-text e-text--muted");
    expect(getComputedStyle(a!).color).not.toBe(getComputedStyle(b!).color);
  });

  test("as changes the element", async () => {
    const { container } = await render(EText, { props: { as: "span" }, slots: { default: "Inline" } });
    expect(container.querySelector("span.e-text")).not.toBeNull();
    expect(container.querySelector("p")).toBeNull();
  });

  test("is capped at the reading measure", async () => {
    const { container } = await render(EText, { slots: { default: "word ".repeat(200) } });
    const width = container.querySelector("p")!.getBoundingClientRect().width;
    expect(width).toBeLessThanOrEqual(62 * 16);
  });

  test("attributes fall through to the element", async () => {
    const { container } = await render(EText, {
      attrs: { id: "t1", "data-testid": "t", class: "mine" },
      slots: { default: "Text" },
    });
    const p = container.querySelector("p")!;
    expect(p.id).toBe("t1");
    expect(p.getAttribute("data-testid")).toBe("t");
    expect(p.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations in any size", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EText, null, () => "Body"),
            h(EText, { large: true }, () => "Large"),
            h(EText, { small: true, muted: true }, () => "Small muted"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
