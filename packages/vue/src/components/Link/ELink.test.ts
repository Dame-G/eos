import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ELink from "./ELink.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("ELink", () => {
  test("is a link named by its text", async () => {
    const { container } = await render(ELink, {
      props: { href: "/statements" },
      slots: { default: "All statements" },
    });
    await expect.element(page.getByRole("link", { name: "All statements" })).toBeVisible();
    const a = container.querySelector("a")!;
    expect(a.className).toBe("e-link");
    expect(a.getAttribute("href")).toBe("/statements");
    expect(a.hasAttribute("target")).toBe(false);
    expect(a.hasAttribute("rel")).toBe(false);
  });

  test("external opens a new tab without a referrer", async () => {
    const { container } = await render(ELink, {
      props: { href: "https://example.com", external: true },
      slots: { default: "Help" },
    });
    const a = container.querySelector("a")!;
    expect(a.target).toBe("_blank");
    expect(a.rel).toBe("noreferrer");
  });

  test("is underlined and turns ink on hover", async () => {
    const { container } = await render(ELink, { props: { href: "#x" }, slots: { default: "Go" } });
    const a = container.querySelector("a")!;
    expect(getComputedStyle(a).textDecorationLine).toBe("underline");
    const before = getComputedStyle(a).color;
    await page.getByRole("link", { name: "Go" }).hover();
    expect(getComputedStyle(a).color).not.toBe(before);
  });

  test("is reached with Tab and activated with Enter", async () => {
    let clicks = 0;
    const { container } = await render(ELink, {
      props: { href: "#x" },
      attrs: { onClick: (e: Event) => (e.preventDefault(), clicks++) },
      slots: { default: "Go" },
    });
    await userEvent.tab();
    expect(document.activeElement).toBe(container.querySelector("a"));
    await userEvent.keyboard("{Enter}");
    expect(clicks).toBe(1);
  });

  test("shows a focus ring when focused with the keyboard", async () => {
    const { container } = await render(ELink, { props: { href: "#x" }, slots: { default: "Go" } });
    await userEvent.tab();
    const style = getComputedStyle(container.querySelector("a")!);
    expect(style.outlineStyle).toBe("solid");
    expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
  });

  test("attributes fall through to the anchor", async () => {
    const { container } = await render(ELink, {
      props: { href: "#x" },
      attrs: { "aria-label": "Open the list", "data-testid": "l" },
      slots: { default: "Go" },
    });
    const a = container.querySelector("a")!;
    expect(a.getAttribute("aria-label")).toBe("Open the list");
    expect(a.getAttribute("data-testid")).toBe("l");
  });

  test("icon puts a decorative icon before the text, by name or component", async () => {
    const Mark = defineComponent({
      render: () => h("svg", { viewBox: "0 0 16 16" }, [h("path", { d: "M0 0h16v16H0z" })]),
    });
    const named = await render(ELink, { props: { href: "#x", icon: "search" }, slots: { default: "Find" } });
    const a = named.container.querySelector("a")!;
    expect(a.classList.contains("e-link--icon")).toBe(true);
    expect(a.firstElementChild!.getAttribute("aria-hidden")).toBe("true");
    expect(a.textContent!.trim()).toBe("Find");
    await expect.element(page.getByRole("link", { name: "Find" })).toBeVisible();
    const custom = await render(ELink, {
      props: { href: "https://example.com", external: true, icon: Mark },
      slots: { default: "Repo" },
    });
    const b = custom.container.querySelector("a")!;
    expect(b.querySelector("svg.e-icon path")).not.toBeNull();
    expect(b.target).toBe("_blank");
    expect(b.rel).toBe("noreferrer");
    expect(getComputedStyle(b).display).toBe("inline-flex");
    await expectNoViolations(custom.container);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(ELink, { props: { href: "#x", external: true }, slots: { default: "Help" } });
    await expectNoViolations(container);
  });
});
