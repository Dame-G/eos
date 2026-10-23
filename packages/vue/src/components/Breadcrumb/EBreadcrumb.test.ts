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

  test("each link has a 44px hit area without adding height to the row", async () => {
    const { container } = await render(EBreadcrumb, { props: { items } });
    const link = container.querySelector("a.e-crumb")!;
    expect(parseFloat(getComputedStyle(link, "::after").height)).toBeGreaterThanOrEqual(44);
    expect(link.getBoundingClientRect().height).toBeLessThan(32);
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

  const long = [
    { label: "Home", href: "/" },
    { label: "Account", href: "/account" },
    { label: "Billing", href: "/billing" },
    { label: "Statements", href: "/statements" },
    { label: "Visit on Oct 2" },
  ];

  test("label names the navigation", async () => {
    await render(EBreadcrumb, { props: { items, label: "Trail" } });
    await expect.element(page.getByRole("navigation", { name: "Trail" })).toBeVisible();
  });

  test("maxItems keeps the first level and the last ones, with a button for the rest", async () => {
    const { container } = await render(EBreadcrumb, { props: { items: long, maxItems: 3 } });
    expect([...container.querySelectorAll("li")].map((li) => li.textContent!.trim())).toEqual([
      "Home",
      "…",
      "Statements",
      "Visit on Oct 2",
    ]);
    await expect.element(page.getByRole("button", { name: "Show full path" })).toBeVisible();
    expect(container.querySelectorAll("[aria-current]").length).toBe(1);
  });

  test("a path that fits is not shortened, and maxItems under 2 does nothing", async () => {
    const { container } = await render(EBreadcrumb, { props: { items, maxItems: 3 } });
    expect(container.querySelector(".e-crumb-more")).toBeNull();
    const other = await render(EBreadcrumb, { props: { items: long, maxItems: 1 } });
    expect(other.container.querySelector(".e-crumb-more")).toBeNull();
  });

  test("the button shows the whole path and focus moves to the first level it brought back", async () => {
    const { container } = await render(EBreadcrumb, { props: { items: long, maxItems: 3 } });
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement!.classList.contains("e-crumb-more")).toBe(true);
    await userEvent.keyboard("{Enter}");
    expect(container.querySelectorAll("ol > li").length).toBe(5);
    expect(document.activeElement!.textContent!.trim()).toBe("Account");
    await userEvent.tab();
    expect(document.activeElement!.textContent!.trim()).toBe("Billing");
  });

  test("the collapsed path has no accessibility violations", async () => {
    const { container } = await render(EBreadcrumb, { props: { items: long, maxItems: 3 } });
    await expectNoViolations(container);
  });
});
