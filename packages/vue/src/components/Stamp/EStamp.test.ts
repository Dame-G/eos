import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EStamp from "./EStamp.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const STATUSES = [
  ["paid", "Paid", "success"],
  ["due", "Due", "info"],
  ["overdue", "Overdue", "danger"],
  ["action", "Action needed", "warning"],
  ["scheduled", "Scheduled", "info"],
  ["confirmed", "Confirmed", "success"],
  ["cancelled", "Cancelled", "danger"],
  ["signed", "Signed", "success"],
  ["pending", "Pending", "info"],
  ["complete", "Complete", "success"],
] as const;

describe("EStamp", () => {
  test("a status preset gives the word as plain text", async () => {
    const { container } = await render(EStamp, { props: { status: "overdue" } });
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Overdue");
    expect(container.querySelector(".e-stamp svg")).toBeNull();
    expect(container.querySelector(".e-stamp")!.tagName).toBe("SPAN");
    expect(container.querySelector(".e-stamp")!.hasAttribute("role")).toBe(false);
    expect(container.querySelector(".e-stamp")!.textContent).toBe("Overdue");
  });

  test.each(STATUSES)("preset %s reads %s and uses the %s tone", async (status, word, tone) => {
    const { container } = await render(EStamp, { props: { status } });
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe(word);
    expect(container.querySelector(".e-stamp")!.className).toBe(`e-stamp e-stamp--${tone}`);
  });

  test("a tone with a label and an icon works without a status", async () => {
    const { container } = await render(EStamp, { props: { tone: "warning", label: "Review", icon: "pin" } });
    expect(container.querySelector(".e-stamp")!.className).toBe("e-stamp e-stamp--warning");
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Review");
    expect(container.querySelector("svg.e-icon")).not.toBeNull();
  });

  test("with nothing it is a neutral stamp that says Status", async () => {
    const { container } = await render(EStamp);
    expect(container.querySelector(".e-stamp")!.className).toBe("e-stamp");
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Status");
  });

  test("a label overrides the preset word and a tone overrides the preset tone", async () => {
    const { container } = await render(EStamp, { props: { status: "paid", label: "Settled", tone: "info" } });
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Settled");
    expect(container.querySelector(".e-stamp")!.className).toBe("e-stamp e-stamp--info");
  });

  test("the slot is the word, and neutral and ink tones add no modifier", async () => {
    for (const tone of ["neutral", "ink"] as const) {
      const { container } = await render(EStamp, { props: { tone }, slots: { default: "Draft" } });
      expect(container.querySelector(".e-stamp")!.className).toBe("e-stamp");
      expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Draft");
    }
  });

  test("final is an outline in the stamp ink, not a fill", async () => {
    const { container } = await render(EStamp, { props: { status: "paid", final: true } });
    const el = container.querySelector(".e-stamp")!;
    expect(el.classList.contains("e-stamp--final")).toBe(true);
    expect(getComputedStyle(el).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(el).boxShadow).not.toBe("none");
  });

  test("a tinted chip with an edge in its tone and a thick side on the inline-start edge, as a notice has", async () => {
    for (const props of [
      {},
      { status: "paid" },
      { status: "overdue" },
      { tone: "warning" },
      { status: "paid", size: "sm" },
    ] as Record<string, unknown>[]) {
      const { container } = await render(EStamp, { props });
      container.classList.add("e-root");
      const style = getComputedStyle(container.querySelector(".e-stamp")!);
      expect(parseFloat(style.borderInlineStartWidth), JSON.stringify(props)).toBeGreaterThan(
        parseFloat(style.borderTopWidth),
      );
      expect(parseFloat(style.borderTopWidth)).toBeGreaterThan(0);
      expect(style.borderInlineStartColor, JSON.stringify(props)).toBe(style.borderTopColor);
      // Tinted, not filled: the edge is a stronger colour than the background behind the word.
      expect(style.borderTopColor, JSON.stringify(props)).not.toBe(style.backgroundColor);
    }
  });

  test("the side takes no room from the text: the word starts where it did", async () => {
    const { container } = await render(EStamp, { props: { status: "paid" } });
    container.classList.add("e-root");
    const el = container.querySelector(".e-stamp")!;
    const style = getComputedStyle(el);
    const start = parseFloat(style.borderInlineStartWidth) + parseFloat(style.paddingInlineStart);
    const end = parseFloat(style.borderInlineEndWidth) + parseFloat(style.paddingInlineEnd);
    expect(Math.abs(start - end)).toBeLessThanOrEqual(0.5);
  });

  test("a final stamp is a ring and has no side", async () => {
    const { container } = await render(EStamp, { props: { status: "paid", final: true } });
    container.classList.add("e-root");
    expect(getComputedStyle(container.querySelector(".e-stamp")!).borderInlineStartWidth).toBe("0px");
  });

  test("capitals come from CSS, so the text stays sentence case", async () => {
    const { container } = await render(EStamp, { slots: { default: "Paid in full" } });
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Paid in full");
    expect(getComputedStyle(container.querySelector(".e-stamp-word")!).textTransform).toBe("uppercase");
  });

  test("a detail is shown after the word in the text", async () => {
    const { container } = await render(EStamp, { props: { status: "due", detail: "in 3 days" } });
    expect(container.querySelector(".e-stamp-detail")!.textContent).toBe("in 3 days");
    expect(container.querySelector(".e-stamp")!.textContent).toContain("in 3 days");
  });

  test("size sm is shorter", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EStamp, { status: "paid" }), h(EStamp, { status: "paid", small: true })]),
      }),
    );
    const [big, small] = [...container.querySelectorAll(".e-stamp")].map((e) => e.getBoundingClientRect().height);
    expect(big).toBeGreaterThanOrEqual(28);
    expect(small).toBeLessThan(big!);
    expect(container.querySelector(".e-stamp--sm")).not.toBeNull();
  });

  test("size sm matches the small flag, and the stamp sets no placement of its own", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EStamp, { status: "paid", size: "sm" }), h(EStamp, { status: "paid", small: true })]),
      }),
    );
    const [a, b] = [...container.querySelectorAll<HTMLElement>(".e-stamp")];
    expect(a!.getBoundingClientRect().height).toBe(b!.getBoundingClientRect().height);
    expect(getComputedStyle(a!).alignSelf).toBe("auto");
    expect(getComputedStyle(a!).justifySelf).toBe("auto");
  });

  test("a warning stamp reads its text in the warning colour, on its tint", async () => {
    const { container } = await render(EStamp, { props: { tone: "warning", label: "Review" } });
    const probe = document.createElement("span");
    probe.style.color = "var(--e-warning)";
    container.append(probe);
    expect(getComputedStyle(container.querySelector(".e-stamp")!).color).toBe(getComputedStyle(probe).color);
  });

  test("the words come from the configured messages", async () => {
    const plugin = createEos({ messages: { "status.paid": "Settled up" }, warnOnContrast: false });
    const { container } = await render(EStamp, { props: { status: "paid" }, global: { plugins: [plugin] } });
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Settled up");
  });

  test("is not interactive", async () => {
    const { container } = await render(EStamp, { props: { status: "paid" } });
    const el = container.querySelector(".e-stamp")! as HTMLElement;
    expect(el.tabIndex).toBe(-1);
    expect(getComputedStyle(el).cursor).not.toBe("pointer");
  });

  test("attributes fall through to the root", async () => {
    const { container } = await render(EStamp, {
      props: { status: "paid" },
      attrs: { "data-testid": "s", class: "mine" },
    });
    const el = container.querySelector(".e-stamp")!;
    expect(el.getAttribute("data-testid")).toBe("s");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            ...STATUSES.map(([status]) => h(EStamp, { status })),
            h(EStamp, { status: "due", detail: "in 3 days", small: true }),
            h(EStamp, { tone: "warning", label: "Review" }),
            h(EStamp, null, () => "Draft"),
            h(EStamp, { tone: "ink" }, () => "Ink"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
