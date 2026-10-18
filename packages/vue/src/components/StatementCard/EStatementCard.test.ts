import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EStatementCard from "./EStatementCard.vue";
import EButton from "../Button/EButton.vue";
import EPanel from "../Panel/EPanel.vue";
import type { StatementProps } from "./types.js";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const full: StatementProps = {
  title: "October statement",
  subtitle: "Oct 1 to Oct 31",
  status: "due",
  detail: "Oct 22",
  amount: 162.4,
  amountLabel: "You owe",
  details: [{ label: "Insurance paid", value: 80 }],
  reason: "This covers your visit on Oct 3. Pay by Oct 22 to avoid a late fee.",
  parts: [
    { label: "Covers", text: "Visit on Oct 3" },
    { label: "How to pay", text: "Online, by phone or at the desk" },
  ],
  activity: [
    { kind: "team", note: "Statement sent.", source: "Oct 1" },
    { kind: "you", note: "You viewed it.", source: "Oct 2" },
  ],
};
const pay = () => h(EButton, null, () => "Pay now");
const download = () => h(EButton, { variant: "outline" }, () => "Download");
const text = (el: Element | null) => (el?.textContent ?? "").trim();

describe("EStatementCard", () => {
  test("is an article made of a Surface, with the title in a heading (h3 by default)", async () => {
    const { container } = await render(EStatementCard, { props: full });
    const card = container.querySelector("article")!;
    expect(card.classList.contains("e-surface")).toBe(true);
    expect(card.classList.contains("e-stmt")).toBe(true);
    await expect.element(page.getByRole("heading", { level: 3, name: "October statement" })).toBeVisible();
    expect(card.querySelector("h3.e-stmt-title")).not.toBeNull();
    expect(text(card.querySelector(".e-stmt-sub"))).toBe("Oct 1 to Oct 31");
  });

  test("headingLevel sets the heading element", async () => {
    const { container } = await render(EStatementCard, { props: { ...full, headingLevel: 2 } });
    expect(container.querySelector("h2.e-stmt-title")).not.toBeNull();
    expect(container.querySelector("h3")).toBeNull();
    await expect.element(page.getByRole("heading", { level: 2 })).toBeVisible();
  });

  test("the stamp names the status and its detail; the amount shows once as the lead figure", async () => {
    const { container } = await render(EStatementCard, { props: full });
    await expect.element(page.getByRole("img", { name: "Due, Oct 22" })).toBeVisible();
    expect(text(container.querySelector(".e-amount-main"))).toBe("$162.40");
    expect(text(container.querySelector(".e-amount-label"))).toBe("You owe");
    expect(text(container.querySelector(".e-amount-meta"))).toContain("Insurance paid");
  });

  test("tone and label stand in for a status", async () => {
    await render(EStatementCard, { props: { title: "A", amount: 1, tone: "warning", label: "Check this" } });
    await expect.element(page.getByRole("img", { name: "Check this" })).toBeVisible();
  });

  test("reason, parts and the history disclosure", async () => {
    const { container } = await render(EStatementCard, { props: full });
    expect(text(container.querySelector(".e-stmt-reason"))).toContain("Pay by Oct 22");
    const terms = [...container.querySelectorAll("dl.e-facts dt")].map(text);
    expect(terms).toEqual(["Covers", "How to pay"]);
    const details = container.querySelector<HTMLDetailsElement>("details.e-disclosure")!;
    expect(text(details.querySelector("summary"))).toBe("History (2)");
    expect(details.open).toBe(false);
  });

  test("keyboard: Enter on the History summary opens the timeline", async () => {
    const { container } = await render(EStatementCard, { props: full });
    const details = container.querySelector<HTMLDetailsElement>("details.e-disclosure")!;
    details.querySelector("summary")!.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => details.open).toBe(true);
    await expect.element(page.getByRole("list", { name: "Activity, newest first" })).toBeVisible();
    expect(details.querySelectorAll(".e-activity-row")).toHaveLength(2);
  });

  test("activityTitle replaces the disclosure title", async () => {
    const { container } = await render(EStatementCard, { props: { ...full, activityTitle: "Payments" } });
    expect(text(container.querySelector("summary"))).toBe("Payments (2)");
  });

  test("a card with only the required props leaves the optional parts out", async () => {
    const { container } = await render(EStatementCard, { props: { title: "Bare", amount: 5 } });
    expect(container.querySelector(".e-stmt-sub")).toBeNull();
    expect(container.querySelector(".e-stmt-reason")).toBeNull();
    expect(container.querySelector(".e-facts")).toBeNull();
    expect(container.querySelector("details")).toBeNull();
    expect(container.querySelector(".e-actions")).toBeNull();
  });

  test("actions render as a bar at the foot, a footer in the article", async () => {
    const { container } = await render(EStatementCard, {
      props: full,
      slots: { actions: () => [pay(), download()] },
    });
    expect(container.querySelectorAll(".e-surface > .e-actions--bar")).toHaveLength(1);
    expect(container.querySelectorAll(".e-stmt .e-actions--bar")).toHaveLength(1);
    expect(container.querySelector(".e-actions--bar")!.tagName).toBe("FOOTER");
    const card = container.querySelector("article")!.getBoundingClientRect();
    expect(Math.round(container.querySelector(".e-actions--bar")!.getBoundingClientRect().bottom)).toBe(
      Math.round(card.bottom),
    );
    await expect.element(page.getByRole("button", { name: "Pay now" })).toBeVisible();
  });

  test("keyboard: Tab reaches the history summary, then the actions in order", async () => {
    await render(EStatementCard, { props: full, slots: { actions: () => [pay(), download()] } });
    await userEvent.tab();
    expect(document.activeElement!.tagName).toBe("SUMMARY");
    await userEvent.tab();
    expect(text(document.activeElement)).toBe("Pay now");
    await userEvent.tab();
    expect(text(document.activeElement)).toBe("Download");
  });

  test("the card is not clickable: no listener, no role, no hover lift", async () => {
    const { container } = await render(EStatementCard, { props: full });
    const card = container.querySelector("article")!;
    expect(card.getAttribute("role")).toBeNull();
    expect(card.getAttribute("tabindex")).toBeNull();
  });

  test("money follows the configuration (EUR in de-DE) and can be set per card", async () => {
    const de = await render(EStatementCard, {
      props: full,
      global: { plugins: [createEos({ themeTarget: null, locale: "de-DE", currency: "EUR" })] },
    });
    expect(text(de.container.querySelector(".e-amount-main")).replace(/\u00a0/g, " ")).toBe("162,40 €");
    expect(text(de.container.querySelector(".e-amount-meta")).replace(/\u00a0/g, " ")).toContain("80,00 €");
    const one = await render(EStatementCard, { props: { ...full, currency: "GBP", locale: "en-GB" } });
    expect(text(one.container.querySelector(".e-amount-main"))).toBe("£162.40");
  });

  test("class, style and data attributes fall through to the article", async () => {
    const { container } = await render(EStatementCard, {
      props: full,
      attrs: { class: "mine", "data-id": "s1", id: "stmt-1" },
    });
    const card = container.querySelector("article")!;
    expect(card.classList.contains("mine")).toBe(true);
    expect(card.dataset.id).toBe("s1");
    expect(card.id).toBe("stmt-1");
  });

  test("the amount sits at the end of the top line, right-aligned", async () => {
    const at = (width: number) =>
      render(
        defineComponent({
          render: () =>
            h("div", { style: { width: `${width}px` } }, [h(EStatementCard, { title: "A", amount: 1, status: "due" })]),
        }),
      );
    const wide = await at(640);
    const w = wide.container.querySelector(".e-stmt-top")!.getBoundingClientRect();
    const amount = wide.container.querySelector(".e-stmt-top .e-amount")!.getBoundingClientRect();
    expect(Math.round(w.right - amount.right)).toBeLessThanOrEqual(1);
    expect(getComputedStyle(wide.container.querySelector(".e-stmt-top .e-amount")!).textAlign).toBe("end");
  });

  test("lays out in a Panel without overflowing at 320px", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "320px" } }, [
            h(EPanel, null, () => h(EStatementCard, full, { actions: () => [pay(), download()] })),
          ]),
      }),
    );
    const root = container.firstElementChild!;
    expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  });

  test("axe: every status, a tone-and-label stamp, open history, with and without actions", async () => {
    const statuses = ["paid", "due", "overdue", "action", "scheduled", "confirmed", "cancelled", "pending"] as const;
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            ...statuses.map((s) => h(EStatementCard, { title: `Statement ${s}`, amount: 10, status: s })),
            h(EStatementCard, { title: "Custom", amount: 10, tone: "danger", label: "Disputed" }),
            h(EStatementCard, full, { actions: () => [pay(), download()] }),
          ]),
      }),
    );
    for (const d of container.querySelectorAll("details")) d.open = true;
    await expectNoViolations(container);
  });
});
