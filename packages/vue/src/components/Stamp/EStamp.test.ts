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

  test("the words come from the configured messages", async () => {
    const plugin = createEos({ messages: { "status.paid": "Settled up" }, warnOnContrast: false });
    const { container } = await render(EStamp, { props: { status: "paid" }, global: { plugins: [plugin] } });
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Settled up");
  });

  test("is not interactive", async () => {
    const { container } = await render(EStamp, { props: { status: "paid" } });
    const el = container.querySelector(".e-stamp")! as HTMLElement;
    expect(el.tabIndex).toBe(-1);
    expect(getComputedStyle(el).cursor).toBe("default");
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
