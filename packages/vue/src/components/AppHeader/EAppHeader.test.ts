import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EAppHeader from "./EAppHeader.vue";
import ENavList from "../NavList/ENavList.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

const slots = {
  logo: () => h("a", { href: "/" }, "OpenPractice"),
  actions: () => h(EButton, { variant: "outline", icon: "user" }, () => "Maria"),
  default: () =>
    h(ENavList, {
      label: "Main",
      items: [
        { label: "Home", icon: "home", href: "/", current: true },
        { label: "Pay a bill", icon: "card", href: "/pay" },
        { label: "Appointments", icon: "calendar", href: "/appointments" },
      ],
    }),
};

describe("EAppHeader", () => {
  test("is the banner landmark with the logo, the actions and the navigation", async () => {
    const { container } = await render(EAppHeader, { slots });
    await expect.element(page.getByRole("banner")).toBeVisible();
    await expect.element(page.getByRole("link", { name: "OpenPractice" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Maria" })).toBeVisible();
    await expect.element(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    expect(container.querySelector(".e-appheader-logo a")).not.toBeNull();
    expect(container.querySelector(".e-appheader-actions .e-btn")).not.toBeNull();
    expect(container.querySelector(".e-appheader-nav .e-nav")).not.toBeNull();
  });

  test("the navigation sits on its own row below the bar", async () => {
    const { container } = await render(EAppHeader, { slots });
    const bar = container.querySelector(".e-appheader-bar")!.getBoundingClientRect();
    const nav = container.querySelector(".e-appheader-nav")!.getBoundingClientRect();
    expect(nav.top).toBeGreaterThanOrEqual(bar.bottom - 1);
    expect(bar.height).toBeGreaterThanOrEqual(64);
  });

  test("on a phone the navigation scrolls sideways instead of collapsing", async () => {
    await page.viewport(320, 700);
    try {
      const { container } = await render(EAppHeader, {
        slots: {
          ...slots,
          default: () => h("nav", { "aria-label": "Long" }, [h("div", { style: "width: 900px" }, "wide")]),
        },
      });
      const nav = container.querySelector<HTMLElement>(".e-appheader-nav")!;
      expect(getComputedStyle(nav).overflowX).toBe("auto");
      expect(nav.scrollWidth).toBeGreaterThan(nav.clientWidth);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("without actions or navigation only the bar shows", async () => {
    const { container } = await render(EAppHeader, { slots: { logo: () => "Brand" } });
    expect(container.querySelector(".e-appheader-actions")).toBeNull();
    expect(container.querySelector(".e-appheader-nav")).toBeNull();
  });

  test("sticky pins it to the top", async () => {
    const { container } = await render(EAppHeader, { props: { sticky: true }, slots });
    const header = container.querySelector("header")!;
    expect(header.classList.contains("e-appheader--sticky")).toBe(true);
    expect(getComputedStyle(header).position).toBe("sticky");
  });

  test("keyboard: Tab goes logo, actions, then the navigation", async () => {
    await render(EAppHeader, { slots });
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      await userEvent.tab();
      seen.push(document.activeElement!.textContent!.replace(/\s+/g, " ").trim());
    }
    expect(seen).toEqual(["OpenPractice", "Maria", "Home", "Pay a bill"]);
  });

  test("class, style and attributes fall through to the header", async () => {
    const { container } = await render(EAppHeader, { slots, attrs: { class: "mine", "data-x": "1" } });
    const header = container.querySelector("header")!;
    expect(header.classList.contains("mine")).toBe(true);
    expect(header.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(EAppHeader, { slots });
    await expectNoViolations(container);
  });

  test("has no accessibility violations when sticky and with only a logo", async () => {
    const { container } = await render(EAppHeader, { props: { sticky: true }, slots: { logo: slots.logo } });
    await expectNoViolations(container);
  });
});
