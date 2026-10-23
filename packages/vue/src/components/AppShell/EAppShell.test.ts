import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EAppShell from "./EAppShell.vue";
import EAppHeader from "../AppHeader/EAppHeader.vue";
import EAppFooter from "../AppFooter/EAppFooter.vue";
import ENavList from "../NavList/ENavList.vue";
import EPageHeader from "../PageHeader/EPageHeader.vue";
import { expectNoViolations } from "../../../test/axe.js";

const slots = {
  header: () =>
    h(EAppHeader, null, {
      logo: () => h("a", { href: "/" }, "OpenPractice"),
      default: () => h(ENavList, { label: "Primary", items: [{ label: "Home", href: "/", current: true }] }),
    }),
  sidebar: () =>
    h(ENavList, {
      label: "Account",
      items: [
        { label: "Statements", href: "/statements" },
        { label: "Forms", href: "/forms", count: 2 },
      ],
    }),
  footer: () => h(EAppFooter, null, () => "© 2026 OpenPractice"),
  default: () => [h(EPageHeader, { title: "Your account" }), h("button", "Pay now")],
};
const noSide = { header: slots.header, footer: slots.footer, default: slots.default };

describe("EAppShell", () => {
  // The test window is a phone; the page frame is tested wide unless a test says otherwise.
  beforeEach(() => page.viewport(1024, 768));
  afterEach(() => page.viewport(640, 800));

  test("lays out the landmarks: banner, navigation, complementary, main and contentinfo", async () => {
    await render(EAppShell, { slots });
    await expect.element(page.getByRole("banner")).toBeVisible();
    await expect.element(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect.element(page.getByRole("complementary", { name: "Sidebar" })).toBeVisible();
    await expect.element(page.getByRole("navigation", { name: "Account" })).toBeVisible();
    await expect.element(page.getByRole("main")).toBeVisible();
    await expect.element(page.getByRole("contentinfo")).toBeVisible();
    await expect.element(page.getByRole("heading", { level: 1, name: "Your account" })).toBeVisible();
  });

  test("sidebarLabel names the complementary landmark", async () => {
    await render(EAppShell, { props: { sidebarLabel: "Your account" }, slots });
    await expect.element(page.getByRole("complementary", { name: "Your account" })).toBeVisible();
  });

  test("no sidebar slot, no aside and no side column", async () => {
    const { container } = await render(EAppShell, { slots: noSide });
    expect(container.querySelector("aside")).toBeNull();
    expect(container.querySelector(".e-shell")!.classList.contains("e-shell--side")).toBe(false);
  });

  test("the order is skip link, header, body, footer", async () => {
    const { container } = await render(EAppShell, { slots });
    const kids = [...container.querySelector(".e-shell")!.children].map((c) => c.className.split(" ")[0] || c.tagName);
    expect(kids).toEqual(["e-skip", "e-appheader", "e-shell-body", "e-appfooter"]);
  });

  test("the skip link is the first tab stop and moves focus to main", async () => {
    const { container } = await render(EAppShell, { slots });
    await userEvent.tab();
    const skip = container.querySelector<HTMLElement>(".e-skip")!;
    expect(document.activeElement).toBe(skip);
    expect(skip.textContent!.trim()).toBe("Skip to main content");
    expect(skip.getAttribute("href")).toBe("#main");
    await userEvent.keyboard("{Enter}");
    const main = container.querySelector("main")!;
    expect(document.activeElement).toBe(main);
    expect(getComputedStyle(main).outlineStyle).toBe("solid");
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("Pay now");
  });

  test("mainId sets the main element's id and the skip link's target", async () => {
    const { container } = await render(EAppShell, { props: { mainId: "content" }, slots });
    expect(container.querySelector("main")!.id).toBe("content");
    expect(container.querySelector(".e-skip")!.getAttribute("href")).toBe("#content");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(container.querySelector("#content"));
  });

  test("main can take focus from a script but is not a tab stop", async () => {
    const { container } = await render(EAppShell, { slots: noSide });
    expect(container.querySelector("main")!.tabIndex).toBe(-1);
  });

  test("the sidebar is two columns from 48rem and leaves the page below that", async () => {
    await page.viewport(1024, 768);
    try {
      const { container } = await render(EAppShell, { slots });
      const side = container.querySelector("aside")!;
      const main = container.querySelector("main")!;
      expect(side.getBoundingClientRect().right).toBeLessThanOrEqual(main.getBoundingClientRect().left);
      expect(Math.round(side.getBoundingClientRect().width)).toBe(240);
      await page.viewport(600, 768);
      await expect.poll(() => container.querySelector("aside")).toBeNull();
      await page.viewport(768, 768);
      await expect.poll(() => container.querySelector("aside")).not.toBeNull();
      const wide = container.querySelector("aside")!.getBoundingClientRect();
      expect(wide.right).toBeLessThanOrEqual(container.querySelector("main")!.getBoundingClientRect().left);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("below 48rem a menu button in the header opens the sidebar in a drawer", async () => {
    await page.viewport(600, 768);
    try {
      await render(EAppShell, { slots });
      const toggle = page.getByRole("button", { name: "Menu" });
      await expect.element(toggle).toHaveAttribute("aria-expanded", "false");
      const button = toggle.element();
      await toggle.click();
      expect(button.getAttribute("aria-expanded")).toBe("true");
      const dialog = page.getByRole("dialog", { name: "Menu" });
      await expect.element(dialog).toBeVisible();
      await expect.element(dialog.getByRole("navigation", { name: "Account" })).toBeVisible();
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(button);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("following a link in the drawer closes it, and widening the window closes it too", async () => {
    await page.viewport(600, 768);
    try {
      const open = ref(false);
      await render(
        defineComponent({
          render: () =>
            h(EAppShell, { navOpen: open.value, "onUpdate:navOpen": (v: boolean) => (open.value = v) }, slots),
        }),
      );
      await page.getByRole("button", { name: "Menu" }).click();
      expect(open.value).toBe(true);
      const link = page.getByRole("dialog").getByRole("link", { name: "Statements" });
      link.element().addEventListener("click", (e) => e.preventDefault());
      await link.click();
      expect(open.value).toBe(false);
      open.value = true;
      await page.viewport(1024, 768);
      await expect.poll(() => open.value).toBe(false);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("navToggle off keeps the sidebar above the content on a phone", async () => {
    await page.viewport(600, 768);
    try {
      const { container } = await render(EAppShell, { props: { navToggle: false }, slots });
      const side = container.querySelector("aside")!;
      expect(side.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        container.querySelector("main")!.getBoundingClientRect().top,
      );
      expect(page.getByRole("button", { name: "Menu" }).elements().length).toBe(0);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("the sidebar and the navigation inside it are two landmarks with two names", async () => {
    await render(EAppShell, { slots });
    await expect.element(page.getByRole("complementary", { name: "Sidebar" })).toBeVisible();
    await expect.element(page.getByRole("navigation", { name: "Account" })).toBeVisible();
    expect(page.getByLabelText("Main", { exact: true }).elements().length).toBe(0);
  });

  test("the ground beside the column is tinted, and the footer matches the header", async () => {
    const { container } = await render(EAppShell, { slots: noSide });
    container.classList.add("e-root");
    const bg = (sel: string) => getComputedStyle(container.querySelector(sel)!).backgroundColor;
    expect(bg(".e-shell")).not.toBe(bg(".e-shell-body"));
    expect(bg(".e-appfooter")).toBe(bg(".e-appheader"));
  });

  test("the content is capped at 72rem and centred", async () => {
    await page.viewport(1600, 900);
    try {
      const { container } = await render(EAppShell, { slots: noSide });
      const body = container.querySelector<HTMLElement>(".e-shell-body")!;
      expect(getComputedStyle(body).width).toBe("1152px");
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("the header and footer run full width, and the rails run beside the content only", async () => {
    await page.viewport(1600, 900);
    try {
      const { container } = await render(EAppShell, { slots: noSide });
      const header = container.querySelector<HTMLElement>(".e-appheader")!;
      const footer = container.querySelector<HTMLElement>(".e-appfooter")!;
      const body = container.querySelector<HTMLElement>(".e-shell-body")!;
      expect(Math.round(header.getBoundingClientRect().width)).toBe(1600);
      expect(Math.round(footer.getBoundingClientRect().width)).toBe(1600);
      expect(getComputedStyle(container.querySelector(".e-shell")!, "::after").content).toBe("none");
      const rail = getComputedStyle(body, "::after");
      expect(rail.borderInlineStartStyle).toBe("solid");
      expect(rail.borderInlineEndStyle).toBe("solid");
      const inner = container.querySelector<HTMLElement>(".e-appheader .e-shell-inner")!;
      expect(Math.round(inner.getBoundingClientRect().left)).toBe(Math.round(body.getBoundingClientRect().left));
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("class, style and attributes fall through to the root", async () => {
    const { container } = await render(EAppShell, { slots, attrs: { class: "mine", "data-x": "1" } });
    const root = container.firstElementChild!;
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.classList.contains("e-shell")).toBe(true);
    expect(root.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations with a sidebar", async () => {
    const { container } = await render(EAppShell, { slots });
    await expectNoViolations(container);
  });

  test("has no accessibility violations without a sidebar, and with the skip link showing", async () => {
    const { container } = await render(EAppShell, { slots: noSide });
    await expectNoViolations(container);
    await userEvent.tab();
    await expectNoViolations(container);
  });
});
