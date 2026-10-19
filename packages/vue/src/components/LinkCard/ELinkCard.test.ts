import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ELinkCard from "./ELinkCard.vue";
import EGrid from "../Grid/EGrid.vue";
import { expectNoViolations } from "../../../test/axe.js";

const FakeRouterLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup:
    (props, { slots }) =>
    () =>
      h("a", { href: `/app${props.to}`, "data-router": "" }, slots.default?.()),
});

describe("ELinkCard", () => {
  test("is a heading holding one link named by the title, with the description beside it", async () => {
    const { container } = await render(ELinkCard, {
      props: { href: "/components/Dialog", title: "EDialog", description: "A modal question." },
    });
    await expect.element(page.getByRole("heading", { level: 3, name: "EDialog" })).toBeVisible();
    await expect.element(page.getByRole("link", { name: "EDialog" })).toBeVisible();
    expect(container.querySelectorAll("a").length).toBe(1);
    expect(container.querySelector("h3 > a")!.getAttribute("href")).toBe("/components/Dialog");
    await expect.element(page.getByText("A modal question.")).toBeVisible();
  });

  test("headingLevel changes the heading element, and kicker adds a label above it", async () => {
    const { container } = await render(ELinkCard, {
      props: { href: "#x", title: "Card", headingLevel: 2, kicker: "Containers" },
    });
    expect(container.querySelector("h2")).not.toBeNull();
    expect(container.querySelector("h3")).toBeNull();
    expect(container.querySelector(".e-kicker")!.textContent).toBe("Containers");
  });

  test("external opens a new tab without a referrer", async () => {
    const { container } = await render(ELinkCard, {
      props: { href: "https://example.com", title: "Help", external: true },
    });
    const a = container.querySelector("a")!;
    expect(a.target).toBe("_blank");
    expect(a.rel).toBe("noreferrer");
  });

  test("as renders the card as another element, such as li in a list", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EGrid, { as: "ul" }, () => [
            h(ELinkCard, { as: "li", href: "#a", title: "A" }),
            h(ELinkCard, { as: "li", href: "#b", title: "B" }),
          ]),
      }),
    );
    expect(container.querySelectorAll("ul > li.e-linkcard").length).toBe(2);
    expect(page.getByRole("listitem").elements().length).toBe(2);
    await expectNoViolations(container);
  });

  test("the link's overlay covers the whole card, so a click anywhere follows it", async () => {
    let clicks = 0;
    const { container } = await render(ELinkCard, {
      props: { href: "#x", title: "Card", description: "Text" },
      attrs: { onClick: (e: Event) => (e.preventDefault(), clicks++), style: "min-height: 6rem" },
    });
    const card = container.querySelector<HTMLElement>(".e-linkcard")!;
    const link = container.querySelector("a")!;
    const after = getComputedStyle(link, "::after");
    expect(after.position).toBe("absolute");
    expect(getComputedStyle(card).position).toBe("relative");
    const box = card.getBoundingClientRect();
    const hit = document.elementFromPoint(box.right - 4, box.bottom - 4);
    expect(hit).toBe(link);
    link.click();
    expect(clicks).toBe(1);
  });

  test("hover draws a border around the card", async () => {
    const { container } = await render(ELinkCard, { props: { href: "#x", title: "Card" } });
    const card = container.querySelector<HTMLElement>(".e-linkcard")!;
    const rest = getComputedStyle(card).boxShadow;
    await page.getByRole("link", { name: "Card" }).hover();
    await expect.poll(() => getComputedStyle(card).boxShadow).not.toBe(rest);
  });

  test("keyboard focus draws the focus ring on the card, not the link", async () => {
    const { container } = await render(ELinkCard, { props: { href: "#x", title: "Card" } });
    await userEvent.tab();
    expect(document.activeElement).toBe(container.querySelector("a"));
    const card = getComputedStyle(container.querySelector(".e-linkcard")!);
    expect(card.outlineStyle).toBe("solid");
    expect(parseFloat(card.outlineWidth)).toBeGreaterThan(0);
    expect(getComputedStyle(container.querySelector("a")!).outlineStyle).toBe("none");
  });

  test("linkComponent renders a router link from `to`", async () => {
    const { container } = await render(ELinkCard, {
      props: { to: "/forms", title: "Forms", linkComponent: FakeRouterLink },
    });
    const a = container.querySelector<HTMLAnchorElement>("a[data-router]")!;
    expect(a.getAttribute("href")).toBe("/app/forms");
    expect(a.classList.contains("e-linkcard-link")).toBe(true);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ELinkCard, {
      props: { href: "#x", title: "EDialog", description: "A modal question.", kicker: "Containers" },
    });
    await expectNoViolations(container);
  });
});
