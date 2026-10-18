import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeSurface from "./AeSurface.vue";
import AeButton from "../Button/AeButton.vue";
import AeGrid from "../Grid/AeGrid.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AeSurface", () => {
  test("is a plain card with the slot inside; tone and pad add modifier classes", async () => {
    const { container } = await render(AeSurface, { props: { pad: "md", tone: "tint" }, slots: { default: "x" } });
    const el = container.querySelector("div")!;
    expect(el.className).toBe("ae-surface ae-surface--tint ae-surface--pad-md");
    expect(el.textContent).toBe("x");
  });

  test("the default tone adds no class, clip adds one", async () => {
    const { container } = await render(AeSurface, { props: { tone: "default", clip: true }, slots: { default: "x" } });
    expect(container.querySelector("div")!.className).toBe("ae-surface ae-surface--clip");
  });

  test("float tone adds its class", async () => {
    const { container } = await render(AeSurface, { props: { tone: "float" }, slots: { default: "x" } });
    expect(container.querySelector(".ae-surface--float")).not.toBeNull();
  });

  test("`as` chooses the element", async () => {
    const { container } = await render(AeSurface, { props: { as: "section" }, slots: { default: "x" } });
    expect(container.querySelector("section.ae-surface")).not.toBeNull();
  });

  test("class, style, id, role and aria attributes fall through to the root", async () => {
    const { container } = await render(AeSurface, {
      props: { as: "section" },
      attrs: {
        class: "mine",
        style: "margin-top: 7px",
        id: "card",
        role: "region",
        "aria-label": "Totals",
        "data-x": "1",
      },
      slots: { default: "x" },
    });
    const el = container.querySelector("section")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.classList.contains("ae-surface")).toBe(true);
    expect(el.style.marginTop).toBe("7px");
    expect(el.id).toBe("card");
    expect(el.getAttribute("aria-label")).toBe("Totals");
    expect(el.dataset.x).toBe("1");
    await expect.element(page.getByRole("region", { name: "Totals" })).toBeVisible();
  });

  test("actions render as a bar after the body, edge to edge", async () => {
    const { container } = await render(AeSurface, {
      props: { pad: "md" },
      slots: { default: "Body", actions: () => h(AeButton, null, () => "Pay") },
    });
    const root = container.querySelector(".ae-surface")!;
    expect(root.className).toBe("ae-surface ae-surface--actions");
    expect(container.querySelectorAll(".ae-surface > .ae-actions--bar").length).toBe(1);
    const body = root.querySelector(":scope > .ae-surface-body")!;
    expect(body.className).toBe("ae-surface-body ae-surface--pad-md");
    expect(body.textContent).toBe("Body");
    expect(root.lastElementChild!.className).toBe("ae-actions ae-actions--bar");
    await expect.element(page.getByRole("button", { name: "Pay" })).toBeVisible();
  });

  test("the bar is a div, and a footer when the surface is an article, section or aside", async () => {
    for (const [as, tag] of [
      ["div", "DIV"],
      ["article", "FOOTER"],
      ["section", "FOOTER"],
      ["aside", "FOOTER"],
    ] as const) {
      const { container } = await render(AeSurface, {
        props: { as },
        slots: { default: "Body", actions: () => h(AeButton, null, () => "Go") },
      });
      expect(container.querySelector(".ae-actions--bar")!.tagName).toBe(tag);
    }
  });

  test("clip does not apply when there is a bar (the bar already clips)", async () => {
    const { container } = await render(AeSurface, {
      props: { clip: true },
      slots: { default: "Body", actions: () => "A" },
    });
    expect(container.querySelector(".ae-surface--clip")).toBeNull();
  });

  test("in a Grid every card takes the tallest height, with the bar level at the foot", async () => {
    const Card = (text: string) =>
      h(
        AeSurface,
        { as: "article", pad: "md" },
        { default: () => text, actions: () => h(AeButton, null, () => "Pay") },
      );
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "560px" } }, [
            h(AeGrid, { min: "15rem", gap: 3 }, () => [
              Card("Short"),
              Card(
                "A much longer body that wraps over several lines because the column is narrow, and then some more words",
              ),
            ]),
          ]),
      }),
    );
    const cards = [...container.querySelectorAll<HTMLElement>(".ae-surface")];
    expect(cards.length).toBe(2);
    expect(Math.round(cards[0]!.getBoundingClientRect().height)).toBe(
      Math.round(cards[1]!.getBoundingClientRect().height),
    );
    const bars = [...container.querySelectorAll<HTMLElement>(".ae-surface > .ae-actions--bar")];
    expect(Math.round(bars[0]!.getBoundingClientRect().bottom)).toBe(
      Math.round(cards[0]!.getBoundingClientRect().bottom),
    );
    expect(Math.round(bars[0]!.getBoundingClientRect().top)).toBe(Math.round(bars[1]!.getBoundingClientRect().top));
  });

  test("the bar's buttons stack full width on a narrow screen", async () => {
    await page.viewport(375, 700);
    try {
      const { container } = await render(AeSurface, {
        slots: { default: "Body", actions: () => [h(AeButton, null, () => "One"), h(AeButton, null, () => "Two")] },
      });
      const [a, b] = [...container.querySelectorAll<HTMLElement>(".ae-actions--bar > .ae-btn")];
      expect(b!.getBoundingClientRect().top).toBeGreaterThan(a!.getBoundingClientRect().bottom - 1);
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeSurface, { pad: "sm" }, () => h("h2", "Plain")),
            h(
              AeSurface,
              { tone: "tint", pad: "lg", clip: true, as: "section", "aria-label": "Tinted" },
              () => "Tinted",
            ),
            h(AeSurface, { tone: "float" }, () => "Float"),
            h(
              AeSurface,
              { as: "article", "aria-label": "With bar" },
              { default: () => "Body", actions: () => h(AeButton, null, () => "Pay") },
            ),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
