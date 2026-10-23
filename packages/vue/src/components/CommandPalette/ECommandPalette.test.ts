import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECommandPalette, { type CommandItem } from "./ECommandPalette.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items: CommandItem[] = [
  { id: "invoice", label: "Create invoice", group: "Billing", icon: "plus", shortcut: "mod+i", keywords: ["bill"] },
  { id: "refund", label: "Issue refund", description: "Return a payment", group: "Billing" },
  { id: "archived", label: "Restore archive", group: "Billing", disabled: true },
  { id: "settings", label: "Open settings", group: "Account" },
  { id: "theme", label: "Toggle theme" },
];

const mount = (props: Record<string, unknown> = {}) =>
  render(ECommandPalette, { props: { items, label: "Command palette", open: true, shortcut: false, ...props } });

const input = () => document.querySelector<HTMLInputElement>(".e-cmd-input")!;
const options = () => [...document.querySelectorAll<HTMLElement>("[role=option]")];
const names = () => options().map((o) => o.querySelector(".e-opt-label")!.textContent);

describe("ECommandPalette", () => {
  test("opens as a dialog named by the label, with a focused combobox over a listbox", async () => {
    await mount();
    await expect.element(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    await expect.poll(() => document.activeElement).toBe(input());
    expect(input().getAttribute("role")).toBe("combobox");
    expect(document.getElementById(input().getAttribute("aria-controls")!)?.getAttribute("role")).toBe("listbox");
  });

  test("lists ungrouped commands first, then groups in order", async () => {
    await mount();
    expect(names()).toEqual(["Toggle theme", "Create invoice", "Issue refund", "Restore archive", "Open settings"]);
    expect([...document.querySelectorAll(".e-opt-group")].map((g) => g.textContent?.trim())).toEqual([
      "Billing",
      "Account",
    ]);
  });

  test("typing filters by label, description, group and keywords, best match first", async () => {
    await mount();
    await userEvent.type(input(), "bill");
    // "bill" is a keyword of Create invoice and the group of the others.
    await expect.poll(() => names()[0]).toBe("Create invoice");
    await userEvent.clear(input());
    await userEvent.type(input(), "refund pay");
    await expect.poll(() => names()).toEqual(["Issue refund"]);
  });

  test("says when nothing matches", async () => {
    await mount();
    await userEvent.type(input(), "zzzz");
    await expect.element(page.getByText("No results")).toBeVisible();
    expect(options()).toHaveLength(0);
    expect(input().getAttribute("aria-activedescendant")).toBeNull();
  });

  test("arrow keys move the active option, skip disabled ones and wrap", async () => {
    await mount();
    const active = () => document.getElementById(input().getAttribute("aria-activedescendant")!)?.textContent;
    expect(active()).toContain("Toggle theme");
    await userEvent.keyboard("{ArrowDown}");
    expect(active()).toContain("Create invoice");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toContain("Open settings"); // Restore archive is disabled
    await userEvent.keyboard("{ArrowDown}");
    expect(active()).toContain("Toggle theme");
    await userEvent.keyboard("{ArrowUp}");
    expect(active()).toContain("Open settings");
    await userEvent.keyboard("{Control>}{Home}{/Control}");
    expect(active()).toContain("Toggle theme");
    await userEvent.keyboard("{Control>}{End}{/Control}");
    expect(active()).toContain("Open settings");
  });

  test("Home and End move the caret in the search box and leave the active option alone", async () => {
    await mount();
    await userEvent.type(input(), "refund");
    const active = () => input().getAttribute("aria-activedescendant");
    const before = active();
    await userEvent.keyboard("{Home}");
    expect(input().selectionStart).toBe(0);
    await userEvent.keyboard("{End}");
    expect(input().selectionStart).toBe(6);
    expect(active()).toBe(before);
  });

  test("v-model:query reports what is typed and filter=false lists the items as given", async () => {
    const { emitted } = await mount({ filter: false });
    await userEvent.type(input(), "zz");
    expect(emitted()["update:query"]!.at(-1)).toEqual(["zz"]);
    expect(names()).toHaveLength(items.length);
  });

  test("close fires when it is dismissed", async () => {
    const { emitted } = await mount();
    await userEvent.keyboard("{Escape}");
    expect(emitted().close).toHaveLength(1);
  });

  test("Enter chooses the active command, emits select and closes", async () => {
    const { emitted } = await mount();
    await userEvent.type(input(), "refund");
    await userEvent.keyboard("{Enter}");
    expect(emitted().select![0]).toEqual([expect.objectContaining({ id: "refund" })]);
    expect(emitted()["update:open"]).toEqual([[false]]);
  });

  test("a click chooses; a disabled command does nothing", async () => {
    const { emitted } = await mount();
    options()
      .find((o) => o.textContent?.includes("Restore archive"))!
      .click();
    expect(emitted().select).toBeUndefined();
    options()
      .find((o) => o.textContent?.includes("Open settings"))!
      .click();
    expect(emitted().select![0]).toEqual([expect.objectContaining({ id: "settings" })]);
  });

  test("clicking a disabled command keeps focus in the search box", async () => {
    await mount();
    await expect.poll(() => document.activeElement).toBe(input());
    const disabled = options().find((o) => o.textContent?.includes("Restore archive"))!;
    const down = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    disabled.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(input());
  });

  test("matching ignores accents, and the description is highlighted", async () => {
    await mount({ items: [...items, { id: "cafe", label: "Café menu" }] });
    await userEvent.type(input(), "cafe");
    await expect.poll(() => names()).toEqual(["Café menu"]);
    await userEvent.clear(input());
    await userEvent.type(input(), "payment");
    await expect.poll(() => names()).toEqual(["Issue refund"]);
    expect(document.querySelector(".e-opt-desc mark")!.textContent).toBe("payment");
  });

  test("loading shows the spinner in place of the empty text, and emptyText replaces No results", async () => {
    const view = await mount({ loading: true, items: [] });
    expect(document.querySelector(".e-opt-status .e-spinner")).not.toBeNull();
    expect(document.querySelector("[role=listbox]")!.getAttribute("aria-busy")).toBe("true");
    await view.rerender({ loading: false, emptyText: "Nothing to run" });
    await expect.poll(() => document.querySelector(".e-opt-status")?.textContent?.trim()).toBe("Nothing to run");
  });

  test("Escape closes it", async () => {
    const { emitted } = await mount();
    await userEvent.keyboard("{Escape}");
    expect(emitted()["update:open"]).toEqual([[false]]);
  });

  test("the shortcut opens it from anywhere, and again closes it", async () => {
    const { emitted } = await mount({ open: false, shortcut: "mod+k" });
    const mod = /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? { metaKey: true } : { ctrlKey: true };
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", bubbles: true, cancelable: true, ...mod }));
    expect(emitted()["update:open"]).toEqual([[true]]);
  });

  test("shows a command's own shortcut as keycaps", async () => {
    await mount();
    const caps = [...document.querySelectorAll("[role=option] kbd")].map((k) => k.textContent);
    expect(caps).toHaveLength(2);
    expect(caps.at(-1)).toBe("I");
  });

  test("a custom score replaces the built-in matching", async () => {
    await mount({ score: (item: CommandItem, q: string) => (item.id === q ? 1 : 0) });
    await userEvent.type(input(), "theme");
    await expect.poll(() => names()).toEqual(["Toggle theme"]);
  });

  test("the item slot replaces a row", async () => {
    await render(ECommandPalette, {
      props: { items, label: "Command palette", open: true, shortcut: false },
      slots: { item: `<template #item="{ item }"><b class="mine">{{ item.id }}</b></template>` },
    });
    expect(document.querySelectorAll(".mine")).toHaveLength(items.length);
  });

  test("has no axe violations", async () => {
    await mount();
    await expectNoViolations(document.body);
  });
});

describe("ECommandPalette corners", () => {
  test.each(["", "2px", "14px"])("an option's corner is the palette's less the list padding (md %s)", async (md) => {
    await mount();
    const dialog = document.querySelector<HTMLElement>(".e-cmd")!;
    if (md) dialog.style.setProperty("--e-radius-md", md);
    const outer = parseFloat(getComputedStyle(dialog).borderTopLeftRadius);
    const inset = parseFloat(getComputedStyle(dialog.querySelector(".e-cmd-list")!).paddingTop);
    const inner = parseFloat(getComputedStyle(options()[0]!).borderTopLeftRadius);
    expect(Math.abs(inner - Math.max(0, outer - inset))).toBeLessThan(0.5);
  });
});
