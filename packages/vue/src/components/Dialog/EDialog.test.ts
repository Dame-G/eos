import { afterEach, describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDialog from "./EDialog.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";
import { frames } from "../../../test/frames.js";

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
    expect(foot.previousElementSibling!.classList.contains("e-dialog-body")).toBe(true);
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

  test("an inline preview stays open on Escape, a press elsewhere, and focus moving out", async () => {
    const open = ref(true);
    const closed = ref(0);
    const Host = defineComponent({
      render: () =>
        h("div", [
          h("button", { id: "elsewhere" }, "Elsewhere"),
          h(
            EDialog,
            {
              title: "Preview",
              inline: true,
              dismissible: true,
              open: open.value,
              "onUpdate:open": (v?: boolean) => (open.value = !!v),
              onClose: () => closed.value++,
            },
            { default: () => "Body" },
          ),
        ]),
    });
    await render(Host);
    await expect.poll(() => document.querySelector(".e-dialog")).not.toBeNull();
    (document.querySelector(".e-dialog button") as HTMLElement).focus();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(document.getElementById("elsewhere")!);
    await userEvent.tab();
    await frames();
    expect(open.value).toBe(true);
    expect(closed.value).toBe(0);
    expect(document.querySelector(".e-dialog")).not.toBeNull();
  });

  test("renders into the portal target (the body by default)", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.querySelector(".e-dialog")!.parentElement!.parentElement).toBe(document.body);
  });

  test("description is shown under the title and wired through aria-describedby", async () => {
    const { Host, open } = host({ attrs: { description: "You can book again at any time." } });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog", { name: "Cancel this appointment?" })).toBeVisible();
    const dialog = document.querySelector<HTMLElement>(".e-dialog")!;
    const desc = dialog.querySelector<HTMLElement>(".e-dialog-description")!;
    expect(desc.textContent).toBe("You can book again at any time.");
    expect(dialog.getAttribute("aria-describedby")).toBe(desc.id);
    await expectNoViolations(dialog);
  });

  test("without a description there is no aria-describedby, so nothing dangles", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.querySelector(".e-dialog")!.hasAttribute("aria-describedby")).toBe(false);
  });

  test("an aria-describedby from the consumer is kept", async () => {
    const { Host, open } = host({ attrs: { "aria-describedby": "mine" } });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(document.querySelector(".e-dialog")!.getAttribute("aria-describedby")).toBe("mine");
  });

  test("role alertdialog sets the role, keeps focus in and Escape working, and passes axe", async () => {
    const { Host, open, closed } = host({ attrs: { role: "alertdialog", description: "This cannot be undone." } });
    await render(Host);
    const trigger = document.getElementById("trigger") as HTMLButtonElement;
    trigger.focus();
    open.value = true;
    await expect.element(page.getByRole("alertdialog", { name: "Cancel this appointment?" })).toBeVisible();
    const dialog = document.querySelector<HTMLElement>(".e-dialog")!;
    await expect.poll(() => dialog.contains(document.activeElement)).toBe(true);
    await expectNoViolations(dialog);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector(".e-dialog")).toBeNull();
    expect(closed.value).toBe(1);
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  test("the foot stays in view while a long body scrolls", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const dialog = document.querySelector<HTMLElement>(".e-dialog")!;
    const body = dialog.querySelector<HTMLElement>(".e-dialog-body")!;
    body.append(Object.assign(document.createElement("div"), { style: "height: 3000px" }));
    await expect.poll(() => body.scrollHeight > body.clientHeight).toBe(true);
    expect(getComputedStyle(dialog).overflow).toBe("hidden");
    const foot = dialog.querySelector<HTMLElement>(".e-dialog-foot")!;
    expect(foot.getBoundingClientRect().bottom).toBeLessThanOrEqual(dialog.getBoundingClientRect().bottom + 1);
    expect(getComputedStyle(body).overflowY).toBe("auto");
  });

  test("size sets the width from the panel tokens", async () => {
    const small = host({ attrs: { size: "sm" } });
    await render(small.Host);
    small.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const w = () => getComputedStyle(document.querySelector<HTMLElement>(".e-dialog")!).getPropertyValue("--_w");
    expect(w()).toBe("28rem");
    small.open.value = false;
    await expect.poll(() => document.querySelector(".e-dialog")).toBeNull();
    const large = host({ attrs: { size: "lg" } });
    await render(large.Host);
    large.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(w()).toBe("36rem");
  });

  test("an alert dialog opens on its least destructive action, not on Close", async () => {
    const { Host, open } = host({ attrs: { role: "alertdialog" } });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("alertdialog")).toBeVisible();
    await expect.poll(() => document.activeElement?.textContent).toBe("Keep it");
  });

  test("an alert dialog honours [data-autofocus] and initialFocus", async () => {
    const marked = defineComponent({
      render: () =>
        h(
          EDialog,
          { title: "Sure?", open: true, role: "alertdialog" },
          {
            default: () => h("input", { id: "mine", "data-autofocus": "" }),
            actions: () => h(EButton, null, () => "OK"),
          },
        ),
    });
    await render(marked);
    await expect.poll(() => document.activeElement?.id).toBe("mine");
  });

  test("initialFocus picks the element by selector", async () => {
    const picked = defineComponent({
      render: () =>
        h(
          EDialog,
          { title: "Name it", open: true, initialFocus: "#second" },
          {
            default: () => [h("input", { id: "first" }), h("input", { id: "second" })],
          },
        ),
    });
    await render(picked);
    await expect.poll(() => document.activeElement?.id).toBe("second");
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

  test("with no foot bar the body carries the panel's end corners, so the panel's clip cannot cut its focus ring", async () => {
    const corner = (el: Element, which: string) =>
      parseFloat(getComputedStyle(el).getPropertyValue(`border-${which}-radius`));
    for (const actions of [false, true]) {
      const { container, unmount } = await render(
        defineComponent({
          render: () =>
            h(
              EDialog,
              { title: "T", open: true, inline: true },
              { default: () => "Body", ...(actions ? { actions: () => h(EButton, null, () => "Go") } : {}) },
            ),
        }),
      );
      container.classList.add("e-root");
      for (const md of ["2px", "8px", "14px"]) {
        (container as HTMLElement).style.setProperty("--e-radius-md", md);
        const dialog = container.querySelector(".e-dialog")!;
        const body = container.querySelector(".e-dialog-body")!;
        for (const which of ["bottom-left", "bottom-right"]) {
          expect(corner(dialog, which)).toBe(parseFloat(md));
          expect(corner(body, which)).toBe(actions ? 0 : parseFloat(md));
        }
        expect(corner(body, "top-left")).toBe(0);
      }
      unmount();
    }
  });
});

