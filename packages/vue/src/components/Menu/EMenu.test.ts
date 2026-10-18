import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EMenu from "./EMenu.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const menu = () => document.querySelector<HTMLElement>("[role=menu]");
const rows = () => Array.from(document.querySelectorAll<HTMLElement>("[role=menuitem]"));
const triggerOf = (c: Element) => c.querySelector<HTMLButtonElement>("button.e-btn")!;

const ITEMS = [
  { label: "Edit", icon: "pencil" },
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
});
