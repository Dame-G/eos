import { describe, expect, test } from "vitest";
import { h } from "vue";
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
  test("lays out the landmarks: banner, navigation, complementary, main and contentinfo", async () => {
    await render(EAppShell, { slots });
    await expect.element(page.getByRole("banner")).toBeVisible();
    await expect.element(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect.element(page.getByRole("complementary", { name: "Main" })).toBeVisible();
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

  test("the sidebar is two columns from 48rem and sits above the content below that", async () => {
    await page.viewport(1024, 768);
    try {
      const { container } = await render(EAppShell, { slots });
      const side = container.querySelector("aside")!;
      const main = container.querySelector("main")!;
      expect(side.getBoundingClientRect().right).toBeLessThanOrEqual(main.getBoundingClientRect().left);
      expect(Math.round(side.getBoundingClientRect().width)).toBe(240);
      await page.viewport(600, 768);
      expect(side.getBoundingClientRect().bottom).toBeLessThanOrEqual(main.getBoundingClientRect().top);
      await page.viewport(768, 768);
      expect(side.getBoundingClientRect().right).toBeLessThanOrEqual(main.getBoundingClientRect().left);
    } finally {
      await page.viewport(1024, 768);
    }
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
