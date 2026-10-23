import { afterEach, describe, expect, test, vi } from "vitest";
import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EToastProvider from "./EToastProvider.vue";
import EButton from "../Button/EButton.vue";
import { createToasts, TOAST_KEY, useToast, type ToastApi } from "../../composables/useToast.js";
import { expectNoViolations } from "../../../test/axe.js";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const toasts = () => document.querySelectorAll(".e-toast-region .e-toast");

let api: ToastApi;
const Grab = defineComponent({
  setup() {
    api = useToast();
    return () => h("button", { id: "app" }, "App");
  },
});

async function mountApp() {
  return render(defineComponent({ render: () => h(EToastProvider, null, { default: () => h(Grab) }) }));
}

afterEach(() => api?.clear());

describe("EToastProvider", () => {
  test("renders its content, and the labelled region only while there are toasts", async () => {
    await mountApp();
    expect(document.getElementById("app")).not.toBeNull();
    expect(document.querySelectorAll(".e-toast-region")).toHaveLength(0);
    api.show({ title: "Saved" });
    await expect.poll(() => document.querySelectorAll(".e-toast-region").length).toBe(1);
    await expect.element(page.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
    expect(document.querySelector(".e-toast-region")!.hasAttribute("aria-live")).toBe(false);
    api.clear();
    await expect.poll(() => document.querySelectorAll(".e-toast-region").length).toBe(0);
  });

  test("show adds a toast with its title and detail, announced through the shared live regions", async () => {
    await mountApp();
    api.show({ title: "Saved", message: "All changes kept.", tone: "success" });
    api.show({ title: "Failed", tone: "danger" });
    await expect.poll(() => toasts().length).toBe(2);
    expect(toasts()[0]!.querySelector(".e-toast-text")!.textContent).toBe("All changes kept.");
    for (const toast of toasts()) expect(toast.hasAttribute("role")).toBe(false);
    await expect
      .poll(() => document.querySelector("[data-e-announcer='polite']")?.textContent)
      .toBe("Saved. All changes kept.");
    await expect.poll(() => document.querySelector("[data-e-announcer='assertive']")?.textContent).toBe("Failed");
  });

  test("success goes after its duration, an error stays", async () => {
    await mountApp();
    api.show({ title: "Saved", duration: 120 });
    api.show({ title: "Failed", tone: "danger" });
    await wait(60);
    expect(toasts()).toHaveLength(2);
    await wait(200);
    expect(toasts()).toHaveLength(1);
    expect(toasts()[0]!.querySelector(".e-toast-title")!.textContent).toBe("Failed");
  });

  test("icon and closable pass through to the toast", async () => {
    await mountApp();
    api.show({ title: "Quiet", closable: false, duration: 60000 });
    api.show({ title: "Loud", icon: "pin", duration: 0 });
    await expect.poll(() => toasts().length).toBe(2);
    expect(toasts()[0]!.querySelector(".e-notice-dismiss")).toBeNull();
    expect(toasts()[1]!.querySelector(".e-notice-dismiss")).not.toBeNull();
  });

  test("a toast with an action stays and shows the action", async () => {
    await mountApp();
    let undone = 0;
    api.show({
      title: "Deleted",
      action: () => h(EButton, { variant: "outline", onClick: () => undone++ }, () => "Undo"),
    });
    await expect.poll(() => toasts().length).toBe(1);
    expect(toasts()[0]!.classList.contains("e-toast--actions")).toBe(true);
    await page.getByRole("button", { name: "Undo" }).click();
    expect(undone).toBe(1);
    await wait(150);
    expect(toasts()).toHaveLength(1);
  });

  test("each toast has a dismiss button, and dismiss and clear remove toasts", async () => {
    await mountApp();
    const a = api.show({ title: "a", tone: "danger" });
    api.show({ title: "b", tone: "danger" });
    api.show({ title: "c", tone: "danger" });
    await expect.poll(() => toasts().length).toBe(3);
    await page.getByRole("button", { name: "Close notification" }).first().click();
    await expect.poll(() => toasts().length).toBe(2);
    api.dismiss(a);
    expect(toasts()).toHaveLength(2);
    api.clear();
    await expect.poll(() => toasts().length).toBe(0);
  });

  test("the timers wait while the pointer is on a toast", async () => {
    await mountApp();
    api.show({ title: "Saved", duration: 150 });
    await expect.poll(() => toasts().length).toBe(1);
    const region = document.querySelector<HTMLElement>(".e-toast-region")!;
    region.dispatchEvent(new MouseEvent("mouseenter"));
    await wait(350);
    expect(toasts()).toHaveLength(1);
    region.dispatchEvent(new MouseEvent("mouseleave"));
    await expect.poll(() => toasts().length).toBe(0);
  });

  test("the timers wait while keyboard focus is on a toast", async () => {
    await mountApp();
    api.show({ title: "Saved", duration: 150, action: () => h(EButton, null, () => "Open") });
    api.show({ title: "Other", duration: 150 });
    await expect.poll(() => toasts().length).toBe(2);
    (document.querySelector(".e-toast-region button") as HTMLElement).focus();
    await wait(350);
    expect(toasts().length).toBeGreaterThanOrEqual(1);
    (document.getElementById("app") as HTMLElement).focus();
    await userEvent.keyboard("{Tab}");
    expect(toasts().length).toBeGreaterThanOrEqual(1);
  });

  test("useToast outside a provider throws", async () => {
    let error: unknown;
    await render(
      defineComponent({
        setup() {
          try {
            useToast();
          } catch (e) {
            error = e;
          }
          return () => h("div");
        },
      }),
    );
    expect(String(error)).toContain("EToastProvider");
  });

  test("a store the app provided is the one the provider shows", async () => {
    const store = createToasts();
    const { container } = await render(
      defineComponent({
        render: () => h(EToastProvider, null, { default: () => h("p", "app") }),
      }),
      { global: { provide: { [TOAST_KEY as symbol]: store } } },
    );
    expect(container.textContent).toContain("app");
    store.show({ title: "From code", tone: "danger" });
    await expect.poll(() => toasts().length).toBe(1);
    store.clear();
  });

  test("the region sits at the bottom end of the screen, in the portal target", async () => {
    await mountApp();
    api.show({ title: "Saved", tone: "danger" });
    await expect.poll(() => toasts().length).toBe(1);
    const region = document.querySelector<HTMLElement>(".e-toast-region")!;
    expect(region.parentElement).toBe(document.body);
    expect(region.classList.contains("e-root")).toBe(true);
    const rect = region.getBoundingClientRect();
    expect(Math.round(rect.bottom)).toBe(window.innerHeight - 16);
    expect(Math.round(rect.right)).toBe(document.documentElement.clientWidth - 16);
    expect(getComputedStyle(region).position).toBe("fixed");
  });

  test("toasts keep their 24rem width in the region, and 40rem with an action", async () => {
    await mountApp();
    api.show({ title: "Saved", tone: "danger" });
    api.show({ title: "Deleted", action: () => h(EButton, null, () => "Undo") });
    await expect.poll(() => toasts().length).toBe(2);
    expect(Math.round(toasts()[0]!.getBoundingClientRect().width)).toBe(384);
    expect(Math.round(toasts()[1]!.getBoundingClientRect().width)).toBe(608);
  });

  test("a toast has no motion of its own, so reduced motion has nothing to turn off", async () => {
    await mountApp();
    api.show({ title: "Saved", tone: "danger" });
    await expect.poll(() => toasts().length).toBe(1);
    expect(getComputedStyle(toasts()[0]!).animationName).toBe("none");
    expect(getComputedStyle(toasts()[0]!).transitionDuration).toBe("0s");
  });

  test("axe finds nothing with toasts of every tone showing", async () => {
    await mountApp();
    for (const tone of ["info", "success", "warning", "danger"] as const)
      api.show({ title: `Toast ${tone}`, message: "Detail.", tone, duration: 0 });
    await expect.poll(() => toasts().length).toBe(4);
    await expectNoViolations(document.querySelector(".e-toast-region")!);
  });
});

describe("EToastProvider behaviour", () => {
  test("a toast with no duration keeps its close button even when closable is false", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await mountApp();
    api.show({ title: "Failed", tone: "danger", closable: false });
    await expect.poll(() => toasts().length).toBe(1);
    expect(toasts()[0]!.querySelector(".e-notice-dismiss")).not.toBeNull();
    warn.mockRestore();
  });

  test("limit keeps only the newest toasts", async () => {
    await render(defineComponent({ render: () => h(EToastProvider, { limit: 2 }, { default: () => h(Grab) }) }));
    for (const title of ["a", "b", "c"]) api.show({ title, tone: "danger" });
    await expect.poll(() => toasts().length).toBe(2);
    expect([...toasts()].map((t) => t.querySelector(".e-toast-title")!.textContent)).toEqual(["b", "c"]);
  });

  test("F8 focuses the notifications, Tab reaches a toast's button, Escape dismisses it and returns focus", async () => {
    await mountApp();
    const app = document.getElementById("app") as HTMLElement;
    app.focus();
    api.show({ title: "Failed", tone: "danger" });
    await expect.poll(() => toasts().length).toBe(1);
    await userEvent.keyboard("{F8}");
    const region = document.querySelector<HTMLElement>(".e-toast-region")!;
    expect(document.activeElement).toBe(region);
    await userEvent.tab();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Close notification");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => toasts().length).toBe(0);
    await expect.poll(() => document.activeElement).toBe(app);
  });

  test("the close button moves focus to the next toast, and from the last one back to where it was", async () => {
    await mountApp();
    const app = document.getElementById("app") as HTMLElement;
    app.focus();
    api.show({ title: "First", duration: 0 });
    api.show({ title: "Second", duration: 0 });
    await expect.poll(() => toasts().length).toBe(2);
    await userEvent.keyboard("{F8}");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => toasts().length).toBe(1);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Close notification");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => toasts().length).toBe(0);
    await expect.poll(() => document.activeElement).toBe(app);
  });

  test("the region shows a focus ring when F8 focuses it", async () => {
    await mountApp();
    api.show({ title: "Saved", duration: 0 });
    await expect.poll(() => toasts().length).toBe(1);
    await userEvent.keyboard("{F8}");
    const region = document.querySelector<HTMLElement>(".e-toast-region")!;
    expect(document.activeElement).toBe(region);
    expect(getComputedStyle(region).outlineStyle).not.toBe("none");
  });

  test("Escape on the region itself gives focus back and keeps the toasts", async () => {
    await mountApp();
    const app = document.getElementById("app") as HTMLElement;
    app.focus();
    api.show({ title: "Failed", tone: "danger" });
    await expect.poll(() => toasts().length).toBe(1);
    await userEvent.keyboard("{F8}");
    await userEvent.keyboard("{Escape}");
    expect(toasts()).toHaveLength(1);
    await expect.poll(() => document.activeElement).toBe(app);
  });

  test("timers wait while the tab is hidden", async () => {
    await mountApp();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    api.show({ title: "Saved", duration: 100 });
    await expect.poll(() => toasts().length).toBe(1);
    document.dispatchEvent(new Event("visibilitychange"));
    await wait(300);
    expect(toasts()).toHaveLength(1);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    await expect.poll(() => toasts().length).toBe(0);
    hidden.mockRestore();
  });

  test("a toast shown while the tab is already hidden does not start its timer", async () => {
    await mountApp();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    api.show({ title: "Saved", duration: 100 });
    await wait(300);
    expect(toasts()).toHaveLength(1);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    await expect.poll(() => toasts().length).toBe(0);
    hidden.mockRestore();
  });

  test("renders no teleport on the server and hydrates without a warning", async () => {
    const App = defineComponent({ render: () => h(EToastProvider, null, { default: () => h("p", "app") }) });
    const html = await renderToString(createSSRApp(App));
    expect(html).toContain("<p>app</p>");
    expect(html).not.toContain("teleport");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.append(host);
    const app = createSSRApp(App);
    app.mount(host);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("Hydration"))).toEqual([]);
    app.unmount();
    host.remove();
    warn.mockRestore();
  });

  test("promise() shows a toast that turns into the result", async () => {
    await mountApp();
    let done!: () => void;
    void api.promise(new Promise<void>((r) => (done = r)), { loading: "Saving", success: "Saved", error: "Failed" });
    await expect.poll(() => toasts()[0]?.querySelector(".e-toast-title")?.textContent).toBe("Saving");
    done();
    await expect.poll(() => toasts()[0]?.querySelector(".e-toast-title")?.textContent).toBe("Saved");
    expect(toasts()[0]!.classList.contains("e-toast--success")).toBe(true);
  });
});
