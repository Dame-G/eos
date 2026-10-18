import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeAccordion from "./AeAccordion.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { id: "a", title: "Billing", meta: "3 items" },
  { id: "b", title: "Privacy", defaultOpen: true },
  { id: "c", title: "Notifications" },
];
const slots = { a: () => "Billing body", b: () => "Privacy body", c: () => "Notification body" };

describe("AeAccordion", () => {
  test("is a stack of native details in the card variant, in a bordered box", async () => {
    const { container } = await render(AeAccordion, { props: { items }, slots });
    container.classList.add("ae-root");
    const all = container.querySelectorAll("details");
    expect(all.length).toBe(3);
    expect(all[0]!.className).toBe("ae-disclosure ae-acc");
    expect(container.querySelector(".ae-accordion")).not.toBeNull();
    expect(container.querySelector(".ae-acc-meta")!.textContent).toBe("3 items");
    expect(getComputedStyle(container.querySelector(".ae-accordion")!).overflow).toBe("hidden");
  });

  test("defaultOpen starts a section open", async () => {
    const { container } = await render(AeAccordion, { props: { items }, slots });
    const open = [...container.querySelectorAll("details")].map((d) => d.open);
    expect(open).toEqual([false, true, false]);
  });

  test("opening one closes the others, since the sections share a group", async () => {
    const { container } = await render(AeAccordion, { props: { items }, slots });
    const all = [...container.querySelectorAll("details")];
    expect(new Set(all.map((d) => d.getAttribute("name"))).size).toBe(1);
    expect(all[0]!.getAttribute("name")).toBeTruthy();
    await page.getByText("Billing").click();
    await expect.poll(() => all.map((d) => d.open)).toEqual([true, false, false]);
  });

  test("multiple lets several stay open", async () => {
    const { container } = await render(AeAccordion, { props: { items, multiple: true }, slots });
    const all = [...container.querySelectorAll("details")];
    expect(all[0]!.hasAttribute("name")).toBe(false);
    await page.getByText("Billing").click();
    expect(all.map((d) => d.open)).toEqual([true, true, false]);
  });

  test("each section's content comes from the slot named by its id", async () => {
    const { container } = await render(AeAccordion, { props: { items }, slots });
    expect(container.querySelectorAll(".ae-acc-body")[2]!.textContent).toBe("Notification body");
  });

  test("Tab reaches each summary and Enter or Space opens it", async () => {
    const { container } = await render(AeAccordion, { props: { items, multiple: true }, slots });
    const all = [...container.querySelectorAll("details")];
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(all[0]!.open).toBe(true);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(all[1]!.open).toBe(false);
    await userEvent.tab();
    expect(document.activeElement!.textContent).toContain("Notifications");
  });

  test("class and data attributes fall through to the root", async () => {
    const { container } = await render(AeAccordion, {
      props: { items },
      attrs: { class: "mine", "data-x": "1" },
      slots,
    });
    const el = container.querySelector<HTMLElement>(".ae-accordion")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.dataset.x).toBe("1");
  });

  test("axe finds nothing", async () => {
    const { container } = await render(AeAccordion, { props: { items }, slots });
    container.classList.add("ae-root");
    await expectNoViolations(container);
    await page.getByText("Billing").click();
    await expectNoViolations(container);
  });
});
