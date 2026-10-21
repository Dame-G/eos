import { afterEach, describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDialog from "./EDialog.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

afterEach(() => {
  document.body.removeAttribute("style");
});

function host(extra: { actions?: boolean; attrs?: Record<string, unknown> } = {}) {
  const open = ref(false);
  const closed = ref(0);
  const Host = defineComponent({
    render: () =>
      h("div", [
        h("button", { id: "trigger", onClick: () => (open.value = true) }, "Open"),
        h(
          EDialog,
          {
            title: "Cancel this appointment?",
            open: open.value,
            "onUpdate:open": (v?: boolean) => (open.value = !!v),
            onClose: () => closed.value++,
            ...extra.attrs,
          },
          {
            default: () => "Body text",
            ...(extra.actions === false
              ? {}
              : {
                  actions: () => [
                    h(EButton, { variant: "danger" }, () => "Cancel appointment"),
                    h(EButton, { variant: "outline" }, () => "Keep it"),
                  ],
                }),
          },
        ),
      ]),
  });
  return { Host, open, closed };
}

describe("EDialog", () => {
  test("is a modal dialog named by its title, with an h2 and a Close button", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog", { name: "Cancel this appointment?" })).toBeVisible();
    const dialog = document.querySelector<HTMLElement>(".e-dialog")!;
    expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)!.tagName).toBe("H2");
    expect(dialog.closest(".e-root")).not.toBeNull();
    await expect.element(page.getByRole("button", { name: "Close" })).toBeVisible();
    expect(dialog.querySelector(".e-dialog-body")!.textContent).toBe("Body text");
  });

  test("headingLevel sets the title element", async () => {
    const { Host, open } = host({ attrs: { headingLevel: 3 } });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("heading", { level: 3 })).toBeVisible();
  });

  test("focus moves in, and Tab stays inside the dialog", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const dialog = document.querySelector<HTMLElement>(".e-dialog")!;
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await userEvent.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  test("Escape closes it, emits close and gives focus back to the trigger", async () => {
    const { Host, open, closed } = host();
    await render(Host);
    const trigger = document.getElementById("trigger") as HTMLButtonElement;
    trigger.focus();
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector(".e-dialog")).toBeNull();
    expect(open.value).toBe(false);
    expect(closed.value).toBe(1);
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  test("the Close button closes it and returns focus", async () => {
    const { Host, open, closed } = host();
    await render(Host);
    const trigger = document.getElementById("trigger") as HTMLButtonElement;
    trigger.focus();
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect.poll(() => document.querySelector(".e-dialog")).toBeNull();
    expect(closed.value).toBe(1);
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  test("a press on the backdrop does not close it by default", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const overlay = document.querySelector<HTMLElement>(".e-dialog-overlay")!;
    overlay.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    overlay.click();
    await nextTick();
    expect(open.value).toBe(true);
  });

  test("dismissible closes it on a backdrop press", async () => {
    const { Host, open } = host({ attrs: { dismissible: true } });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const overlay = document.querySelector<HTMLElement>(".e-dialog-overlay")!;
    await userEvent.click(overlay, { position: { x: 4, y: 4 } });
    await expect.poll(() => open.value).toBe(false);
  });

  test("scroll is locked and the page behind is hidden from assistive technology while open", async () => {
    const { Host, open } = host();
    const { container } = await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(getComputedStyle(document.body).overflow).toBe("hidden");
    expect(container.closest("[aria-hidden='true']")).not.toBeNull();
    open.value = false;
    await expect.poll(() => document.querySelector(".e-dialog")).toBeNull();
    await expect.poll(() => getComputedStyle(document.body).overflow).not.toBe("hidden");
  });

  test("the actions slot is a tinted foot bar after the body, main action first", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const foot = document.querySelector<HTMLElement>(".e-dialog > footer.e-actions--bar.e-dialog-foot")!;
    expect(foot).not.toBeNull();
    expect(foot.previousElementSibling!.className).toBe("e-dialog-body");
    expect(foot.querySelectorAll("button")[0]!.textContent).toBe("Cancel appointment");
  });

  test("without actions there is no foot", async () => {
    const { Host, open } = host({ actions: false });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.querySelector(".e-dialog-foot")).toBeNull();
  });

  test("class, id and data attributes land on the dialog", async () => {
    const { Host, open } = host({ attrs: { class: "mine", id: "dlg", "data-x": "1" } });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const el = document.querySelector<HTMLElement>(".e-dialog")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.id).toBe("dlg");
    expect(el.dataset.x).toBe("1");
  });

  test("it works without v-model: the open prop alone, closing locally", async () => {
    await render(EDialog, { props: { open: true, title: "Alone" }, slots: { default: "Body" } });
    await expect.element(page.getByRole("dialog", { name: "Alone" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector(".e-dialog")).toBeNull();
  });

  test("inline shows it in the page, without a backdrop", async () => {
    const { container } = await render(EDialog, {
      props: { open: true, inline: true, title: "Preview" },
      slots: { default: "Body" },
    });
    const el = container.querySelector<HTMLElement>(".e-dialog--inline")!;
    expect(el).not.toBeNull();
    expect(getComputedStyle(el).position).toBe("static");
    expect(document.querySelector(".e-dialog-overlay")).toBeNull();
  });

  test("an inline preview does not take focus when it opens or send it anywhere when it closes", async () => {
    const shown = ref(false);
    const Host = defineComponent({
      render: () =>
        h("div", [
          h("button", { id: "outside" }, "Outside"),
          shown.value
            ? h(
                EDialog,
                { title: "Preview", inline: true, open: true, "onUpdate:open": (v?: boolean) => (shown.value = !!v) },
                { default: () => "Body" },
              )
            : null,
        ]),
    });
    await render(Host);
    const outside = document.getElementById("outside")!;
    outside.focus();
    shown.value = true;
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(outside);
    shown.value = false;
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(outside);
  });

  test("renders into the portal target (the body by default)", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.querySelector(".e-dialog")!.parentElement!.parentElement).toBe(document.body);
  });

  test("axe finds nothing in the open dialog, with and without actions", async () => {
    const a = host();
    await render(a.Host);
    a.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expectNoViolations(document.querySelector(".e-dialog")!);
    a.open.value = false;
    await expect.poll(() => document.querySelector(".e-dialog")).toBeNull();
    const b = host({ actions: false });
    await render(b.Host);
    b.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expectNoViolations(document.querySelector(".e-dialog")!);
  });
});
