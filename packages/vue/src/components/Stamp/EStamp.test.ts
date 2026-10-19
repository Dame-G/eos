import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
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
  test("is solid by default and subtle on request", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h(EStamp, { status: "overdue" }), h(EStamp, { status: "overdue", variant: "subtle" })]),
      }),
    );
    const [solid, subtle] = [...container.querySelectorAll(".e-stamp")];
    expect(subtle!.classList.contains("e-stamp--subtle")).toBe(true);
    expect(solid!.classList.contains("e-stamp--subtle")).toBe(false);
    const a = getComputedStyle(solid!);
    const b = getComputedStyle(subtle!);
    expect(a.backgroundColor).toBe(b.color);
    expect(a.backgroundColor).not.toBe(a.color);
    expect(b.backgroundColor).not.toBe(a.backgroundColor);
  });

  test("a status preset gives the word, a glyph and the label (suite: StatusStamp)", async () => {
    const { container } = await render(EStamp, { props: { status: "overdue" } });
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Overdue");
    expect(container.querySelector(".e-stamp svg")).not.toBeNull();
    expect(container.querySelector(".e-stamp")!.getAttribute("aria-label")).toBe("Overdue");
    await expect.element(page.getByRole("img", { name: "Overdue" })).toBeVisible();
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

  test("with nothing it is an info stamp that says Status", async () => {
    const { container } = await render(EStamp);
    expect(container.querySelector(".e-stamp")!.className).toBe("e-stamp e-stamp--info");
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Status");
  });

  test("a label overrides the preset word and a tone overrides the preset tone", async () => {
    const { container } = await render(EStamp, { props: { status: "paid", label: "Settled", tone: "info" } });
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Settled");
    expect(container.querySelector(".e-stamp")!.className).toBe("e-stamp e-stamp--info");
  });

  test("a detail is shown after the word and joins the accessible name", async () => {
    const { container } = await render(EStamp, { props: { status: "due", detail: "in 3 days" } });
    expect(container.querySelector(".e-stamp-detail")!.textContent).toBe("in 3 days");
    expect(container.querySelector(".e-stamp")!.getAttribute("aria-label")).toBe("Due, in 3 days");
    await expect.element(page.getByRole("img", { name: "Due, in 3 days" })).toBeVisible();
  });

  test("small is shorter", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(EStamp, { status: "paid" }), h(EStamp, { status: "paid", small: true })]),
      }),
    );
    const [big, small] = [...container.querySelectorAll(".e-stamp")].map((e) => e.getBoundingClientRect().height);
    expect(big).toBeGreaterThanOrEqual(28);
    expect(small).toBeLessThan(big!);
    expect(container.querySelector(".e-stamp--s")).not.toBeNull();
  });

  test("the words come from the configured messages", async () => {
    const plugin = createEos({ messages: { "status.paid": "Settled up" }, warnOnContrast: false });
    const { container } = await render(EStamp, { props: { status: "paid" }, global: { plugins: [plugin] } });
    expect(container.querySelector(".e-stamp-word")!.textContent).toBe("Settled up");
    expect(container.querySelector(".e-stamp")!.getAttribute("aria-label")).toBe("Settled up");
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
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
