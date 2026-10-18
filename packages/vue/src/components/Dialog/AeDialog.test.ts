import { afterEach, describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeDialog from "./AeDialog.vue";
import AeButton from "../Button/AeButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

afterEach(() => {
  document.body.removeAttribute("style");
});

/** A page with a button that opens the dialog, as an app has. */
function host(extra: { actions?: boolean; attrs?: Record<string, unknown> } = {}) {
  const open = ref(false);
  const closed = ref(0);
  const Host = defineComponent({
    render: () =>
      h("div", [
        h("button", { id: "trigger", onClick: () => (open.value = true) }, "Open"),
        h(
          AeDialog,
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
                    h(AeButton, { variant: "danger" }, () => "Cancel appointment"),
                    h(AeButton, { variant: "outline" }, () => "Keep it"),
                  ],
                }),
          },
        ),
      ]),
  });
  return { Host, open, closed };
}

describe("AeDialog", () => {
  test("is a modal dialog named by its title, with an h2 and a Close button", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog", { name: "Cancel this appointment?" })).toBeVisible();
    const dialog = document.querySelector<HTMLElement>(".ae-dialog")!;
    expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)!.tagName).toBe("H2");
    expect(dialog.closest(".ae-root")).not.toBeNull();
    await expect.element(page.getByRole("button", { name: "Close" })).toBeVisible();
    expect(dialog.querySelector(".ae-dialog-body")!.textContent).toBe("Body text");
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
    const dialog = document.querySelector<HTMLElement>(".ae-dialog")!;
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
    await expect.poll(() => document.querySelector(".ae-dialog")).toBeNull();
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
    await expect.poll(() => document.querySelector(".ae-dialog")).toBeNull();
    expect(closed.value).toBe(1);
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  test("a press on the backdrop does not close it", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const overlay = document.querySelector<HTMLElement>(".ae-dialog-overlay")!;
    overlay.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    overlay.click();
    await nextTick();
    expect(open.value).toBe(true);
  });

  test("scroll is locked and the page behind is hidden from assistive technology while open", async () => {
    const { Host, open } = host();
    const { container } = await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(getComputedStyle(document.body).overflow).toBe("hidden");
    expect(container.closest("[aria-hidden='true']")).not.toBeNull();
    open.value = false;
    await expect.poll(() => document.querySelector(".ae-dialog")).toBeNull();
    await expect.poll(() => getComputedStyle(document.body).overflow).not.toBe("hidden");
  });

  test("the actions slot is a tinted foot bar after the body, main action first", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const foot = document.querySelector<HTMLElement>(".ae-dialog > footer.ae-actions--bar.ae-dialog-foot")!;
    expect(foot).not.toBeNull();
    expect(foot.previousElementSibling!.className).toBe("ae-dialog-body");
    expect(foot.querySelectorAll("button")[0]!.textContent).toBe("Cancel appointment");
  });

  test("without actions there is no foot", async () => {
    const { Host, open } = host({ actions: false });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.querySelector(".ae-dialog-foot")).toBeNull();
  });

  test("class, id and data attributes land on the dialog", async () => {
    const { Host, open } = host({ attrs: { class: "mine", id: "dlg", "data-x": "1" } });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const el = document.querySelector<HTMLElement>(".ae-dialog")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.id).toBe("dlg");
    expect(el.dataset.x).toBe("1");
  });

  test("it works without v-model: the open prop alone, closing locally", async () => {
    await render(AeDialog, { props: { open: true, title: "Alone" }, slots: { default: "Body" } });
    await expect.element(page.getByRole("dialog", { name: "Alone" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector(".ae-dialog")).toBeNull();
  });

  test("inline shows it in the page, without a backdrop", async () => {
    const { container } = await render(AeDialog, {
      props: { open: true, inline: true, title: "Preview" },
      slots: { default: "Body" },
    });
    const el = container.querySelector<HTMLElement>(".ae-dialog--inline")!;
    expect(el).not.toBeNull();
    expect(getComputedStyle(el).position).toBe("static");
    expect(document.querySelector(".ae-dialog-overlay")).toBeNull();
  });

  test("renders into the portal target (the body by default)", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.querySelector(".ae-dialog")!.parentElement!.parentElement).toBe(document.body);
  });

  test("axe finds nothing in the open dialog, with and without actions", async () => {
    const a = host();
    await render(a.Host);
    a.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expectNoViolations(document.querySelector(".ae-dialog")!);
    a.open.value = false;
    await expect.poll(() => document.querySelector(".ae-dialog")).toBeNull();
    const b = host({ actions: false });
    await render(b.Host);
    b.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expectNoViolations(document.querySelector(".ae-dialog")!);
  });
});
