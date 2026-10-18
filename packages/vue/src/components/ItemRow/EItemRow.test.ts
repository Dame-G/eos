import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EItemRow from "./EItemRow.vue";
import EItemList from "../ItemList/EItemList.vue";
import EButton from "../Button/EButton.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

const text = (el: Element | null) => (el?.textContent ?? "").trim();
const review = () => h(EButton, { variant: "outline" }, () => "Review and sign");
const row = (extra: Record<string, unknown> = {}, action: (() => unknown) | null = review) =>
  h(
    EItemRow,
    { icon: "form", title: "New client form", subtitle: "Due Oct 22", status: "action", ...extra },
    action ? { action } : {},
  );
const inWidth = (width: number, children: () => unknown) =>
  render(defineComponent({ render: () => h("div", { style: { width: `${width}px` } }, [children() as never]) }));

describe("EItemRow", () => {
  test("a row shows icon tile, title, subtitle, stamp and the action", async () => {
    const { container } = await render(defineComponent({ render: () => h(EItemList, null, () => row()) }));
    const item = container.querySelector(".e-item")!;
    expect(item.querySelector(".e-item-icon .e-icon")).not.toBeNull();
    expect(text(item.querySelector(".e-item-title"))).toBe("New client form");
    expect(text(item.querySelector(".e-item-sub"))).toBe("Due Oct 22");
    await expect.element(page.getByRole("img", { name: "Action needed" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Review and sign" })).toBeVisible();
  });

  test("a bare row leaves out what it was not given", async () => {
    const { container } = await render(EItemRow, { props: { title: "Receipt" } });
    expect(container.querySelector(".e-item-icon")).toBeNull();
    expect(container.querySelector(".e-item-sub")).toBeNull();
    expect(container.querySelector(".e-stamp")).toBeNull();
  });

  test("a label alone shows a stamp; tone and label are applied", async () => {
    const { container } = await render(EItemRow, { props: { title: "R", tone: "danger", label: "Rejected" } });
    const stamp = container.querySelector(".e-stamp")!;
    expect(stamp.classList.contains("e-stamp--danger")).toBe(true);
    expect(stamp.getAttribute("aria-label")).toBe("Rejected");
  });

  test("status and action are columns when wide: the stamp is beside the title", async () => {
    const { container } = await inWidth(720, () => h(EItemList, null, () => row()));
    const title = container.querySelector(".e-item-title")!.getBoundingClientRect();
    const stamp = container.querySelector(".e-stamp")!.getBoundingClientRect();
    const btn = container.querySelector(".e-btn")!.getBoundingClientRect();
    expect(stamp.left).toBeGreaterThan(title.right);
    expect(btn.left).toBeGreaterThanOrEqual(stamp.right - 1);
    expect(Math.round(btn.top)).toBeLessThanOrEqual(Math.round(title.bottom));
  });

  test("status and a text button stack under the title when narrow", async () => {
    const { container } = await inWidth(320, () => h(EItemList, null, () => row()));
    const title = container.querySelector(".e-item-title")!.getBoundingClientRect();
    const sub = container.querySelector(".e-item-sub")!.getBoundingClientRect();
    const stamp = container.querySelector(".e-stamp")!.getBoundingClientRect();
    const btn = container.querySelector(".e-btn")!.getBoundingClientRect();
    expect(stamp.top).toBeGreaterThan(title.bottom - 2);
    expect(stamp.top).toBeGreaterThanOrEqual(sub.bottom - 1);
    expect(btn.top).toBeGreaterThanOrEqual(stamp.bottom - 1);
  });

  test("narrow: an IconButton stays at the end of the row", async () => {
    const { container } = await inWidth(320, () =>
      h(EItemList, null, () => row({}, () => h(EIconButton, { label: "Download", icon: "download" } as never))),
    );
    const item = container.querySelector(".e-item")!.getBoundingClientRect();
    const btn = container.querySelector(".e-icon-btn")!.getBoundingClientRect();
    const stamp = container.querySelector(".e-stamp")!.getBoundingClientRect();
    expect(item.right - btn.right).toBeLessThanOrEqual(1);
    expect(btn.top).toBeLessThan(stamp.bottom);
  });

  test("rows in one list share columns: stamps and actions line up", async () => {
    const { container } = await inWidth(720, () =>
      h(EItemList, null, () => [
        row({ title: "Short", subtitle: undefined, status: "paid" }),
        row({ title: "A much longer title that takes up most of the line", status: "pending" }),
      ]),
    );
    const stamps = [...container.querySelectorAll(".e-stamp")].map((s) => Math.round(s.getBoundingClientRect().left));
    const actions = [...container.querySelectorAll(".e-btn")].map((s) => Math.round(s.getBoundingClientRect().left));
    expect(new Set(stamps).size).toBe(1);
    expect(new Set(actions).size).toBe(1);
  });

  test("a lone row wraps itself in a list; a row in a list does not nest another", async () => {
    const lone = await render(EItemRow, { props: { title: "Receipt" } });
    expect(lone.container.querySelectorAll(".e-items")).toHaveLength(1);
    expect(lone.container.querySelector(".e-items .e-items-grid > .e-item")).not.toBeNull();
    const inList = await render(defineComponent({ render: () => h(EItemList, null, () => [row(), row()]) }));
    expect(inList.container.querySelectorAll(".e-items")).toHaveLength(1);
    expect(inList.container.querySelectorAll(".e-item")).toHaveLength(2);
  });

  test("attributes land on the row, not on the wrapper of a lone row", async () => {
    let clicks = 0;
    const { container } = await render(EItemRow, {
      props: { title: "Receipt" },
      attrs: { class: "mine", "data-id": "r1", onClick: () => clicks++ },
    });
    const item = container.querySelector<HTMLElement>(".e-item")!;
    expect(item.className).toBe("e-item mine");
    expect(item.dataset.id).toBe("r1");
    expect(container.querySelector(".e-items")!.className).toBe("e-items");
    item.click();
    expect(clicks).toBe(1);
  });

  test("keyboard: Tab goes row to row through the actions", async () => {
    await render(
      defineComponent({ render: () => h(EItemList, null, () => [row({ title: "One" }), row({ title: "Two" })]) }),
    );
    await userEvent.tab();
    expect(text(document.activeElement)).toBe("Review and sign");
    await userEvent.tab();
    expect(text(document.activeElement)).toBe("Review and sign");
    expect(page.getByRole("button").elements()).toHaveLength(2);
  });

  test("a row's action receives clicks", async () => {
    let clicks = 0;
    await render(
      defineComponent({
        render: () => h(EItemList, null, () => row({}, () => h(EButton, { onClick: () => clicks++ }, () => "Open"))),
      }),
    );
    await page.getByRole("button", { name: "Open" }).click();
    expect(clicks).toBe(1);
  });

  test("axe: wide, narrow, every status, icon-only action, lone row", async () => {
    const statuses = ["paid", "due", "overdue", "action", "pending", "signed"] as const;
    const content = () =>
      h("div", [
        h(EItemList, null, () => [
          ...statuses.map((s) => row({ title: `Form ${s}`, status: s })),
          row({ title: "Download", status: undefined }, () =>
            h(EIconButton, { label: "Download", icon: "download" } as never),
          ),
        ]),
        h(EItemRow, { title: "Lone receipt", subtitle: "Oct 3" }),
      ]);
    const wide = await inWidth(720, content);
    await expectNoViolations(wide.container);
    const narrow = await inWidth(320, content);
    await expectNoViolations(narrow.container);
  });
});
