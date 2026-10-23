import { afterEach, describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDialog from "./EDialog.vue";
import EToastProvider from "../ToastProvider/EToastProvider.vue";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import { useToast, type ToastApi } from "../../composables/useToast.js";

let toast: ToastApi;
const Grab = defineComponent({
  setup() {
    toast = useToast();
    return () => h("main", "App");
  },
});

afterEach(() => {
  toast?.clear();
  document.body.removeAttribute("style");
});

const hiddenAncestor = (el: Element | null) => el?.closest("[aria-hidden='true'], [inert]") ?? null;

async function openDialog(extra: Record<string, unknown> = {}) {
  await render(
    defineComponent({
      render: () =>
        h(EToastProvider, null, {
          default: () => [
            h(Grab),
            h(EDialog, { open: true, title: "Cancel it?", ...extra }, { default: () => "Body" }),
          ],
        }),
    }),
  );
  await expect.element(page.getByRole("dialog")).toBeVisible();
}

describe("live regions while a modal dialog is open", () => {
  test("the announcer region is not under an aria-hidden ancestor, whether it was made before or after the dialog opened", async () => {
    useAnnouncer().announce("made before");
    await openDialog();
    useAnnouncer().announce("3 results", { assertive: true });
    await expect.poll(() => document.querySelector("[data-e-announcer='assertive']")?.textContent).toBe("3 results");
    for (const kind of ["polite", "assertive"]) {
      expect(hiddenAncestor(document.querySelector(`[data-e-announcer="${kind}"]`))).toBeNull();
    }
  });

  test("a toast raised while the dialog is open is reachable: not hidden, and its dismiss button takes clicks", async () => {
    await openDialog();
    toast.show({ title: "Saved", tone: "success", duration: 0 });
    await expect.poll(() => document.querySelectorAll(".e-toast-region .e-toast").length).toBe(1);
    const region = document.querySelector<HTMLElement>(".e-toast-region")!;
    expect(hiddenAncestor(region)).toBeNull();
    expect(getComputedStyle(region).pointerEvents).not.toBe("none");
    await page.getByRole("button", { name: "Dismiss" }).click();
    await expect.poll(() => document.querySelectorAll(".e-toast-region .e-toast").length).toBe(0);
    // The dialog is still open: the click was on the toast, not the backdrop.
    expect(document.querySelector(".e-dialog")).not.toBeNull();
  });

  test("closing a toast does not count as a press outside a dismissible dialog", async () => {
    const closed: number[] = [];
    await openDialog({ dismissible: true, onClose: () => closed.push(1) });
    toast.show({ title: "Saved", tone: "success", duration: 0 });
    await expect.poll(() => document.querySelectorAll(".e-toast-region .e-toast").length).toBe(1);
    await page.getByRole("button", { name: "Dismiss" }).click();
    await expect.poll(() => document.querySelectorAll(".e-toast-region .e-toast").length).toBe(0);
    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector(".e-dialog")).not.toBeNull();
    expect(closed).toEqual([]);
  });
});

describe("toasts under a modal dialog", () => {
  test("the toast is announced and its close button takes a click, while the focus trap keeps keyboard focus in the dialog", async () => {
    await openDialog();
    toast.show({ title: "Saved", tone: "success", duration: 0 });
    await expect.poll(() => document.querySelectorAll(".e-toast-region .e-toast").length).toBe(1);
    await expect.poll(() => document.querySelector("[data-e-announcer='polite']")?.textContent?.trim()).toBe("Saved");
    await userEvent.keyboard("{F8}");
    await new Promise((r) => setTimeout(r, 100));
    expect(document.querySelector(".e-dialog")!.contains(document.activeElement)).toBe(true);
  });
});
