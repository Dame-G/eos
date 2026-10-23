import { describe, expect, test } from "vitest";
import { defineComponent, h, ref, markRaw } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ENavList from "./ENavList.vue";
import { expectNoViolations } from "../../../test/axe.js";

const items = [
  { label: "Home", icon: "home", href: "/" },
  { label: "Pay a bill", icon: "card", href: "/pay", count: 2, current: true },
  { label: "Statements and receipts", href: "/statements" },
];

const FakeRouterLink = markRaw(
  defineComponent({
    props: { to: { type: String, required: true } },
    setup:
      (props, { slots }) =>
      () =>
        h("a", { href: `/app${props.to}`, "data-router": "" }, slots.default?.()),
  }),
);

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
    // The page is also marked by an edge with a thicker bottom (the slab), not by colour alone.
    expect(cs.borderTopColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(parseFloat(cs.borderBottomWidth)).toBeGreaterThan(parseFloat(cs.borderTopWidth));
  });

  test("rows are control height and the count is a pill", async () => {
    const { container } = await render(ENavList, { props: { items } });
    expect(container.querySelector("a")!.getBoundingClientRect().height).toBe(48);
    expect(container.querySelectorAll(".e-nav-count").length).toBe(1);
    expect(container.querySelector(".e-nav-count")!.textContent).toBe("2");
    expect(container.querySelectorAll(".e-nav-item .e-icon").length).toBe(2);
  });

  test("an item without a destination is plain text, not a link to #", async () => {
    const { container } = await render(ENavList, { props: { items: [{ label: "Home" }] } });
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("li > span.e-nav-item")!.textContent).toBe("Home");
  });

  test("countLabel gives the count its meaning for screen readers", async () => {
    await render(ENavList, {
      props: { items: [{ label: "Pay a bill", href: "/pay", count: 2, countLabel: "2 bills to pay" }] },
    });
    await expect.element(page.getByRole("link", { name: /Pay a bill\s*,\s*2 bills to pay/ })).toBeVisible();
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
    await expectNoViolations(container);
  });

  test("horizontal lays the links in a row, outlining the current page", async () => {
    const { container } = await render(ENavList, { props: { items, orientation: "horizontal" } });
    const nav = container.querySelector("nav")!;
    expect(nav.classList.contains("e-nav--horizontal")).toBe(true);
    expect(getComputedStyle(container.querySelector("ul")!).display).toBe("flex");
    const links = [...container.querySelectorAll<HTMLElement>("a")];
    expect(links[0]!.getBoundingClientRect().top).toBe(links[1]!.getBoundingClientRect().top);
    expect(links[0]!.getBoundingClientRect().height).toBe(48);
    const current = getComputedStyle(container.querySelector("[aria-current]")!);
    expect(current.fontWeight).toBe("600");
    expect(current.borderTopColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(parseFloat(current.borderBottomWidth)).toBeGreaterThan(parseFloat(current.borderTopWidth));
    await expectNoViolations(container);
  });

  test("vertical is the default", async () => {
    const { container } = await render(ENavList, { props: { items } });
    expect(container.querySelector("nav")!.classList.contains("e-nav--horizontal")).toBe(false);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ENavList, { props: { items } });
    await expectNoViolations(container);
  });

  const tree = [
    { label: "Home", href: "/" },
    {
      label: "Billing",
      icon: "card",
      children: [
        { label: "Pay a bill", href: "/pay" },
        { label: "Statements", href: "/statements" },
        { label: "Old invoices", href: "/old", disabled: true },
      ],
    },
    { label: "Archive", href: "/archive", disabled: true },
  ];

  test("a disabled item is dimmed, not a link and skipped by Tab", async () => {
    const { container } = await render(ENavList, { props: { items: tree.filter((i) => !i.children) } });
    container.classList.add("e-root");
    const off = container.querySelector<HTMLElement>("[aria-disabled=true]")!;
    expect(off.getAttribute("role")).toBe("link");
    expect(off.hasAttribute("href")).toBe(false);
    expect(getComputedStyle(off).cursor).toBe("not-allowed");
    await userEvent.tab();
    expect(document.activeElement!.textContent).toContain("Home");
    await userEvent.tab();
    expect(document.activeElement!.closest("nav")).toBeNull();
  });

  test("an item with children is a group that opens and closes, from the keyboard too", async () => {
    const { container } = await render(ENavList, { props: { items: tree } });
    const group = container.querySelector<HTMLDetailsElement>("details.e-nav-group")!;
    expect(group.open).toBe(false);
    const summary = group.querySelector("summary")!;
    expect(summary.classList.contains("e-nav-item")).toBe(true);
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(summary);
    await userEvent.keyboard("{Enter}");
    expect(group.open).toBe(true);
    await expect.poll(() => group.getBoundingClientRect().height).toBeGreaterThan(200);
    await userEvent.tab();
    expect(document.activeElement!.textContent).toContain("Pay a bill");
    await userEvent.tab();
    expect(document.activeElement!.textContent).toContain("Statements");
    await userEvent.tab();
    expect(document.activeElement!.closest("nav")).toBeNull();
    summary.focus();
    await userEvent.keyboard(" ");
    expect(group.open).toBe(false);
  });

  test("a group that holds the current page starts open and is marked, and open opens one", async () => {
    const withCurrent = tree.map((i) =>
      i.children ? { ...i, children: i.children.map((c) => ({ ...c, current: c.href === "/pay" })) } : i,
    );
    const { container } = await render(ENavList, { props: { items: withCurrent } });
    const group = container.querySelector<HTMLDetailsElement>("details")!;
    expect(group.open).toBe(true);
    expect(group.querySelector("summary")!.hasAttribute("data-current")).toBe(true);
    expect(group.querySelector("summary")!.hasAttribute("aria-current")).toBe(false);
    expect(container.querySelectorAll("[aria-current=page]").length).toBe(1);
    const opened = await render(ENavList, {
      props: { items: tree.map((i) => (i.children ? { ...i, open: true } : i)) },
    });
    expect(opened.container.querySelector<HTMLDetailsElement>("details")!.open).toBe(true);
  });

  test("a disabled group does not open", async () => {
    const { container } = await render(ENavList, {
      props: { items: [{ label: "Locked", disabled: true, children: [{ label: "Inside", href: "/in" }] }] },
    });
    const summary = container.querySelector("summary")!;
    expect(summary.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(summary);
    expect(container.querySelector("details")!.open).toBe(false);
  });

  test("isCurrent marks the current page for items that do not say, and current wins over it", async () => {
    const path = ref("/pay");
    const { container } = await render(
      defineComponent({
        render: () =>
          h(ENavList, {
            items: [
              { label: "Home", href: "/" },
              { label: "Pay a bill", href: "/pay" },
              { label: "Forms", href: "/forms", current: false },
            ],
            isCurrent: (item: { href?: string }) => item.href === path.value || item.href === "/forms",
          }),
      }),
    );
    const current = () => [...container.querySelectorAll("[aria-current=page]")].map((a) => a.textContent!.trim());
    expect(current()).toEqual(["Pay a bill"]);
    path.value = "/";
    await expect.poll(current).toEqual(["Home"]);
  });

  test("a group opens by itself when isCurrent moves into it", async () => {
    const path = ref("/");
    const { container } = await render(
      defineComponent({
        render: () => h(ENavList, { items: tree, isCurrent: (item: { href?: string }) => item.href === path.value }),
      }),
    );
    const group = container.querySelector<HTMLDetailsElement>("details")!;
    expect(group.open).toBe(false);
    path.value = "/statements";
    await expect.poll(() => group.open).toBe(true);
  });

  test("nested groups have no accessibility violations", async () => {
    const { container } = await render(ENavList, {
      props: { items: tree.map((i) => (i.children ? { ...i, open: true } : i)) },
    });
    await expectNoViolations(container);
  });
});
