import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EChip from "./EChip.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EChip", () => {
  test("is a span with the word from the slot, neutral by default", async () => {
    const { container } = await render(EChip, { slots: { default: "Draft" } });
    const chip = container.querySelector("span")!;
    expect(chip.className).toBe("e-chip");
    expect(chip.textContent).toBe("Draft");
  });

  test.each(["success", "info", "warning", "danger"] as const)("tone %s adds its modifier class", async (tone) => {
    const { container } = await render(EChip, { props: { tone }, slots: { default: "Word" } });
    expect(container.querySelector("span")!.className).toBe(`e-chip e-chip--${tone}`);
  });

  test("neutral and ink tones add no modifier", async () => {
    for (const tone of ["neutral", "ink"] as const) {
      const { container } = await render(EChip, { props: { tone }, slots: { default: "Word" } });
      expect(container.querySelector("span")!.className).toBe("e-chip");
    }
  });

  test("sets sentence case in capitals and keeps a pill shape", async () => {
    const { container } = await render(EChip, { slots: { default: "Paid in full" } });
    const style = getComputedStyle(container.querySelector("span")!);
    expect(style.textTransform).toBe("uppercase");
    expect(style.whiteSpace).toBe("nowrap");
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(10);
  });

  test("the tone changes the colour of the word", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EChip, null, () => "A"), h(EChip, { tone: "danger" }, () => "B")]),
      }),
    );
    const [a, b] = [...container.querySelectorAll("span")].map((s) => getComputedStyle(s).color);
    expect(a).not.toBe(b);
  });

  test("attributes and classes fall through to the span", async () => {
    const { container } = await render(EChip, {
      attrs: { class: "mine", "data-testid": "chip", id: "c1" },
      slots: { default: "Word" },
    });
    const chip = container.querySelector("span")!;
    expect(chip.className).toBe("e-chip mine");
    expect(chip.getAttribute("data-testid")).toBe("chip");
    expect(chip.id).toBe("c1");
  });

  test("has no accessibility violations in any tone", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EChip, null, () => "Neutral"),
            h(EChip, { tone: "success" }, () => "Paid"),
            h(EChip, { tone: "info" }, () => "Due"),
            h(EChip, { tone: "warning" }, () => "Review"),
            h(EChip, { tone: "danger" }, () => "Overdue"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
