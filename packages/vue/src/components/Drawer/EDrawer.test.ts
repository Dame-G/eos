import { afterEach, describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDrawer from "./EDrawer.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

afterEach(() => {
  document.body.removeAttribute("style");
});

function host(props: Record<string, unknown> = {}, withActions = true) {
  const open = ref(false);
  const closed = ref(0);
  const Host = defineComponent({
    render: () =>
      h("div", [
        h("button", { id: "trigger", onClick: () => (open.value = true) }, "Open"),
        h(
          EDrawer,
          {
            title: "October statement",
            open: open.value,
            "onUpdate:open": (v?: boolean) => (open.value = !!v),
            onClose: () => closed.value++,
            ...props,
          },
          {
            default: () => h("p", "Statement body"),
            ...(withActions ? { actions: () => h(EButton, null, () => "Pay now") } : {}),
          },
        ),
      ]),
  });
  return { Host, open, closed };
}

const drawer = () => document.querySelector<HTMLElement>(".e-drawer")!;

describe("EDrawer", () => {
  test("is a modal dialog named by its title, with a Close button", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog", { name: "October statement" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Close" })).toBeVisible();
    const body = drawer().querySelector<HTMLElement>(".e-drawer-body")!;
    expect(body.hasAttribute("role")).toBe(false);
  });

  test("the body is a tab stop only when its content scrolls", async () => {
    const short = host();
    await render(short.Host);
    short.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const body = () => drawer().querySelector<HTMLElement>(".e-drawer-body")!;
    await expect.poll(() => body().hasAttribute("tabindex")).toBe(false);
    short.open.value = false;
    await expect.poll(() => document.querySelector(".e-drawer")).toBeNull();

    const open = ref(true);
    await render(
      defineComponent({
        render: () =>
          h(
            EDrawer,
            { title: "Long", open: open.value, "onUpdate:open": (v?: boolean) => (open.value = !!v) },
            { default: () => h("div", { style: { height: "3000px" } }, "tall") },
          ),
      }),
    );
    await expect.poll(() => body().tabIndex).toBe(0);
  });

  test("is 28rem wide at the end by default, the full height, and at the start on request", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect.poll(() => Math.round(drawer().getBoundingClientRect().width)).toBe(448);
    await expect
      .poll(() => Math.round(drawer().getBoundingClientRect().right))
      .toBe(document.documentElement.clientWidth);
    expect(Math.round(drawer().getBoundingClientRect().height)).toBe(window.innerHeight);
    open.value = false;
    await expect.poll(() => document.querySelector(".e-drawer")).toBeNull();
    const left = host({ side: "start" });
    await render(left.Host);
    left.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(drawer().classList.contains("e-drawer--start")).toBe(true);
    await expect.poll(() => Math.round(drawer().getBoundingClientRect().left)).toBe(0);
  });

  test("left and right are accepted as aliases for start and end", async () => {
    const left = host({ side: "left" });
    await render(left.Host);
    left.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(drawer().classList.contains("e-drawer--start")).toBe(true);
    left.open.value = false;
    await expect.poll(() => document.querySelector(".e-drawer")).toBeNull();
    const right = host({ side: "right" });
    await render(right.Host);
    right.open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    expect(drawer().className).not.toContain("e-drawer--");
  });

  test("focus is trapped, Escape closes it and focus returns to the trigger", async () => {
    const { Host, open, closed } = host();
    await render(Host);
    const trigger = document.getElementById("trigger") as HTMLButtonElement;
    trigger.focus();
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expect.poll(() => drawer().contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      expect(drawer().contains(document.activeElement)).toBe(true);
    }
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector(".e-drawer")).toBeNull();
    expect(closed.value).toBe(1);
    await expect.poll(() => document.activeElement).toBe(trigger);
  });

  test("the scrolling body can be reached with Tab", async () => {
    const open = ref(true);
    await render(
      defineComponent({
        render: () =>
          h(
            EDrawer,
            { title: "Long", open: open.value, "onUpdate:open": (v?: boolean) => (open.value = !!v) },
            { default: () => h("div", { style: { height: "3000px" } }, "tall") },
          ),
      }),
    );
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const body = drawer().querySelector<HTMLElement>(".e-drawer-body")!;
    await expect.poll(() => body.tabIndex).toBe(0);
    let reached = false;
    for (let i = 0; i < 4 && !reached; i++) {
      await userEvent.tab();
      reached = document.activeElement === body;
    }
    expect(reached).toBe(true);
  });

  test("the actions slot is a foot bar after the body", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    const foot = drawer().querySelector<HTMLElement>("footer.e-actions--bar.e-dialog-foot")!;
    expect(foot.previousElementSibling!.className).toBe("e-drawer-body");
    await expect.element(page.getByRole("button", { name: "Pay now" })).toBeVisible();
  });

  test("headingLevel sets the title element; attributes land on the drawer", async () => {
    const { Host, open } = host({ headingLevel: 3, class: "mine", "data-x": "1" }, false);
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("heading", { level: 3 })).toBeVisible();
    expect(drawer().classList.contains("mine")).toBe(true);
    expect(drawer().dataset.x).toBe("1");
    expect(document.querySelector(".e-dialog-foot")).toBeNull();
  });

  test("inline shows it in the page without a backdrop", async () => {
    const { container } = await render(EDrawer, {
      props: { open: true, inline: true, title: "Preview" },
      slots: { default: "Body" },
    });
    const el = container.querySelector<HTMLElement>(".e-drawer--inline")!;
    expect(getComputedStyle(el).position).toBe("static");
    expect(document.querySelector(".e-dialog-overlay")).toBeNull();
  });

  test("description and role reach the drawer", async () => {
    const { Host, open } = host({ description: "Billing period 1 to 31 October.", role: "alertdialog" });
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("alertdialog", { name: "October statement" })).toBeVisible();
    const el = drawer();
    const desc = el.querySelector<HTMLElement>(".e-dialog-description")!;
    expect(desc.textContent).toBe("Billing period 1 to 31 October.");
    expect(el.getAttribute("aria-describedby")).toBe(desc.id);
    await expectNoViolations(el);
  });

  test("the slide animation takes its length from the move duration token", async () => {
    const { Host, open } = host();
    await render(Host);
    document.documentElement.style.setProperty("--e-duration-move", "777ms");
    try {
      open.value = true;
      await expect.element(page.getByRole("dialog")).toBeVisible();
      expect(getComputedStyle(drawer()).animationDuration).toBe("0.777s");
    } finally {
      document.documentElement.style.removeProperty("--e-duration-move");
    }
  });

  test("axe finds nothing in the open drawer", async () => {
    const { Host, open } = host();
    await render(Host);
    open.value = true;
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await expectNoViolations(drawer());
  });
});
