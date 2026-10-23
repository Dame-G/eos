import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EHeading from "./EHeading.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EHeading", () => {
  test("is a level 2 heading by default", async () => {
    const { container } = await render(EHeading, { slots: { default: "Your statements" } });
    await expect.element(page.getByRole("heading", { level: 2, name: "Your statements" })).toBeVisible();
    expect(container.querySelector("h2")!.className).toBe("e-h e-h2");
  });

  test.each([1, 2, 3, 4, 5, 6] as const)("level %i sets the element and the size class", async (level) => {
    const { container } = await render(EHeading, { props: { level }, slots: { default: "Title" } });
    expect(container.querySelector(`h${level}.e-h.e-h${level}`)).not.toBeNull();
  });

  test("the six sizes are 36, 24, 20, 18, 16 and 14px at weight 500", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            "div",
            [1, 2, 3, 4, 5, 6].map((level) => h(EHeading, { level: level as 1 | 2 | 3 | 4 | 5 | 6 }, () => "T")),
          ),
      }),
    );
    const styles = [...container.querySelectorAll(".e-h")].map((e) => getComputedStyle(e));
    expect(styles.map((s) => s.fontSize)).toEqual(["36px", "24px", "20px", "18px", "16px", "14px"]);
    expect(styles.every((s) => s.fontWeight === "500")).toBe(true);
  });

  test("a kicker sits above the heading and is not a heading itself", async () => {
    const { container } = await render(EHeading, { props: { kicker: "Statement 8842" }, slots: { default: "Visit" } });
    const kicker = container.querySelector(".e-kicker")!;
    expect(kicker.tagName).toBe("P");
    expect(kicker.textContent).toBe("Statement 8842");
    expect(
      kicker.compareDocumentPosition(container.querySelector("h2")!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(page.getByRole("heading").elements().length).toBe(1);
  });

  test("no kicker element without the prop", async () => {
    const { container } = await render(EHeading, { slots: { default: "Visit" } });
    expect(container.querySelector(".e-kicker")).toBeNull();
  });

  test("without a kicker there is no wrapper and attributes land on the heading", async () => {
    const { container } = await render(EHeading, {
      attrs: { "data-testid": "h", class: "mine", id: "t" },
      slots: { default: "Visit" },
    });
    expect(container.querySelector(".e-heading")).toBeNull();
    const el = container.firstElementChild!;
    expect(el.tagName).toBe("H2");
    expect(el.getAttribute("data-testid")).toBe("h");
    expect(el.id).toBe("t");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("with a kicker the wrapper is bare and every attribute lands on the heading", async () => {
    const { container } = await render(EHeading, {
      props: { kicker: "Portal" },
      attrs: { class: "mine", id: "t" },
      slots: { default: "Visit" },
    });
    expect(container.querySelector(".e-heading")!.className).toBe("e-heading");
    expect(container.querySelector("h2")!.id).toBe("t");
    expect(container.querySelector("h2")!.classList.contains("mine")).toBe(true);
  });

  test("as sets the element and level keeps the size", async () => {
    const { container } = await render(EHeading, { props: { level: 2, as: "h4" }, slots: { default: "Visit" } });
    const el = container.querySelector("h4")!;
    expect(el.classList.contains("e-h2")).toBe(true);
    expect(getComputedStyle(el).fontSize).toBe("24px");
    const p = await render(EHeading, { props: { level: 3, as: "p" }, slots: { default: "Visit" } });
    expect(p.container.querySelector("p.e-h3")).not.toBeNull();
  });

  test("has no accessibility violations in any level", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EHeading, { level: 1, kicker: "Portal" }, () => "One"),
            h(EHeading, { level: 2 }, () => "Two"),
            h(EHeading, { level: 3 }, () => "Three"),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
