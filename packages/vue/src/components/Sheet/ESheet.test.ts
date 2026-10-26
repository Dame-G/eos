import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESheet from "./ESheet.vue";
import EButton from "../Button/EButton.vue";
import EPopover from "../Popover/EPopover.vue";
import { expectNoViolations } from "../../../test/axe.js";

const sheet = () => document.querySelector<HTMLElement>(".e-sheet");

/** A positioned stage with a button that opens the sheet and one that stays usable beside it. */
function host(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  const open = ref(false);
  const closed = ref(0);
  const Host = defineComponent({
    render: () =>
      h("div", { class: "stage", style: "position: relative; width: 900px; height: 500px" }, [
        h("button", { id: "opener", onClick: () => (open.value = true) }, "Open profile"),
        h("button", { id: "beside" }, "Beside"),
        h(
          ESheet,
          {
            title: "Your profile",
            open: open.value,
            "onUpdate:open": (v?: boolean) => (open.value = !!v),
            onClose: () => closed.value++,
            ...props,
          },
          { default: () => h("p", "Rating 1840"), ...slots },
        ),
      ]),
  });
  return { Host, open, closed };
}

describe("ESheet", () => {
  test("is a dialog named by its title, not modal, with a Close button; nothing is rendered while closed", async () => {
    const { Host, open } = host();
    await render(Host);
    expect(sheet()).toBeNull();
    open.value = true;
    await expect.element(page.getByRole("dialog", { name: "Your profile" })).toBeVisible();
    expect(sheet()!.hasAttribute("aria-modal")).toBe(false);
    expect(sheet()!.tagName).toBe("SECTION");
    await expect.element(page.getByRole("button", { name: "Close" })).toBeVisible();
    expect(sheet()!.querySelector("h2")!.textContent).toBe("Your profile");
  });

  test("docks over the end of its positioned container, full height, 28rem wide; start docks to the other side", async () => {
    const { Host, open } = host();
    const { container } = await render(Host);
    open.value = true;
    await expect.poll(() => sheet()).not.toBeNull();
    const stage = container.querySelector(".stage")!.getBoundingClientRect();
    const box = () => sheet()!.getBoundingClientRect();
    await expect.poll(() => Math.round(box().right)).toBe(Math.round(stage.right));
    expect(Math.round(box().height)).toBe(500);
    expect(Math.round(box().width)).toBe(448);
    open.value = false;
    await expect.poll(() => sheet()).toBeNull();

    const start = host({ side: "start", size: "md" });
    const second = await render(start.Host);
    start.open.value = true;
    await expect.poll(() => sheet()).not.toBeNull();
    const s = second.container.querySelector(".stage")!.getBoundingClientRect();
    await expect.poll(() => Math.round(sheet()!.getBoundingClientRect().left)).toBe(Math.round(s.left));
    expect(Math.round(sheet()!.getBoundingClientRect().width)).toBe(512);
  });

  test("viewport docks it over the window instead", async () => {
    const { Host, open } = host({ viewport: true });
    await render(Host);
    open.value = true;
    await expect.poll(() => sheet()).not.toBeNull();
    await expect
      .poll(() => Math.round(sheet()!.getBoundingClientRect().right))
      .toBe(document.documentElement.clientWidth);
    expect(Math.round(sheet()!.getBoundingClientRect().height)).toBe(window.innerHeight);
  });

  test("opening moves focus to the heading; Tab goes on into the sheet and the content behind stays usable", async () => {
    const { Host, open } = host({}, { default: () => h(EButton, null, () => "Edit") });
    await render(Host);
    const opener = document.getElementById("opener")!;
    await userEvent.click(opener);
    expect(open.value).toBe(true);
    await expect.poll(() => document.activeElement?.tagName).toBe("H2");
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("aria-label")).toBe("Close");
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("Edit");
    const beside = document.getElementById("beside")!;
    let pressed = 0;
    beside.addEventListener("click", () => pressed++);
    await userEvent.click(beside);
    expect(pressed).toBe(1);
    expect(open.value).toBe(true);
  });

  test("Escape closes it from inside and returns focus to the opener", async () => {
    const { Host, open, closed } = host();
    await render(Host);
    const opener = document.getElementById("opener")!;
    await userEvent.click(opener);
    await expect.poll(() => document.activeElement?.tagName).toBe("H2");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => sheet()).toBeNull();
    expect(open.value).toBe(false);
    expect(closed.value).toBe(1);
    await expect.poll(() => document.activeElement).toBe(opener);
  });

  test("Close closes it and returns focus to the opener", async () => {
    const { Host, closed } = host();
    await render(Host);
    const opener = document.getElementById("opener")!;
    await userEvent.click(opener);
    await page.getByRole("button", { name: "Close" }).click();
    await expect.poll(() => sheet()).toBeNull();
    expect(closed.value).toBe(1);
    await expect.poll(() => document.activeElement).toBe(opener);
  });

  test("closing leaves focus where it is when the person has moved on to the page", async () => {
    const { Host, open } = host();
    await render(Host);
    await userEvent.click(document.getElementById("opener")!);
    const beside = document.getElementById("beside")!;
    beside.focus();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => sheet()).toBeNull();
    expect(open.value).toBe(false);
    await nextTick();
    expect(document.activeElement).toBe(beside);
  });

  test("a popover open inside takes Escape first", async () => {
    const { Host, open } = host(
      {},
      {
        default: () =>
          h(
            EPopover,
            { label: "Filters" },
            { trigger: () => h(EButton, null, () => "Filters"), default: () => h("button", "Apply") },
          ),
      },
    );
    await render(Host);
    open.value = true;
    await page.getByRole("button", { name: "Filters" }).click();
    await expect.element(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog", { name: "Filters" })).not.toBeInTheDocument();
    expect(open.value).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => open.value).toBe(false);
  });

  test("below modalBelow it covers the window and is modal: focus stays inside", async () => {
    const { Host, open } = host({ modalBelow: "200rem" }, { default: () => h(EButton, null, () => "Edit") });
    await render(Host);
    open.value = true;
    await expect.poll(() => sheet()?.getAttribute("aria-modal")).toBe("true");
    const box = sheet()!.getBoundingClientRect();
    expect(Math.round(box.width)).toBe(document.documentElement.clientWidth);
    expect(Math.round(box.height)).toBe(window.innerHeight);
    await expect.poll(() => document.activeElement?.tagName).toBe("H2");
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      expect(sheet()!.contains(document.activeElement)).toBe(true);
    }
  });

  test("above modalBelow it stays docked and not modal", async () => {
    const { Host, open } = host({ modalBelow: "1rem" });
    await render(Host);
    open.value = true;
    await expect.poll(() => sheet()).not.toBeNull();
    await nextTick();
    expect(sheet()!.hasAttribute("aria-modal")).toBe(false);
    expect(Math.round(sheet()!.getBoundingClientRect().width)).toBe(448);
  });

  test("description shows under the title and describes the dialog; leading and actions have their places", async () => {
    const { Host, open } = host(
      { description: "Your games and ratings.", headingLevel: 1 },
      {
        leading: () => h(EButton, { variant: "quiet" }, () => "Back"),
        actions: () => h(EButton, null, () => "Save"),
      },
    );
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog", { name: "Your profile" })).toBeVisible();
    const desc = sheet()!.querySelector(".e-dialog-description")!;
    expect(desc.textContent).toBe("Your games and ratings.");
    expect(sheet()!.getAttribute("aria-describedby")).toBe(desc.id);
    expect(sheet()!.querySelector("h1")).not.toBeNull();
    const head = sheet()!.querySelector("header")!;
    expect(head.firstElementChild!.textContent).toBe("Back");
    expect(sheet()!.querySelector(".e-dialog-foot")!.textContent).toBe("Save");
  });

  test("the body scrolls while the head and foot stay", async () => {
    const { Host, open } = host(
      {},
      { default: () => h("div", { style: "height: 3000px" }, "tall"), actions: () => h(EButton, null, () => "Save") },
    );
    await render(Host);
    open.value = true;
    await expect.poll(() => sheet()).not.toBeNull();
    const body = sheet()!.querySelector<HTMLElement>(".e-sheet-body")!;
    await expect.poll(() => body.tabIndex).toBe(0);
    const foot = sheet()!.querySelector<HTMLElement>(".e-dialog-foot")!;
    expect(foot.getBoundingClientRect().bottom).toBeLessThanOrEqual(sheet()!.getBoundingClientRect().bottom + 1);
  });

  test("class, style and attributes land on the sheet", async () => {
    const { Host, open } = host({ class: "mine", "data-x": "1" });
    await render(Host);
    open.value = true;
    await expect.poll(() => sheet()).not.toBeNull();
    expect(sheet()!.classList.contains("mine")).toBe(true);
    expect(sheet()!.getAttribute("data-x")).toBe("1");
  });

  test("has no axe violations, docked and modal", async () => {
    const docked = host({ description: "Your games." }, { actions: () => h(EButton, null, () => "Save") });
    const { container } = await render(docked.Host);
    docked.open.value = true;
    await expect.poll(() => sheet()).not.toBeNull();
    await expectNoViolations(container);
    docked.open.value = false;
    await expect.poll(() => sheet()).toBeNull();
    const full = host({ modalBelow: "200rem" });
    const second = await render(full.Host);
    full.open.value = true;
    await expect.poll(() => sheet()?.getAttribute("aria-modal")).toBe("true");
    await expectNoViolations(second.container);
  });
});
