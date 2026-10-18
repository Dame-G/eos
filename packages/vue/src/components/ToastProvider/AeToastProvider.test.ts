import { afterEach, describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeToastProvider from "./AeToastProvider.vue";
import AeButton from "../Button/AeButton.vue";
import { createToasts, TOAST_KEY, useToast, type ToastApi } from "../../composables/useToast.js";
import { expectNoViolations } from "../../../test/axe.js";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const toasts = () => document.querySelectorAll(".ae-toast-region .ae-toast");

let api: ToastApi;
const Grab = defineComponent({
  setup() {
    api = useToast();
    return () => h("button", { id: "app" }, "App");
  },
});

async function mountApp() {
  return render(defineComponent({ render: () => h(AeToastProvider, null, { default: () => h(Grab) }) }));
}

afterEach(() => api?.clear());

describe("AeToastProvider", () => {
  test("renders its content and one labelled region, announced politely as status messages", async () => {
    await mountApp();
    expect(document.getElementById("app")).not.toBeNull();
    expect(document.querySelectorAll(".ae-toast-region")).toHaveLength(1);
    await expect.element(page.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
  });

  test("show adds a toast with its title and detail; success is a status, danger an alert", async () => {
    await mountApp();
    api.show({ title: "Saved", message: "All changes kept.", tone: "success" });
    api.show({ title: "Failed", tone: "danger" });
    await expect.poll(() => toasts().length).toBe(2);
    expect(toasts()[0]!.getAttribute("role")).toBe("status");
    expect(toasts()[0]!.querySelector(".ae-toast-text")!.textContent).toBe("All changes kept.");
    expect(toasts()[1]!.getAttribute("role")).toBe("alert");
  });

  test("success goes after its duration, an error stays", async () => {
    await mountApp();
    api.show({ title: "Saved", duration: 120 });
    api.show({ title: "Failed", tone: "danger" });
    await wait(60);
    expect(toasts()).toHaveLength(2);
    await wait(200);
    expect(toasts()).toHaveLength(1);
    expect(toasts()[0]!.getAttribute("role")).toBe("alert");
  });

  test("a toast with an action stays and shows the action", async () => {
    await mountApp();
    let undone = 0;
    api.show({
      title: "Deleted",
      action: () => h(AeButton, { variant: "outline", onClick: () => undone++ }, () => "Undo"),
    });
    await expect.poll(() => toasts().length).toBe(1);
    expect(toasts()[0]!.classList.contains("ae-toast--actions")).toBe(true);
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
    await page.getByRole("button", { name: "Dismiss" }).first().click();
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
    const region = document.querySelector<HTMLElement>(".ae-toast-region")!;
    region.dispatchEvent(new MouseEvent("mouseenter"));
    await wait(350);
    expect(toasts()).toHaveLength(1);
    region.dispatchEvent(new MouseEvent("mouseleave"));
    await expect.poll(() => toasts().length).toBe(0);
  });

  test("the timers wait while keyboard focus is on a toast", async () => {
    await mountApp();
    api.show({ title: "Saved", duration: 150, action: () => h(AeButton, null, () => "Open") });
    api.show({ title: "Other", duration: 150 });
    await expect.poll(() => toasts().length).toBe(2);
    (document.querySelector(".ae-toast-region button") as HTMLElement).focus();
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
    expect(String(error)).toContain("AeToastProvider");
  });

  test("a store the app provided is the one the provider shows", async () => {
    const store = createToasts();
    const { container } = await render(
      defineComponent({
        render: () => h(AeToastProvider, null, { default: () => h("p", "app") }),
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
    const region = document.querySelector<HTMLElement>(".ae-toast-region")!;
    expect(region.parentElement).toBe(document.body);
    expect(region.classList.contains("ae-root")).toBe(true);
    const rect = region.getBoundingClientRect();
    expect(Math.round(rect.bottom)).toBe(window.innerHeight - 16);
    expect(Math.round(rect.right)).toBe(document.documentElement.clientWidth - 16);
    expect(getComputedStyle(region).position).toBe("fixed");
  });

  test("toasts keep their 24rem width in the region, and 40rem with an action", async () => {
    await mountApp();
    api.show({ title: "Saved", tone: "danger" });
    api.show({ title: "Deleted", action: () => h(AeButton, null, () => "Undo") });
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
    await expectNoViolations(document.querySelector(".ae-toast-region")!);
  });
});
