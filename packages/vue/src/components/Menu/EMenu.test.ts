import { describe, expect, test } from "vitest";
import { defineComponent, h, markRaw } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EMenu from "./EMenu.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const menu = () => document.querySelector<HTMLElement>("[role=menu]");
const rows = () => Array.from(document.querySelectorAll<HTMLElement>("[role=menuitem]"));
const triggerOf = (c: Element) => c.querySelector<HTMLButtonElement>("button.e-btn")!;

const ITEMS = [
  { label: "Edit", icon: "edit" },
  { label: "Duplicate" },
  { label: "Archive", disabled: true },
  { divider: true as const },
  { label: "Delete", danger: true },
];

function mount(props: Record<string, unknown> = {}) {
  return render(EMenu, { props: { label: "More", items: ITEMS, ...props } });
}

describe("EMenu", () => {
  test("is an outline button with a chevron that opens a menu; the menu is not in the page until then", async () => {
    const { container } = await mount();
    const trigger = triggerOf(container);
    expect(trigger.className).toContain("e-btn--outline");
    expect(trigger.textContent).toContain("More");
    expect(trigger.querySelectorAll(".e-icon").length).toBe(1);
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(menu()).toBeNull();
  });

  test("variant and icon style the button", async () => {
    const { container } = await mount({ variant: "primary", icon: "plus" });
    const trigger = triggerOf(container);
    expect(trigger.className).not.toContain("e-btn--outline");
    expect(trigger.querySelectorAll(".e-icon").length).toBe(2);
  });

  test("a click opens it under the button; rows are 48px; the first action takes focus", async () => {
    const { container } = await mount();
    const trigger = triggerOf(container);
    await trigger.click();
    await expect.poll(() => menu()).not.toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await expect.element(page.getByRole("menu")).toBeVisible();
    expect(rows().map((r) => r.textContent?.trim())).toEqual(["Edit", "Duplicate", "Archive", "Delete"]);
    expect(Math.round(rows()[0]!.getBoundingClientRect().height)).toBe(48);
    await expect.poll(() => document.activeElement).toBe(rows()[0]);
    await expect
      .poll(() => Math.round(menu()!.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom))
      .toBe(8);
    expect(menu()!.getBoundingClientRect().width).toBeGreaterThanOrEqual(192);
  });

  test("the keyboard opens it with Enter, Space or ArrowDown, with the first action focused", async () => {
    const { container } = await mount();
    const trigger = triggerOf(container);
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => document.activeElement).toBe(rows()[0]);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => menu()).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger);
    await userEvent.keyboard(" ");
    await expect.poll(() => document.activeElement).toBe(rows()[0]);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => menu()).toBeNull();
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.activeElement).toBe(rows()[0]);
  });

  test("arrow keys move between actions (skipping a disabled one), Home and End jump, and the focus wraps", async () => {
    const { container } = await mount();
    await triggerOf(container).click();
    await expect.poll(() => document.activeElement).toBe(rows()[0]);
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(rows()[1]);
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(rows()[3]);
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(rows()[1]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(rows()[3]);
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(rows()[0]);
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(rows()[3]);
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(rows()[0]);
  });

  test("typing jumps to the action that starts with those letters", async () => {
    const { container } = await mount();
    await triggerOf(container).click();
    await expect.poll(() => document.activeElement).toBe(rows()[0]);
    await userEvent.keyboard("d");
    expect(document.activeElement).toBe(rows()[1]);
    await userEvent.keyboard("{Escape}");
  });

  test("Enter and Space choose: the action's onClick runs, select is emitted, the menu closes and focus returns to the button", async () => {
    const calls: string[] = [];
    const heard: string[] = [];
    const { container } = await mount({
      items: [
        { label: "Edit", onClick: () => calls.push("edit") },
        { label: "Duplicate", onClick: () => calls.push("dup") },
      ],
      onSelect: (item: { label: string }) => heard.push(item.label),
    });
    const trigger = triggerOf(container);
    await trigger.click();
    await expect.poll(() => document.activeElement).toBe(rows()[0]);
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => menu()).toBeNull();
    expect(calls).toEqual(["edit"]);
    expect(heard).toEqual(["Edit"]);
    await expect.poll(() => document.activeElement).toBe(trigger);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => document.activeElement).toBe(rows()[0]);
    await userEvent.keyboard("{ArrowDown}{ }");
    await expect.poll(() => menu()).toBeNull();
    expect(calls).toEqual(["edit", "dup"]);
  });

  test("a click on an action runs it and closes the menu", async () => {
    const calls: string[] = [];
    const { container } = await mount({ items: [{ label: "Edit", onClick: () => calls.push("edit") }] });
    await triggerOf(container).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    expect(calls).toEqual(["edit"]);
    await expect.poll(() => menu()).toBeNull();
  });

  test("a disabled action cannot be chosen and is muted", async () => {
    const calls: string[] = [];
    const { container } = await mount({
      items: [{ label: "Archive", disabled: true, onClick: () => calls.push("archive") }, { label: "Edit" }],
    });
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    const archive = rows()[0]!;
    expect(archive.hasAttribute("data-disabled")).toBe(true);
    expect(archive.getAttribute("aria-disabled")).toBe("true");
    expect(getComputedStyle(archive).cursor).toBe("not-allowed");
    archive.click();
    expect(calls).toEqual([]);
    expect(menu()).not.toBeNull();
  });

  test("a destructive action is red, a divider draws a rule, an icon shows before the label", async () => {
    const { container } = await mount();
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    const del = rows().find((r) => r.textContent?.includes("Delete"))!;
    expect(del.classList.contains("e-menu-item--danger")).toBe(true);
    expect(getComputedStyle(del).color).not.toBe(getComputedStyle(rows()[1]!).color);
    expect(menu()!.querySelectorAll("hr.e-divider").length).toBe(1);
    expect(menu()!.querySelectorAll("[role=separator]").length).toBe(1);
    expect(rows()[0]!.querySelector(".e-icon")).not.toBeNull();
    expect(rows()[1]!.querySelector(".e-icon")).toBeNull();
  });

  test("an outside press closes it", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h(EMenu, { label: "More", items: ITEMS }), h("button", { type: "button" }, "Elsewhere")]),
      }),
    );
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    await page.getByRole("button", { name: "Elsewhere" }).click();
    await expect.poll(() => menu()).toBeNull();
  });

  test("the menu renders in the configured portal target and is an e-root", async () => {
    const target = document.createElement("div");
    target.id = "themed-menu";
    document.body.appendChild(target);
    const { container } = await render(EMenu, {
      props: { label: "More", items: ITEMS },
      global: { plugins: [createEos({ portalTarget: "#themed-menu" })] },
    });
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    expect(target.contains(menu())).toBe(true);
    expect(menu()!.classList.contains("e-root")).toBe(true);
    await userEvent.keyboard("{Escape}");
    target.remove();
  });

  test("attributes and class land on the button", async () => {
    const { container } = await render(EMenu, {
      props: { label: "More", items: ITEMS },
      attrs: { "data-test": "x", class: "mine" },
    });
    const trigger = triggerOf(container);
    expect(trigger.dataset["test"]).toBe("x");
    expect(trigger.classList.contains("mine")).toBe(true);
  });

  test("axe: closed and open", async () => {
    const { container } = await mount();
    await expectNoViolations(container);
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    await expectNoViolations(document.body);
  });

  test("a trigger slot replaces the button and still opens the menu", async () => {
    const { container } = await render(EMenu, {
      props: { label: "Account", items: ITEMS, align: "end" },
      slots: { trigger: () => h("button", { type: "button", class: "mine", "aria-label": "Account menu" }, "A") },
    });
    expect(container.querySelector("button.e-btn")).toBeNull();
    await page.getByRole("button", { name: "Account menu" }).click();
    await expect.poll(() => menu()).not.toBeNull();
    expect(rows().length).toBe(4);
  });

  test("attributes land on a custom trigger too", async () => {
    await render(EMenu, {
      props: { label: "Account", items: ITEMS },
      attrs: { "data-test": "x" },
      slots: { trigger: () => h("button", { type: "button", "aria-label": "Account menu" }, "A") },
    });
    expect(page.getByRole("button", { name: "Account menu" }).element().dataset["test"]).toBe("x");
  });

  test("item onClick runs before the select event", async () => {
    const order: string[] = [];
    const { container } = await render(EMenu, {
      props: {
        label: "More",
        items: [{ label: "Edit", onClick: () => order.push("click") }],
        onSelect: () => order.push("select"),
      },
    });
    await triggerOf(container).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    expect(order).toEqual(["click", "select"]);
  });

  test("side top opens the menu above the trigger", async () => {
    const { container } = await mount({ side: "top" });
    container.style.marginTop = "20rem";
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    await expect
      .poll(() => menu()!.getBoundingClientRect().bottom <= triggerOf(container).getBoundingClientRect().top + 1)
      .toBe(true);
  });

  test("Tab from the trigger closes nothing and does not ask for the menu's focus", async () => {
    const { container } = await mount();
    triggerOf(container).focus();
    await userEvent.keyboard("{Tab}");
    expect(menu()).toBeNull();
  });

  test("a keyboard-focused row shows the focus outline, not only the hover wash", async () => {
    const { container } = await mount();
    triggerOf(container).focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => menu()).not.toBeNull();
    await expect.poll(() => document.activeElement?.getAttribute("role")).toBe("menuitem");
    const style = getComputedStyle(document.activeElement!);
    expect(style.outlineStyle).toBe("solid");
    expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
    expect(parseFloat(style.outlineOffset)).toBeLessThan(0);
  });

  test("a link row is an anchor and a checkbox row reports its change", async () => {
    const seen: boolean[] = [];
    const { container, emitted } = await mount({
      items: [
        { label: "Docs", href: "#docs" },
        { type: "label", label: "View" },
        { type: "checkbox", label: "Grid", checked: true, onChange: (v: boolean) => seen.push(v) },
      ],
    });
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    expect(document.querySelector("a[role=menuitem]")!.getAttribute("href")).toBe("#docs");
    expect(document.querySelector(".e-menu-label")!.textContent?.trim()).toBe("View");
    const grid = document.querySelector<HTMLElement>("[role=menuitemcheckbox]")!;
    expect(grid.getAttribute("aria-checked")).toBe("true");
    grid.click();
    await expect.poll(() => seen).toEqual([false]);
    expect(emitted<[unknown, boolean]>().change![0]![1]).toBe(false);
  });

  test("a link row with `to` renders through linkComponent; a disabled one has no target", async () => {
    const FakeLink = markRaw(
      defineComponent({
        props: { to: { type: String, required: true } },
        setup:
          (p, { slots }) =>
          () =>
            h("a", { href: `/app${p.to}`, "data-router": "" }, slots.default?.()),
      }),
    );
    const { container } = await mount({
      linkComponent: FakeLink,
      items: [
        { label: "Billing", to: "/billing" },
        { label: "Plain", href: "#plain" },
        { label: "Closed", to: "/closed", disabled: true },
      ],
    });
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    const links = [...document.querySelectorAll<HTMLAnchorElement>("a[role=menuitem]")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/app/billing", "#plain", null]);
    expect(links[0]!.hasAttribute("data-router")).toBe(true);
  });

  test("keepOpen leaves the menu open after a toggle; picking the chosen option changes nothing", async () => {
    const seen: unknown[] = [];
    const { container, emitted } = await mount({
      items: [
        { type: "checkbox", label: "Grid", checked: false, keepOpen: true, onChange: (v: boolean) => seen.push(v) },
        {
          type: "radio-group",
          value: "a",
          options: [
            { label: "A", value: "a" },
            { label: "B", value: "b" },
          ],
          onChange: (v: string) => seen.push(v),
        },
      ],
    });
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    document.querySelector<HTMLElement>("[role=menuitemcheckbox]")!.click();
    await expect.poll(() => seen).toEqual([true]);
    expect(menu()).not.toBeNull();
    (page.getByRole("menuitemradio", { name: "A" }).element() as HTMLElement).click();
    await expect.poll(() => menu()).toBeNull();
    expect(seen).toEqual([true]);
    expect(emitted().change).toHaveLength(1);
  });

  test("a long label wraps inside its row instead of spilling out", async () => {
    const { container } = await mount({
      items: [{ label: "A very long action label that keeps going well past the width of any reasonable menu panel" }],
    });
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    const row = rows()[0]!;
    expect(row.scrollHeight).toBeLessThanOrEqual(row.clientHeight + 1);
    expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth + 1);
  });

  test("a radio group marks the chosen option and reports a pick", async () => {
    let picked = "";
    const { container } = await mount({
      items: [
        {
          type: "radio-group",
          label: "Sort",
          value: "name",
          options: [
            { label: "Name", value: "name" },
            { label: "Date", value: "date" },
          ],
          onChange: (v: string) => (picked = v),
        },
      ],
    });
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    const radios = [...document.querySelectorAll<HTMLElement>("[role=menuitemradio]")];
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["true", "false"]);
    radios[1]!.click();
    await expect.poll(() => picked).toBe("date");
  });

  test("a submenu opens beside its row with ArrowRight", async () => {
    const { container } = await mount({
      items: [{ type: "submenu", label: "Share", items: [{ label: "Email" }, { label: "Link" }] }],
    });
    await triggerOf(container).click();
    // The key goes to the focused row, so wait for the menu to have put focus there.
    await expect.poll(() => document.activeElement?.textContent?.trim()).toBe("Share");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.querySelectorAll("[role=menu]").length).toBe(2);
    await expect.poll(() => document.activeElement?.textContent?.trim()).toBe("Email");
  });

  test("side accepts start and end", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { padding: "160px 300px" } }, [h(EMenu, { label: "More", items: ITEMS, side: "end" })]),
      }),
    );
    const trigger = triggerOf(container);
    await trigger.click();
    await expect.poll(() => menu()).not.toBeNull();
    await expect
      .poll(() => menu()!.getBoundingClientRect().left)
      .toBeGreaterThanOrEqual(trigger.getBoundingClientRect().right - 1);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => menu()).toBeNull();
  });

  test("close fires when it shuts", async () => {
    const { container, emitted } = await mount();
    await triggerOf(container).click();
    await expect.poll(() => menu()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => emitted().close).toHaveLength(1);
  });
});

describe("EMenu corners", () => {
  test.each(["", "2px", "14px"])("a row's corner is the panel's less its padding (md %s)", async (md) => {
    const { container } = await mount();
    await userEvent.click(triggerOf(container));
    await expect.poll(() => menu()).not.toBeNull();
    if (md) {
      menu()!.style.setProperty("--e-radius-md", md);
      menu()!.style.setProperty("--e-radius-row", "max(0px, calc(var(--e-radius-md) - var(--e-pad-inset)))");
    }
    const outer = parseFloat(getComputedStyle(menu()!).borderTopLeftRadius);
    const inset =
      parseFloat(getComputedStyle(menu()!).paddingTop) / 2 + parseFloat(getComputedStyle(menu()!).borderTopWidth); // pad-inset is half the padding
    const inner = parseFloat(getComputedStyle(rows()[0]!).borderTopLeftRadius);
    expect(Math.abs(inner - Math.max(0, outer - inset))).toBeLessThan(0.5);
  });
});
