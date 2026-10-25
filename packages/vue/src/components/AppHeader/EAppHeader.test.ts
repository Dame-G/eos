import { describe, expect, test } from "vitest";
import { defineComponent, h, markRaw, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EAppHeader from "./EAppHeader.vue";
import ENavList from "../NavList/ENavList.vue";
import EButton from "../Button/EButton.vue";
import ETabs from "../Tabs/ETabs.vue";
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

  test("on a phone, navigation that cannot wrap scrolls sideways instead of collapsing", async () => {
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
      // While it scrolls it is a tab stop, so the keyboard can scroll it.
      await expect.poll(() => nav.getAttribute("tabindex")).toBe("0");
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

  test("navToggle shows a menu button first in the tab order and reports the open state", async () => {
    const open = ref(false);
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            EAppHeader,
            { navToggle: true, navOpen: open.value, "onUpdate:navOpen": (v: boolean) => (open.value = v) },
            slots,
          ),
      }),
    );
    const button = container.querySelector<HTMLElement>(".e-appheader-toggle")!;
    expect(button.getAttribute("aria-label")).toBe("Menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    await userEvent.tab();
    expect(document.activeElement).toBe(button);
    await userEvent.keyboard("{Enter}");
    expect(open.value).toBe(true);
    await expect.poll(() => button.getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard(" ");
    expect(open.value).toBe(false);
  });

  test("there is no menu button unless asked for, and the logo shows a focus ring from the keyboard", async () => {
    const { container } = await render(EAppHeader, { slots });
    container.classList.add("e-root");
    expect(container.querySelector(".e-appheader-toggle")).toBeNull();
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("OpenPractice");
    expect(getComputedStyle(document.activeElement!).outlineStyle).toBe("solid");
  });

  test("a sticky header stays above the raised tabs of the page under it", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EAppHeader, { sticky: true }, { logo: () => "Logo" }),
            h(
              ETabs,
              {
                items: [
                  { id: "a", label: "One" },
                  { id: "b", label: "Two" },
                ],
              },
              { "panel-a": () => "A" },
            ),
          ]),
      }),
    );
    container.classList.add("e-root");
    const header = container.querySelector("header")!;
    expect(getComputedStyle(header).position).toBe("sticky");
    expect(getComputedStyle(container.querySelector(".e-tabs")!).isolation).toBe("isolate");
  });

  test("a sticky header sits above everything the page raises, and below every overlay", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            h(EAppHeader, { sticky: true }, { logo: () => "Logo" }),
            // A sticky table head (z-sticky) and a focused control (z-focus) that come later in the page.
            h("div", {
              style: "position: relative; z-index: var(--e-z-focus); margin-top: -40px; height: 80px",
              "data-raised": "",
            }),
          ]),
      }),
    );
    const header = container.querySelector("header")!;
    const token = (name: string) =>
      Number(getComputedStyle(document.documentElement).getPropertyValue(`--e-z-${name}`));
    const z = Number(getComputedStyle(header).zIndex);
    expect(z).toBe(token("header"));
    expect(z).toBeGreaterThan(token("focus"));
    expect(z).toBeLessThan(token("modal"));
    const box = header.getBoundingClientRect();
    expect(header.contains(document.elementFromPoint(box.left + 4, box.bottom - 4))).toBe(true);
  });

  test("brand draws a styled link to the home page", async () => {
    const { container } = await render(EAppHeader, { props: { brand: "Acme" } });
    const link = container.querySelector<HTMLAnchorElement>("a.e-appheader-brand")!;
    expect(link.getAttribute("href")).toBe("/");
    expect(link.textContent!.trim()).toBe("Acme");
    expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await userEvent.tab();
    expect(document.activeElement).toBe(link);
    expect(getComputedStyle(link).outlineStyle).toBe("solid");
  });

  test("the brand link and the logo slot are one gap apart, not two", async () => {
    const { container } = await render(EAppHeader, {
      props: { brand: "Acme" },
      slots: { logo: () => h("button", { type: "button" }, "Search") },
    });
    const link = container.querySelector<HTMLElement>(".e-appheader-brand")!;
    const gap = parseFloat(getComputedStyle(container.querySelector(".e-appheader-logo")!).columnGap);
    const search = container.querySelector("button")!;
    expect(parseFloat(getComputedStyle(link).marginInlineEnd)).toBe(0);
    expect(Math.round(search.getBoundingClientRect().left - link.getBoundingClientRect().right)).toBe(Math.round(gap));
  });

  test("a sticky header publishes its height as --e-header-height; one that scrolls away publishes 0px", async () => {
    const sticky = ref(true);
    const { container, unmount } = await render(
      defineComponent({ render: () => h(EAppHeader, { sticky: sticky.value }, slots) }),
    );
    const root = document.documentElement;
    const height = container.querySelector<HTMLElement>(".e-appheader")!.offsetHeight;
    await expect.poll(() => root.style.getPropertyValue("--e-header-height")).toBe(`${height}px`);
    sticky.value = false;
    await expect.poll(() => root.style.getPropertyValue("--e-header-height")).toBe("0px");
    unmount();
    expect(root.style.getPropertyValue("--e-header-height")).toBe("");
  });

  test("the brand slot holds a logo, named by brandLabel, before the logo slot", async () => {
    const { container } = await render(EAppHeader, {
      props: { brandHref: "/home", brandLabel: "Acme, home" },
      slots: {
        brand: () => h("svg", { "aria-hidden": "true", width: 80, height: 24 }),
        logo: () => h("button", "Search"),
      },
    });
    const link = container.querySelector("a.e-appheader-brand")!;
    expect(link.getAttribute("href")).toBe("/home");
    await expect.element(page.getByRole("link", { name: "Acme, home" })).toBeVisible();
    expect(link.nextElementSibling!.tagName).toBe("BUTTON");
    await expectNoViolations(container);
  });

  test("brandTo goes to the linkComponent as to", async () => {
    const Router = markRaw(
      defineComponent({
        props: { to: String },
        render() {
          return h("a", { href: "/app" + this.to }, this.$slots.default?.());
        },
      }),
    );
    const { container } = await render(EAppHeader, { props: { brand: "Acme", brandTo: "/", linkComponent: Router } });
    expect(container.querySelector("a.e-appheader-brand")!.getAttribute("href")).toBe("/app/");
  });

  test("without brand there is no brand link", async () => {
    const { container } = await render(EAppHeader, { slots: { logo: () => "Logo" } });
    expect(container.querySelector(".e-appheader-brand")).toBeNull();
  });
});
