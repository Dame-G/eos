import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EAppFooter from "./EAppFooter.vue";
import { expectNoViolations } from "../../../test/axe.js";

const slots = {
  default: () => [
    h("p", "© 2026 OpenPractice"),
    h("a", { href: "/privacy" }, "Privacy"),
    h("a", { href: "/terms" }, "Terms"),
  ],
};

describe("EAppFooter", () => {
  test("is the contentinfo landmark holding the content in the page's column", async () => {
    const { container } = await render(EAppFooter, { slots });
    await expect.element(page.getByRole("contentinfo")).toBeVisible();
    await expect.element(page.getByRole("link", { name: "Privacy" })).toBeVisible();
    expect(container.querySelector("footer.e-appfooter > .e-shell-inner")).not.toBeNull();
    expect(getComputedStyle(container.querySelector(".e-shell-inner")!).maxWidth).toBe("1152px");
  });

  test("keyboard: Tab visits the links", async () => {
    await render(EAppFooter, { slots });
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("Privacy");
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("Terms");
  });

  test("class and attributes fall through to the footer", async () => {
    const { container } = await render(EAppFooter, { slots, attrs: { class: "mine", "data-x": "1" } });
    const footer = container.querySelector("footer")!;
    expect(footer.classList.contains("mine")).toBe(true);
    expect(footer.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(EAppFooter, { slots });
    await expectNoViolations(container);
  });

  test("a link in the footer shows a focus ring from the keyboard", async () => {
    const { container } = await render(EAppFooter, { slots });
    container.classList.add("e-root");
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("href")).toBe("/privacy");
    expect(document.activeElement!.closest("footer")).not.toBeNull();
  });
});
