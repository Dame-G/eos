import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EBreadcrumb from "./EBreadcrumb.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { label: "Account", href: "/account" },
  { label: "Statements", href: "/statements" },
  { label: "Visit on Oct 2" },
];

// Stands in for RouterLink: takes `to`, renders the href itself, and wraps its default slot.
const FakeRouterLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup:
    (props, { slots }) =>
    () =>
      h("a", { href: `/app${props.to}`, "data-router": "" }, slots.default?.()),
});

describe("EBreadcrumb", () => {
  test("is a navigation landmark named Breadcrumb holding an ordered list", async () => {
    const { container } = await render(EBreadcrumb, { props: { items } });
    await expect.element(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    expect(container.querySelector("nav.e-crumbs > ol")).not.toBeNull();
    expect(container.querySelectorAll("ol > li").length).toBe(3);
  });

  test("earlier levels are links and the last is the current page, not a link", async () => {
    const { container } = await render(EBreadcrumb, { props: { items } });
    const links = container.querySelectorAll<HTMLAnchorElement>("a.e-crumb");
    expect([...links].map((a) => a.getAttribute("href"))).toEqual(["/account", "/statements"]);
    const current = container.querySelector(".e-crumb-current")!;
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.tagName).toBe("SPAN");
    expect(container.querySelectorAll("[aria-current]").length).toBe(1);
    expect(page.getByRole("link", { name: "Visit on Oct 2" }).elements().length).toBe(0);
  });

  test("a chevron separates levels and stays out of the accessible text", async () => {
    const { container } = await render(EBreadcrumb, { props: { items } });
    expect(container.querySelectorAll("li > svg.e-icon, li > .e-icon").length).toBe(2);
    expect(container.querySelectorAll("li:last-child .e-icon").length).toBe(0);
  });

  test("each link is as tall as a control, so it is easy to hit", async () => {
    const { container } = await render(EBreadcrumb, { props: { items } });
    expect(container.querySelector("a.e-crumb")!.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  });

  test("keyboard: Tab visits each link in order", async () => {
    await render(EBreadcrumb, { props: { items } });
    await userEvent.tab();
    expect(document.activeElement!.textContent!.trim()).toBe("Account");
    await userEvent.tab();
    expect(document.activeElement!.textContent!.trim()).toBe("Statements");
    await userEvent.tab();
    expect(document.activeElement!.closest(".e-crumbs")).toBeNull();
  });

  test("linkComponent renders a router link with `to`", async () => {
    const { container } = await render(EBreadcrumb, {
      props: {
        linkComponent: FakeRouterLink,
        items: [{ label: "Home", to: "/" }, { label: "Statements", to: "/statements" }, { label: "Now" }],
      },
    });
    const links = [...container.querySelectorAll<HTMLAnchorElement>("a[data-router]")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/app/", "/app/statements"]);
    expect(links.every((a) => a.classList.contains("e-crumb"))).toBe(true);
  });

  test("class, style and attributes fall through to the nav", async () => {
    const { container } = await render(EBreadcrumb, {
      props: { items },
      attrs: { class: "mine", "data-x": "1", "aria-label": "You are here" },
    });
    const nav = container.querySelector("nav")!;
    expect(nav.classList.contains("mine")).toBe(true);
    expect(nav.classList.contains("e-crumbs")).toBe(true);
    expect(nav.getAttribute("data-x")).toBe("1");
    await expect.element(page.getByRole("navigation", { name: "You are here" })).toBeVisible();
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(EBreadcrumb, { props: { items } });
    await expectNoViolations(container);
    const single = await render(EBreadcrumb, { props: { items: [{ label: "Home" }] } });
    await expectNoViolations(single.container);
  });
});
