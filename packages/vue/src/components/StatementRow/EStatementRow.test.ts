import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EStatementRow from "./EStatementRow.vue";
import EButton from "../Button/EButton.vue";
import type { StatementProps } from "../StatementCard/types.js";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const full: StatementProps = {
  title: "October statement",
  subtitle: "Oct 1 to Oct 31",
  status: "due",
  amount: 162.4,
  amountLabel: "You owe",
  details: [
    { label: "Charges", value: 242.4 },
    { label: "Insurance paid", value: -80 },
  ],
  reason: "This covers your visit on Oct 3. Pay by Oct 22 to avoid a late fee.",
  parts: [{ label: "How to pay", text: "Online, by phone or at the desk" }],
  activity: [{ kind: "team", note: "Statement sent.", source: "Oct 1" }],
};
const actions = () => [h(EButton, null, () => "Pay now"), h(EButton, { variant: "outline" }, () => "Download")];
const text = (el: Element | null) => (el?.textContent ?? "").trim();
const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, " ");
const at = (width: number, props: StatementProps = full, slots: Record<string, unknown> = {}) =>
  render(
    defineComponent({
      render: () => h("div", { style: { width: `${width}px` } }, [h(EStatementRow, props, slots)]),
    }),
  );

describe("EStatementRow", () => {
  test("is a native details with a summary of stamp, title, subtitle and amount", async () => {
    const { container } = await render(EStatementRow, { props: full });
    const row = container.querySelector<HTMLDetailsElement>("details.e-srow")!;
    expect(row.open).toBe(false);
    const summary = row.querySelector("summary")!;
    expect(summary.querySelector(".e-stamp.e-stamp--s")).not.toBeNull();
    expect(text(summary.querySelector(".e-srow-title"))).toBe("October statement");
    expect(text(summary.querySelector(".e-srow-sub"))).toBe("Oct 1 to Oct 31");
    expect(text(summary.querySelector(".e-srow-amount"))).toBe("$162.40");
    await expect.element(page.getByText("October statement")).toBeVisible();
  });

  test("the breakdown is hidden until the row is opened", async () => {
    const { container } = await render(EStatementRow, { props: full });
    const reason = page.getByText(/Pay by Oct 22/);
    await expect.element(reason).not.toBeVisible();
    container.querySelector("summary")!.click();
    await expect.poll(() => container.querySelector<HTMLDetailsElement>("details")!.open).toBe(true);
    await expect.element(reason).toBeVisible();
  });

  test("keyboard: Tab focuses the summary; Enter and Space open and close it", async () => {
    const { container } = await render(EStatementRow, { props: full });
    const row = container.querySelector<HTMLDetailsElement>("details")!;
    await userEvent.tab();
    expect(document.activeElement).toBe(row.querySelector("summary"));
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => row.open).toBe(true);
    await userEvent.keyboard(" ");
    await expect.poll(() => row.open).toBe(false);
    await userEvent.keyboard(" ");
    await expect.poll(() => row.open).toBe(true);
  });

  test("opened, the totals add up: lines, then the total named by amountLabel", async () => {
    const { container } = await render(EStatementRow, { props: full, attrs: { open: true } });
    const totals = container.querySelector("dl.e-totals")!;
    expect(totals.classList.contains("e-surface")).toBe(true);
    const rows = [...totals.querySelectorAll(".e-totals-row")];
    expect(rows).toHaveLength(3);
    expect(plain(text(rows[0]!.querySelector("dd")))).toBe("$242.40");
    expect(plain(text(rows[1]!.querySelector("dd")))).toBe("-$80.00");
    expect(rows[2]!.classList.contains("e-totals-row--sum")).toBe(true);
    expect(text(rows[2]!.querySelector("dt"))).toBe("You owe");
    expect(text(rows[2]!.querySelector("dd"))).toBe("$162.40");
  });

  test("the total is called 'Amount' without an amountLabel", async () => {
    const { container } = await render(EStatementRow, {
      props: { ...full, amountLabel: undefined },
      attrs: { open: true },
    });
    expect(text(container.querySelector(".e-totals-row--sum dt"))).toBe("Amount");
  });

  test("without details there is no totals box; the reason stands alone", async () => {
    const { container } = await render(EStatementRow, {
      props: { ...full, details: undefined },
      attrs: { open: true },
    });
    expect(container.querySelector(".e-totals")).toBeNull();
    expect(container.querySelector(".e-srow-lead")!.classList.contains("e-srow-lead--totals")).toBe(false);
    expect(text(container.querySelector(".e-stmt-reason"))).toContain("Pay by Oct 22");
  });

  test("with neither reason nor details the lead block is left out", async () => {
    const { container } = await render(EStatementRow, {
      props: { title: "Bare", amount: 5 },
      attrs: { open: true },
    });
    expect(container.querySelector(".e-srow-lead")).toBeNull();
    expect(container.querySelector(".e-facts")).toBeNull();
    expect(container.querySelector(".e-actions")).toBeNull();
  });

  test("reason and totals sit side by side when wide and stack when narrow", async () => {
    const wide = await at(720);
    wide.container.querySelector("details")!.open = true;
    const r = wide.container.querySelector(".e-stmt-reason")!.getBoundingClientRect();
    const t = wide.container.querySelector(".e-totals")!.getBoundingClientRect();
    expect(t.left).toBeGreaterThanOrEqual(r.right - 1);
    const narrow = await at(320);
    narrow.container.querySelector("details")!.open = true;
    const r2 = narrow.container.querySelector(".e-stmt-reason")!.getBoundingClientRect();
    const t2 = narrow.container.querySelector(".e-totals")!.getBoundingClientRect();
    expect(t2.top).toBeGreaterThanOrEqual(r2.bottom - 1);
  });

  test("opened, it reads in order: reason and totals, parts, history, then the buttons", async () => {
    const { container } = await render(EStatementRow, { props: full, slots: { actions }, attrs: { open: true } });
    const y = (sel: string) => container.querySelector(sel)!.getBoundingClientRect().top;
    expect(y(".e-srow-lead")).toBeLessThan(y(".e-facts"));
    expect(y(".e-facts")).toBeLessThan(y("details.e-disclosure"));
    expect(y("details.e-disclosure")).toBeLessThan(y(".e-actions--bar"));
    expect(text(container.querySelector("details.e-disclosure summary"))).toBe("History (1)");
  });

  test("the actions bar closes the card at its foot, with the rounded corners", async () => {
    const { container } = await render(EStatementRow, { props: full, slots: { actions }, attrs: { open: true } });
    const bar = container.querySelector<HTMLElement>(".e-srow-body > .e-actions--bar")!;
    expect(bar.tagName).toBe("DIV");
    expect(Math.round(bar.getBoundingClientRect().bottom)).toBe(
      Math.round(container.querySelector(".e-srow")!.getBoundingClientRect().bottom),
    );
    expect(parseFloat(getComputedStyle(bar).borderEndStartRadius)).toBeGreaterThan(0);
    await expect.element(page.getByRole("button", { name: "Download" })).toBeVisible();
  });

  test("the amount shows once in the row and once as the total", async () => {
    const { container } = await render(EStatementRow, { props: full, attrs: { open: true } });
    expect(container.querySelectorAll(".e-amount-main")).toHaveLength(0);
    const shown = [...container.querySelectorAll(".e-srow-amount, .e-totals-row--sum dd")].map(text);
    expect(shown).toEqual(["$162.40", "$162.40"]);
  });

  test("rows in a list line up: stamps and amounts share their columns", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "720px" } }, [
            h(EStatementRow, { title: "A", amount: 5, status: "paid" }),
            h(EStatementRow, { title: "B much longer title for the row", amount: 12345.67, status: "overdue" }),
          ]),
      }),
    );
    const stamps = [...container.querySelectorAll(".e-srow .e-stamp")].map((s) =>
      Math.round(s.getBoundingClientRect().left),
    );
    expect(new Set(stamps).size).toBe(1);
    const amounts = [...container.querySelectorAll(".e-srow-amount")].map((s) =>
      Math.round(s.getBoundingClientRect().right),
    );
    expect(new Set(amounts).size).toBe(1);
  });

  test("money follows the configuration and can be set per row", async () => {
    const de = await render(EStatementRow, {
      props: full,
      attrs: { open: true },
      global: { plugins: [createEos({ themeTarget: null, locale: "de-DE", currency: "EUR" })] },
    });
    expect(plain(text(de.container.querySelector(".e-srow-amount")))).toBe("162,40 €");
    expect(plain(text(de.container.querySelector(".e-totals-row dd")))).toBe("242,40 €");
    const gb = await render(EStatementRow, { props: { ...full, currency: "GBP", locale: "en-GB" } });
    expect(text(gb.container.querySelector(".e-srow-amount"))).toBe("£162.40");
  });

  test("class, id and data attributes fall through to the details; open starts it open", async () => {
    const { container } = await render(EStatementRow, {
      props: full,
      attrs: { class: "mine", id: "row-1", "data-x": "1", open: true },
    });
    const row = container.querySelector<HTMLDetailsElement>("details")!;
    expect(row.className).toBe("e-srow mine");
    expect(row.id).toBe("row-1");
    expect(row.dataset.x).toBe("1");
    expect(row.open).toBe(true);
  });

  test("axe: closed and open, every status, with and without the optional parts", async () => {
    const statuses = ["paid", "due", "overdue", "action", "pending"] as const;
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            ...statuses.map((s) => h(EStatementRow, { title: `Row ${s}`, amount: 10, status: s })),
            h(EStatementRow, { title: "Custom", amount: 10, tone: "warning", label: "Check" }),
            h(EStatementRow, full, { actions }),
          ]),
      }),
    );
    await expectNoViolations(container);
    for (const d of container.querySelectorAll<HTMLDetailsElement>("details")) d.open = true;
    await expectNoViolations(container);
  });

  test("the detail is passed to the stamp", async () => {
    const { container } = await render(EStatementRow, { props: { ...full, detail: "Oct 22" } });
    expect(text(container.querySelector(".e-stamp"))).toContain("Oct 22");
  });
});
