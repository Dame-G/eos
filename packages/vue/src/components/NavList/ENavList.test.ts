import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ENavList from "./ENavList.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { label: "Home", icon: "home", href: "/" },
  { label: "Pay a bill", icon: "card", href: "/pay", count: 2, current: true },
  { label: "Statements and receipts", href: "/statements" },
];

const FakeRouterLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup:
    (props, { slots }) =>
    () =>
      h("a", { href: `/app${props.to}`, "data-router": "" }, slots.default?.()),
});

describe("ENavList", () => {
  test("is a navigation landmark named Main by default, or by the label prop", async () => {
    await render(ENavList, { props: { items } });
    await expect.element(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await render(ENavList, { props: { items, label: "Account" } });
    await expect.element(page.getByRole("navigation", { name: "Account" })).toBeVisible();
  });

  test("a list of links with their hrefs", async () => {
    const { container } = await render(ENavList, { props: { items } });
    expect(container.querySelectorAll("ul > li > a.e-nav-item").length).toBe(3);
    expect([...container.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual([
      "/",
      "/pay",
      "/statements",
    ]);
  });

  test("only the current page has aria-current=page, and it is not shown by colour alone", async () => {
    const { container } = await render(ENavList, { props: { items } });
    const current = container.querySelectorAll("[aria-current]");
    expect(current.length).toBe(1);
    expect(current[0]!.getAttribute("aria-current")).toBe("page");
    expect(current[0]!.textContent).toContain("Pay a bill");
    const cs = getComputedStyle(current[0]!);
    expect(cs.fontWeight).toBe("600");
    expect(parseFloat(cs.borderTopWidth)).toBeGreaterThan(parseFloat(cs.borderBottomWidth));
  });

  test("rows are control height and the count is a pill", async () => {
    const { container } = await render(ENavList, { props: { items } });
    expect(container.querySelector("a")!.getBoundingClientRect().height).toBe(48);
    expect(container.querySelectorAll(".e-nav-count").length).toBe(1);
    expect(container.querySelector(".e-nav-count")!.textContent).toBe("2");
    expect(container.querySelectorAll(".e-nav-item .e-icon").length).toBe(2);
  });

  test("a link without an href goes to #", async () => {
    const { container } = await render(ENavList, { props: { items: [{ label: "Home" }] } });
    expect(container.querySelector("a")!.getAttribute("href")).toBe("#");
  });

  test("keyboard: Tab visits each link in order", async () => {
    await render(ENavList, { props: { items } });
    for (const label of ["Home", "Pay a bill2", "Statements and receipts"]) {
      await userEvent.tab();
      expect(document.activeElement!.textContent!.replace(/\s+/g, " ").trim()).toBe(label);
    }
  });

  test("linkComponent renders router links from `to`, and keeps aria-current", async () => {
    const { container } = await render(ENavList, {
      props: {
        linkComponent: FakeRouterLink,
        items: [
          { label: "Home", to: "/" },
          { label: "Forms", to: "/forms", current: true },
        ],
      },
    });
    const links = [...container.querySelectorAll<HTMLAnchorElement>("a[data-router]")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["/app/", "/app/forms"]);
    expect(links[1]!.getAttribute("aria-current")).toBe("page");
    expect(links[0]!.hasAttribute("aria-current")).toBe(false);
    expect(links.every((a) => a.classList.contains("e-nav-item"))).toBe(true);
  });

  test("class, style and attributes fall through to the nav", async () => {
    const { container } = await render(ENavList, { props: { items }, attrs: { class: "mine", "data-x": "1" } });
    const nav = container.querySelector("nav")!;
    expect(nav.classList.contains("mine")).toBe(true);
    expect(nav.getAttribute("data-x")).toBe("1");
  });

  test("sections: a heading names its list, and a section without a label has no heading", async () => {
    const { container } = await render(ENavList, {
      props: {
        dense: true,
        sections: [
          { items: [{ label: "Overview", href: "/" }] },
          { label: "Layers", items: [{ label: "Blocks", href: "/blocks" }] },
        ],
      },
    });
    expect(container.querySelectorAll("p.e-nav-heading").length).toBe(1);
    expect(container.querySelectorAll("ul").length).toBe(2);
    const list = container.querySelectorAll("ul")[1]!;
    expect(container.querySelector(`#${CSS.escape(list.getAttribute("aria-labelledby")!)}`)?.textContent).toBe(
      "Layers",
    );
    expect(container.querySelector("nav")!.classList.contains("e-nav--dense")).toBe(true);
    await expectNoViolations(container);
  });

  test("horizontal lays the links in a row with a bar under the current page", async () => {
    const { container } = await render(ENavList, { props: { items, orientation: "horizontal" } });
    const nav = container.querySelector("nav")!;
    expect(nav.classList.contains("e-nav--horizontal")).toBe(true);
    expect(getComputedStyle(container.querySelector("ul")!).display).toBe("flex");
    const links = [...container.querySelectorAll<HTMLElement>("a")];
    expect(links[0]!.getBoundingClientRect().top).toBe(links[1]!.getBoundingClientRect().top);
    expect(links[0]!.getBoundingClientRect().height).toBe(40);
    const current = getComputedStyle(container.querySelector("[aria-current]")!);
    expect(current.fontWeight).toBe("600");
    expect(current.boxShadow).toContain("3px");
    expect(getComputedStyle(links[0]!).boxShadow).toContain("2px");
    await expectNoViolations(container);
  });

  test("horizontal composes with dense for a shorter row, and vertical is the default", async () => {
    const { container } = await render(ENavList, { props: { items, orientation: "horizontal", dense: true } });
    expect(container.querySelector("a")!.getBoundingClientRect().height).toBe(36);
    const other = await render(ENavList, { props: { items } });
    expect(other.container.querySelector("nav")!.classList.contains("e-nav--horizontal")).toBe(false);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ENavList, { props: { items } });
    await expectNoViolations(container);
  });
});
