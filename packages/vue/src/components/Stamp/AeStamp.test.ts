import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeStamp from "./AeStamp.vue";
import { createAegis } from "../../plugin.js";
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

describe("AeStamp", () => {
  test("a status preset gives the word, a glyph and the label (suite: StatusStamp)", async () => {
    const { container } = await render(AeStamp, { props: { status: "overdue" } });
    expect(container.querySelector(".ae-stamp-word")!.textContent).toBe("Overdue");
    expect(container.querySelector(".ae-stamp svg")).not.toBeNull();
    expect(container.querySelector(".ae-stamp")!.getAttribute("aria-label")).toBe("Overdue");
    await expect.element(page.getByRole("img", { name: "Overdue" })).toBeVisible();
  });

  test.each(STATUSES)("preset %s reads %s and uses the %s tone", async (status, word, tone) => {
    const { container } = await render(AeStamp, { props: { status } });
    expect(container.querySelector(".ae-stamp-word")!.textContent).toBe(word);
    expect(container.querySelector(".ae-stamp")!.className).toBe(`ae-stamp ae-stamp--${tone}`);
  });

  test("a tone with a label and an icon works without a status", async () => {
    const { container } = await render(AeStamp, { props: { tone: "warning", label: "Review", icon: "pin" } });
    expect(container.querySelector(".ae-stamp")!.className).toBe("ae-stamp ae-stamp--warning");
    expect(container.querySelector(".ae-stamp-word")!.textContent).toBe("Review");
    expect(container.querySelector("svg.ae-icon")).not.toBeNull();
  });

  test("with nothing it is an info stamp that says Status", async () => {
    const { container } = await render(AeStamp);
    expect(container.querySelector(".ae-stamp")!.className).toBe("ae-stamp ae-stamp--info");
    expect(container.querySelector(".ae-stamp-word")!.textContent).toBe("Status");
  });

  test("a label overrides the preset word and a tone overrides the preset tone", async () => {
    const { container } = await render(AeStamp, { props: { status: "paid", label: "Settled", tone: "info" } });
    expect(container.querySelector(".ae-stamp-word")!.textContent).toBe("Settled");
    expect(container.querySelector(".ae-stamp")!.className).toBe("ae-stamp ae-stamp--info");
  });

  test("a detail is shown after the word and joins the accessible name", async () => {
    const { container } = await render(AeStamp, { props: { status: "due", detail: "in 3 days" } });
    expect(container.querySelector(".ae-stamp-detail")!.textContent).toBe("in 3 days");
    expect(container.querySelector(".ae-stamp")!.getAttribute("aria-label")).toBe("Due, in 3 days");
    await expect.element(page.getByRole("img", { name: "Due, in 3 days" })).toBeVisible();
  });

  test("small is shorter", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", [h(AeStamp, { status: "paid" }), h(AeStamp, { status: "paid", small: true })]),
      }),
    );
    const [big, small] = [...container.querySelectorAll(".ae-stamp")].map((e) => e.getBoundingClientRect().height);
    expect(big).toBeGreaterThanOrEqual(28);
    expect(small).toBeLessThan(big!);
    expect(container.querySelector(".ae-stamp--s")).not.toBeNull();
  });

  test("the words come from the configured messages", async () => {
    const plugin = createAegis({ messages: { "status.paid": "Settled up" }, warnOnContrast: false });
    const { container } = await render(AeStamp, { props: { status: "paid" }, global: { plugins: [plugin] } });
    expect(container.querySelector(".ae-stamp-word")!.textContent).toBe("Settled up");
    expect(container.querySelector(".ae-stamp")!.getAttribute("aria-label")).toBe("Settled up");
  });

  test("is not interactive", async () => {
    const { container } = await render(AeStamp, { props: { status: "paid" } });
    const el = container.querySelector(".ae-stamp")! as HTMLElement;
    expect(el.tabIndex).toBe(-1);
    expect(getComputedStyle(el).cursor).toBe("default");
  });

  test("attributes fall through to the root", async () => {
    const { container } = await render(AeStamp, {
      props: { status: "paid" },
      attrs: { "data-testid": "s", class: "mine" },
    });
    const el = container.querySelector(".ae-stamp")!;
    expect(el.getAttribute("data-testid")).toBe("s");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            ...STATUSES.map(([status]) => h(AeStamp, { status })),
            h(AeStamp, { status: "due", detail: "in 3 days", small: true }),
            h(AeStamp, { tone: "warning", label: "Review" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
