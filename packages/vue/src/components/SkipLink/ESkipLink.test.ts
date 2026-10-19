import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESkipLink from "./ESkipLink.vue";
import { expectNoViolations } from "../../../test/axe.js";

const Page = defineComponent({
  props: { href: { type: String, default: undefined } },
  setup: (props) => () =>
    h("div", { style: "position: relative" }, [
      h(ESkipLink, props.href ? { href: props.href } : null),
      h("nav", [h("a", { href: "/one" }, "One"), h("a", { href: "/two" }, "Two")]),
      h("main", { id: props.href ? props.href.slice(1) : "main", tabindex: -1 }, [h("button", "Inside")]),
    ]),
});

describe("ESkipLink", () => {
  test("is a link to #main with the default words", async () => {
    const { container } = await render(ESkipLink);
    const a = container.querySelector("a")!;
    expect(a.className).toBe("e-skip");
    expect(a.getAttribute("href")).toBe("#main");
    await expect.element(page.getByRole("link", { name: "Skip to main content" })).toBeInTheDocument();
  });

  test("href and the text can change", async () => {
    const { container } = await render(ESkipLink, {
      props: { href: "#content" },
      slots: { default: "Jump to the form" },
    });
    expect(container.querySelector("a")!.getAttribute("href")).toBe("#content");
    await expect.element(page.getByRole("link", { name: "Jump to the form" })).toBeInTheDocument();
  });

  test("is off screen until it has keyboard focus, then appears at the top", async () => {
    const { container } = await render(Page);
    const a = container.querySelector<HTMLElement>(".e-skip")!;
    expect(a.getBoundingClientRect().bottom).toBeLessThan(0);
    await userEvent.tab();
    expect(document.activeElement).toBe(a);
    const box = a.getBoundingClientRect();
    expect(box.top).toBeGreaterThanOrEqual(0);
    expect(box.height).toBe(48);
    expect(getComputedStyle(a).outlineStyle).toBe("solid");
  });

  test("keyboard: it is the first tab stop, and Enter moves focus to the main content", async () => {
    const { container } = await render(Page);
    await userEvent.tab();
    expect(document.activeElement).toBe(container.querySelector(".e-skip"));
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(container.querySelector("main"));
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("Inside");
  });

  test("works for a custom target", async () => {
    const { container } = await render(Page, { props: { href: "#content" } });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(container.querySelector("#content"));
  });

  test("attributes fall through to the link", async () => {
    const { container } = await render(ESkipLink, { attrs: { class: "mine", "data-x": "1" } });
    const a = container.querySelector("a")!;
    expect(a.classList.contains("mine")).toBe(true);
    expect(a.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations, focused or not", async () => {
    const { container } = await render(Page);
    await expectNoViolations(container);
    await userEvent.tab();
    await expectNoViolations(container);
  });
});