describe("EDialog footer", () => {
  const foot = () => [...document.querySelectorAll(".e-dialog-foot .e-btn")].map((e) => e.getBoundingClientRect());
  const inline = ([a, b]: DOMRect[]) => Math.abs(a!.top - b!.top) < 2;

  test("sm and md dialogs keep their buttons side by side; only a phone-width one stacks them", async () => {
    for (const size of ["sm", "md"]) {
      const h1 = host({ attrs: { size } });
      const r = await render(h1.Host);
      h1.open.value = true;
      await expect.element(page.getByRole("dialog")).toBeVisible();
      expect(inline(foot()), size).toBe(true);
      r.unmount();
    }
    const narrow = host({ attrs: { style: "--_w: 20rem" } });
    const r = await render(narrow.Host);
    narrow.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(inline(foot())).toBe(false);
    r.unmount();
  });

  test("footer row keeps them side by side even in a phone-width dialog", async () => {
    const b = host({ attrs: { style: "--_w: 20rem", footer: "row" } });
    await render(b.Host);
    b.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(inline(foot())).toBe(true);
    await expectNoViolations(document.body);
  });

  test("the body keeps room under its last control", async () => {
    const b = host();
    await render(b.Host);
    b.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const body = document.querySelector<HTMLElement>(".e-dialog-body")!;
    expect(parseFloat(getComputedStyle(body).paddingBlockEnd)).toBeGreaterThan(0);
  });
});
