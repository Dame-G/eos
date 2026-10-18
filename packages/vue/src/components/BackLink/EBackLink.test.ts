import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EBackLink from "./EBackLink.vue";
import { expectNoViolations } from "../../../test/axe.js";

const FakeRouterLink = defineComponent({
  props: { to: { type: String, required: true } },
  setup:
    (props, { slots }) =>
    () =>
      h("a", { href: `/app${props.to}`, "data-router": "" }, slots.default?.()),
});

describe("EBackLink", () => {
  test("is a link with an arrow and the words from the slot", async () => {
    const { container } = await render(EBackLink, {
      props: { href: "/statements" },
      slots: { default: "Back to statements" },
    });
    const a = container.querySelector("a")!;
    expect(a.className).toBe("e-backlink");
    expect(a.getAttribute("href")).toBe("/statements");
    expect(a.querySelector(".e-icon")).not.toBeNull();
    await expect.element(page.getByRole("link", { name: "Back to statements", exact: true })).toBeVisible();
  });

  test("says Back and goes to # when given nothing", async () => {
    const { container } = await render(EBackLink);
    await expect.element(page.getByRole("link", { name: "Back", exact: true })).toBeVisible();
    expect(container.querySelector("a")!.getAttribute("href")).toBe("#");
  });

  test("is as tall as a control", async () => {
    const { container } = await render(EBackLink);
    expect(container.querySelector("a")!.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  });

  test("a click reaches the consumer's listener", async () => {
    let clicks = 0;
    await render(EBackLink, {
      attrs: { onClick: (e: Event) => (e.preventDefault(), clicks++) },
      slots: { default: "Go back" },
    });
    await page.getByRole("link", { name: "Go back" }).click();
    expect(clicks).toBe(1);
  });

  test("keyboard: Tab reaches it and Enter fires the listener", async () => {
    let clicks = 0;
    await render(EBackLink, {
      attrs: { onClick: (e: Event) => (e.preventDefault(), clicks++) },
      slots: { default: "Go back" },
    });
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("Go back");
    await userEvent.keyboard("{Enter}");
    expect(clicks).toBe(1);
  });

  test("linkComponent renders a router link from `to`, with no href set over it", async () => {
    const { container } = await render(EBackLink, {
      props: { linkComponent: FakeRouterLink },
      attrs: { to: "/statements", class: "mine" },
      slots: { default: "Back to statements" },
    });
    const a = container.querySelector("a")!;
    expect(a.hasAttribute("data-router")).toBe(true);
    expect(a.getAttribute("href")).toBe("/app/statements");
    expect(a.classList.contains("e-backlink")).toBe(true);
    expect(a.classList.contains("mine")).toBe(true);
    expect(a.querySelector(".e-icon")).not.toBeNull();
  });

  test("the arrow mirrors in right-to-left text", async () => {
    const { container } = await render(EBackLink, { attrs: { dir: "rtl" } });
    const icon = container.querySelector(".e-icon")!;
    expect(icon.classList.contains("e-icon--dir")).toBe(true);
    expect(getComputedStyle(icon).transform).not.toBe("none");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(EBackLink, { props: { href: "/s" }, slots: { default: "Back to statements" } });
    await expectNoViolations(container);
  });
});
