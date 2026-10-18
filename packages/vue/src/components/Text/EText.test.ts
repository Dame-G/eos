import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EText from "./EText.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EText", () => {
  test("is a paragraph in the body size by default", async () => {
    const { container } = await render(EText, { slots: { default: "You paid in full." } });
    const p = container.querySelector("p")!;
    expect(p.className).toBe("e-text e-text--body");
    expect(p.textContent).toBe("You paid in full.");
    const style = getComputedStyle(p);
    expect(style.fontSize).toBe("16px");
    expect(style.lineHeight).toBe("24px");
  });

  test("deck is 18px and small is 14px", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EText, { variant: "deck" }, () => "D"), h(EText, { variant: "small" }, () => "S")]),
      }),
    );
    const [deck, small] = [...container.querySelectorAll("p")];
    expect(getComputedStyle(deck!).fontSize).toBe("18px");
    expect(getComputedStyle(deck!).lineHeight).toBe("26px");
    expect(getComputedStyle(small!).fontSize).toBe("14px");
    expect(getComputedStyle(small!).lineHeight).toBe("20px");
  });

  test("muted changes the colour", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EText, null, () => "A"), h(EText, { muted: true }, () => "B")]),
      }),
    );
    const [a, b] = [...container.querySelectorAll("p")];
    expect(b!.className).toBe("e-text e-text--body e-text--muted");
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

  test("has no accessibility violations in any variant", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EText, null, () => "Body"),
            h(EText, { variant: "deck" }, () => "Deck"),
            h(EText, { variant: "small", muted: true }, () => "Small muted"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
