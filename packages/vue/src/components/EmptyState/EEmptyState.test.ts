import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EEmptyState from "./EEmptyState.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EEmptyState", () => {
  test("shows the icon, title, text and action in that order", async () => {
    const { container } = await render(EEmptyState, {
      props: { icon: "file", title: "No statements yet" },
      slots: {
        default: "They appear here after your first visit.",
        action: () => h(EButton, null, () => "Book a visit"),
      },
    });
    const el = container.querySelector(".e-empty")!;
    expect([...el.children].map((c) => c.className.split(" ")[0])).toEqual([
      "e-empty-icon",
      "e-empty-title",
      "e-empty-text",
      "e-btn",
    ]);
    expect(el.querySelector(".e-empty-icon svg")).not.toBeNull();
    await expect.element(page.getByRole("button", { name: "Book a visit" })).toBeVisible();
  });

  test("the title is an h3 by default and headingLevel changes it", async () => {
    const a = await render(EEmptyState, { props: { title: "x" } });
    expect(a.container.querySelector("h3.e-empty-title")).not.toBeNull();
    const b = await render(EEmptyState, { props: { title: "x", headingLevel: 2 } });
    expect(b.container.querySelector("h2.e-empty-title")).not.toBeNull();
  });

  test("without icon, text or action only the title is rendered", async () => {
    const { container } = await render(EEmptyState, { props: { title: "Nothing here" } });
    expect(container.querySelector(".e-empty")!.children.length).toBe(1);
  });

  test("has a dashed outline, and bare removes it", async () => {
    const a = await render(EEmptyState, { props: { title: "x" } });
    a.container.classList.add("e-root");
    const outlined = getComputedStyle(a.container.querySelector(".e-empty")!);
    expect(outlined.borderTopStyle).toBe("dashed");
    const b = await render(EEmptyState, { props: { title: "x", bare: true } });
    b.container.classList.add("e-root");
    const bare = b.container.querySelector(".e-empty")!;
    expect(bare.classList.contains("e-empty--bare")).toBe(true);
    expect(getComputedStyle(bare).borderTopWidth).toBe("0px");
  });

  test("the content is centred", async () => {
    const { container } = await render(EEmptyState, { props: { title: "x" }, slots: { default: "Text" } });
    container.classList.add("e-root");
    expect(getComputedStyle(container.querySelector(".e-empty")!).textAlign).toBe("center");
  });

  test("class and data attributes fall through to the root", async () => {
    const { container } = await render(EEmptyState, {
      props: { title: "x" },
      attrs: { class: "mine", "data-x": "1" },
    });
    const el = container.querySelector<HTMLElement>(".e-empty")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.dataset.x).toBe("1");
  });

  test("axe finds nothing, outlined or bare", async () => {
    for (const bare of [false, true]) {
      const { container } = await render(EEmptyState, {
        props: { icon: "search", title: "No results", bare },
        slots: { default: "Try another word.", action: () => h(EButton, { variant: "outline" }, () => "Clear") },
      });
      container.classList.add("e-root");
      await expectNoViolations(container);
    }
  });
});
