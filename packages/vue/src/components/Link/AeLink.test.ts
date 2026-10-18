import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeLink from "./AeLink.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeLink", () => {
  test("is a link named by its text", async () => {
    const { container } = await render(AeLink, {
      props: { href: "/statements" },
      slots: { default: "All statements" },
    });
    await expect.element(page.getByRole("link", { name: "All statements" })).toBeVisible();
    const a = container.querySelector("a")!;
    expect(a.className).toBe("ae-link");
    expect(a.getAttribute("href")).toBe("/statements");
    expect(a.hasAttribute("target")).toBe(false);
    expect(a.hasAttribute("rel")).toBe(false);
  });

  test("external opens a new tab without a referrer", async () => {
    const { container } = await render(AeLink, {
      props: { href: "https://example.com", external: true },
      slots: { default: "Help" },
    });
    const a = container.querySelector("a")!;
    expect(a.target).toBe("_blank");
    expect(a.rel).toBe("noreferrer");
  });

  test("is underlined and turns ink on hover", async () => {
    const { container } = await render(AeLink, { props: { href: "#x" }, slots: { default: "Go" } });
    const a = container.querySelector("a")!;
    expect(getComputedStyle(a).textDecorationLine).toBe("underline");
    const before = getComputedStyle(a).color;
    await page.getByRole("link", { name: "Go" }).hover();
    expect(getComputedStyle(a).color).not.toBe(before);
  });

  test("is reached with Tab and activated with Enter", async () => {
    let clicks = 0;
    const { container } = await render(AeLink, {
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
    const { container } = await render(AeLink, { props: { href: "#x" }, slots: { default: "Go" } });
    await userEvent.tab();
    const style = getComputedStyle(container.querySelector("a")!);
    expect(style.outlineStyle).toBe("solid");
    expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
  });

  test("attributes fall through to the anchor", async () => {
    const { container } = await render(AeLink, {
      props: { href: "#x" },
      attrs: { "aria-label": "Open the list", "data-testid": "l" },
      slots: { default: "Go" },
    });
    const a = container.querySelector("a")!;
    expect(a.getAttribute("aria-label")).toBe("Open the list");
    expect(a.getAttribute("data-testid")).toBe("l");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(AeLink, { props: { href: "#x", external: true }, slots: { default: "Help" } });
    await expectNoViolations(container);
  });
});
