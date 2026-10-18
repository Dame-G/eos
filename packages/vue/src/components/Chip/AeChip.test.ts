import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import AeChip from "./AeChip.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeChip", () => {
  test("is a span with the word from the slot, neutral by default", async () => {
    const { container } = await render(AeChip, { slots: { default: "Draft" } });
    const chip = container.querySelector("span")!;
    expect(chip.className).toBe("ae-chip");
    expect(chip.textContent).toBe("Draft");
  });

  test.each(["success", "info", "warning", "danger"] as const)("tone %s adds its modifier class", async (tone) => {
    const { container } = await render(AeChip, { props: { tone }, slots: { default: "Word" } });
    expect(container.querySelector("span")!.className).toBe(`ae-chip ae-chip--${tone}`);
  });

  test("neutral and ink tones add no modifier", async () => {
    for (const tone of ["neutral", "ink"] as const) {
      const { container } = await render(AeChip, { props: { tone }, slots: { default: "Word" } });
      expect(container.querySelector("span")!.className).toBe("ae-chip");
    }
  });

  test("sets sentence case in capitals and keeps a pill shape", async () => {
    const { container } = await render(AeChip, { slots: { default: "Paid in full" } });
    const style = getComputedStyle(container.querySelector("span")!);
    expect(style.textTransform).toBe("uppercase");
    expect(style.whiteSpace).toBe("nowrap");
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(10);
  });

  test("the tone changes the colour of the word", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(AeChip, null, () => "A"), h(AeChip, { tone: "danger" }, () => "B")]),
      }),
    );
    const [a, b] = [...container.querySelectorAll("span")].map((s) => getComputedStyle(s).color);
    expect(a).not.toBe(b);
  });

  test("attributes and classes fall through to the span", async () => {
    const { container } = await render(AeChip, {
      attrs: { class: "mine", "data-testid": "chip", id: "c1" },
      slots: { default: "Word" },
    });
    const chip = container.querySelector("span")!;
    expect(chip.className).toBe("ae-chip mine");
    expect(chip.getAttribute("data-testid")).toBe("chip");
    expect(chip.id).toBe("c1");
  });

  test("has no accessibility violations in any tone", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeChip, null, () => "Neutral"),
            h(AeChip, { tone: "success" }, () => "Paid"),
            h(AeChip, { tone: "info" }, () => "Due"),
            h(AeChip, { tone: "warning" }, () => "Review"),
            h(AeChip, { tone: "danger" }, () => "Overdue"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
