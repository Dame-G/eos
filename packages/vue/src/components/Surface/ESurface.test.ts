import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ESurface from "./ESurface.vue";
import EButton from "../Button/EButton.vue";
import EGrid from "../Grid/EGrid.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("ESurface", () => {
  test("is a padded card with the slot inside", async () => {
    const { container } = await render(ESurface, { slots: { default: "x" } });
    const el = container.querySelector("div")!;
    expect(el.className).toBe("e-surface e-surface--pad-md");
    expect(el.textContent).toBe("x");
    expect(getComputedStyle(el).paddingTop).toBe("16px");
  });

  test("small, large and flush set the padding from the space scale", async () => {
    const pads: string[] = [];
    for (const props of [{ small: true }, { large: true }, { flush: true }] as Record<string, boolean>[]) {
      const { container } = await render(ESurface, { props, slots: { default: "x" } });
      pads.push(getComputedStyle(container.querySelector(".e-surface")!).paddingTop);
    }
    expect(pads).toEqual(["12px", "24px", "0px"]);
  });

  test("pad still works as a deprecated alias", async () => {
    const { container } = await render(ESurface, { props: { pad: "lg" }, slots: { default: "x" } });
    expect(container.querySelector(".e-surface")!.classList.contains("e-surface--pad-lg")).toBe(true);
  });

  test("paper switches to the paper ground", async () => {
    const plain = await render(ESurface, { slots: { default: "x" } });
    const paper = await render(ESurface, { props: { paper: true }, slots: { default: "x" } });
    expect(getComputedStyle(paper.container.querySelector(".e-surface")!).backgroundColor).not.toBe(
      getComputedStyle(plain.container.querySelector(".e-surface")!).backgroundColor,
    );
  });

  test("clip adds a class", async () => {
    const { container } = await render(ESurface, { props: { clip: true }, slots: { default: "x" } });
    expect(container.querySelector("div")!.className).toBe("e-surface e-surface--pad-md e-surface--clip");
  });

  test("raised adds its class", async () => {
    const { container } = await render(ESurface, { props: { raised: true }, slots: { default: "x" } });
    expect(container.querySelector(".e-surface--raised")).not.toBeNull();
  });

  test("`as` chooses the element", async () => {
    const { container } = await render(ESurface, { props: { as: "section" }, slots: { default: "x" } });
    expect(container.querySelector("section.e-surface")).not.toBeNull();
  });

  test("class, style, id, role and aria attributes fall through to the root", async () => {
    const { container } = await render(ESurface, {
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
    expect(el.classList.contains("e-surface")).toBe(true);
    expect(el.style.marginTop).toBe("7px");
    expect(el.id).toBe("card");
    expect(el.getAttribute("aria-label")).toBe("Totals");
    expect(el.dataset.x).toBe("1");
    await expect.element(page.getByRole("region", { name: "Totals" })).toBeVisible();
  });

  test("actions render as a bar after the body, edge to edge", async () => {
    const { container } = await render(ESurface, {
      props: {},
      slots: { default: "Body", actions: () => h(EButton, null, () => "Pay") },
    });
    const root = container.querySelector(".e-surface")!;
    expect(root.className).toBe("e-surface e-surface--actions");
    expect(container.querySelectorAll(".e-surface > .e-actions--bar").length).toBe(1);
    const body = root.querySelector(":scope > .e-surface-body")!;
    expect(body.className).toBe("e-surface-body e-surface--pad-md");
    expect(body.textContent).toBe("Body");
    expect(root.lastElementChild!.className).toBe("e-actions e-actions--bar");
    await expect.element(page.getByRole("button", { name: "Pay" })).toBeVisible();
  });

  test("the bar is a div, and a footer when the surface is an article, section or aside", async () => {
    for (const [as, tag] of [
      ["div", "DIV"],
      ["article", "FOOTER"],
      ["section", "FOOTER"],
      ["aside", "FOOTER"],
    ] as const) {
      const { container } = await render(ESurface, {
        props: { as },
        slots: { default: "Body", actions: () => h(EButton, null, () => "Go") },
      });
      expect(container.querySelector(".e-actions--bar")!.tagName).toBe(tag);
    }
  });

  test("clip does not apply when there is a bar (the bar already clips)", async () => {
    const { container } = await render(ESurface, {
      props: { clip: true },
      slots: { default: "Body", actions: () => "A" },
    });
    expect(container.querySelector(".e-surface--clip")).toBeNull();
  });

  test("clip with a bar warns in development", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await render(ESurface, { props: { clip: true }, slots: { default: "Body", actions: () => "A" } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("clip"));
    warn.mockRestore();
  });

  test("size sets the padding, and wins over small and large with a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pad = async (props: Record<string, unknown>) => {
      const { container } = await render(ESurface, { props, slots: { default: "x" } });
      return getComputedStyle(container.querySelector(".e-surface")!).paddingTop;
    };
    expect(await pad({ size: "sm" })).toBe(await pad({ small: true }));
    expect(await pad({ size: "lg" })).toBe(await pad({ large: true }));
    expect(warn.mock.calls.filter(([m]) => String(m).startsWith("[eos]"))).toEqual([]);
    expect(await pad({ size: "md", large: true })).toBe(await pad({}));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("ESurface"));
    warn.mockRestore();
  });

  test("padding takes a gap name, a space number or a length, on the body when there is a bar", async () => {
    const { container } = await render(ESurface, { props: { padding: "section" }, slots: { default: "x" } });
    expect(getComputedStyle(container.querySelector(".e-surface")!).paddingTop).toBe("24px");
    const bar = await render(ESurface, { props: { padding: 2 }, slots: { default: "x", actions: () => "A" } });
    expect(getComputedStyle(bar.container.querySelector(".e-surface-body")!).paddingTop).toBe("8px");
    expect(getComputedStyle(bar.container.querySelector(".e-surface")!).paddingTop).toBe("0px");
  });

  test("outline has no fill and tone has a tint", async () => {
    const bg = async (variant: "outline" | "tone" | "paper") => {
      const { container } = await render(ESurface, { props: { variant }, slots: { default: "x" } });
      return getComputedStyle(container.querySelector(".e-surface")!).backgroundColor;
    };
    const plain = await render(ESurface, { slots: { default: "x" } });
    const base = getComputedStyle(plain.container.querySelector(".e-surface")!).backgroundColor;
    expect(await bg("outline")).toBe("rgba(0, 0, 0, 0)");
    expect(await bg("tone")).not.toBe(base);
    expect(await bg("paper")).not.toBe(base);
  });

  test("in a Grid every card takes the tallest height, with the bar level at the foot", async () => {
    const Card = (text: string) =>
      h(ESurface, { as: "article" }, { default: () => text, actions: () => h(EButton, null, () => "Pay") });
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "560px" } }, [
            h(EGrid, { min: "15rem", gap: 3 }, () => [
              Card("Short"),
              Card(
                "A much longer body that wraps over several lines because the column is narrow, and then some more words",
              ),
            ]),
          ]),
      }),
    );
    const cards = [...container.querySelectorAll<HTMLElement>(".e-surface")];
    expect(cards.length).toBe(2);
    expect(Math.round(cards[0]!.getBoundingClientRect().height)).toBe(
      Math.round(cards[1]!.getBoundingClientRect().height),
    );
    const bars = [...container.querySelectorAll<HTMLElement>(".e-surface > .e-actions--bar")];
    expect(Math.round(bars[0]!.getBoundingClientRect().bottom)).toBe(
      Math.round(cards[0]!.getBoundingClientRect().bottom),
    );
    expect(Math.round(bars[0]!.getBoundingClientRect().top)).toBe(Math.round(bars[1]!.getBoundingClientRect().top));
  });

  test("the bar's buttons stack full width on a narrow screen", async () => {
    await page.viewport(375, 700);
    try {
      const { container } = await render(ESurface, {
        slots: { default: "Body", actions: () => [h(EButton, null, () => "One"), h(EButton, null, () => "Two")] },
      });
      const [a, b] = [...container.querySelectorAll<HTMLElement>(".e-actions--bar > .e-btn")];
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
            h(ESurface, { small: true }, () => h("h2", "Plain")),
            h(ESurface, { large: true, clip: true, as: "section", "aria-label": "Padded" }, () => "Padded"),
            h(ESurface, { raised: true }, () => "Raised"),
            h(ESurface, { paper: true, flush: true }, () => "Statement"),
            h(
              ESurface,
              { as: "article", "aria-label": "With bar" },
              { default: () => "Body", actions: () => h(EButton, null, () => "Pay") },
            ),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
