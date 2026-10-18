import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import AeText from "./AeText.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeText", () => {
  test("is a paragraph in the body size by default", async () => {
    const { container } = await render(AeText, { slots: { default: "You paid in full." } });
    const p = container.querySelector("p")!;
    expect(p.className).toBe("ae-text ae-text--body");
    expect(p.textContent).toBe("You paid in full.");
    const style = getComputedStyle(p);
    expect(style.fontSize).toBe("16px");
    expect(style.lineHeight).toBe("24px");
  });

  test("deck is 18px and small is 14px", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(AeText, { variant: "deck" }, () => "D"), h(AeText, { variant: "small" }, () => "S")]),
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
        render: () => h("div", [h(AeText, null, () => "A"), h(AeText, { muted: true }, () => "B")]),
      }),
    );
    const [a, b] = [...container.querySelectorAll("p")];
    expect(b!.className).toBe("ae-text ae-text--body ae-text--muted");
    expect(getComputedStyle(a!).color).not.toBe(getComputedStyle(b!).color);
  });

  test("as changes the element", async () => {
    const { container } = await render(AeText, { props: { as: "span" }, slots: { default: "Inline" } });
    expect(container.querySelector("span.ae-text")).not.toBeNull();
    expect(container.querySelector("p")).toBeNull();
  });

  test("is capped at the reading measure", async () => {
    const { container } = await render(AeText, { slots: { default: "word ".repeat(200) } });
    const width = container.querySelector("p")!.getBoundingClientRect().width;
    expect(width).toBeLessThanOrEqual(62 * 16);
  });

  test("attributes fall through to the element", async () => {
    const { container } = await render(AeText, {
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
            h(AeText, null, () => "Body"),
            h(AeText, { variant: "deck" }, () => "Deck"),
            h(AeText, { variant: "small", muted: true }, () => "Small muted"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
