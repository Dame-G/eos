import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeEmptyState from "./AeEmptyState.vue";
import AeButton from "../Button/AeButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeEmptyState", () => {
  test("shows the icon, title, text and action in that order", async () => {
    const { container } = await render(AeEmptyState, {
      props: { icon: "file", title: "No statements yet" },
      slots: {
        default: "They appear here after your first visit.",
        action: () => h(AeButton, null, () => "Book a visit"),
      },
    });
    const el = container.querySelector(".ae-empty")!;
    expect([...el.children].map((c) => c.className.split(" ")[0])).toEqual([
      "ae-empty-icon",
      "ae-empty-title",
      "ae-empty-text",
      "ae-btn",
    ]);
    expect(el.querySelector(".ae-empty-icon svg")).not.toBeNull();
    await expect.element(page.getByRole("button", { name: "Book a visit" })).toBeVisible();
  });

  test("the title is an h3 by default and headingLevel changes it", async () => {
    const a = await render(AeEmptyState, { props: { title: "x" } });
    expect(a.container.querySelector("h3.ae-empty-title")).not.toBeNull();
    const b = await render(AeEmptyState, { props: { title: "x", headingLevel: 2 } });
    expect(b.container.querySelector("h2.ae-empty-title")).not.toBeNull();
  });

  test("without icon, text or action only the title is rendered", async () => {
    const { container } = await render(AeEmptyState, { props: { title: "Nothing here" } });
    expect(container.querySelector(".ae-empty")!.children.length).toBe(1);
  });

  test("has a dashed outline, and bare removes it", async () => {
    const a = await render(AeEmptyState, { props: { title: "x" } });
    a.container.classList.add("ae-root");
    const outlined = getComputedStyle(a.container.querySelector(".ae-empty")!);
    expect(outlined.borderTopStyle).toBe("dashed");
    const b = await render(AeEmptyState, { props: { title: "x", bare: true } });
    b.container.classList.add("ae-root");
    const bare = b.container.querySelector(".ae-empty")!;
    expect(bare.classList.contains("ae-empty--bare")).toBe(true);
    expect(getComputedStyle(bare).borderTopWidth).toBe("0px");
  });

  test("the content is centred", async () => {
    const { container } = await render(AeEmptyState, { props: { title: "x" }, slots: { default: "Text" } });
    container.classList.add("ae-root");
    expect(getComputedStyle(container.querySelector(".ae-empty")!).textAlign).toBe("center");
  });

  test("class and data attributes fall through to the root", async () => {
    const { container } = await render(AeEmptyState, {
      props: { title: "x" },
      attrs: { class: "mine", "data-x": "1" },
    });
    const el = container.querySelector<HTMLElement>(".ae-empty")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.dataset.x).toBe("1");
  });

  test("axe finds nothing, outlined or bare", async () => {
    for (const bare of [false, true]) {
      const { container } = await render(AeEmptyState, {
        props: { icon: "search", title: "No results", bare },
        slots: { default: "Try another word.", action: () => h(AeButton, { variant: "outline" }, () => "Clear") },
      });
      container.classList.add("ae-root");
      await expectNoViolations(container);
    }
  });
});
