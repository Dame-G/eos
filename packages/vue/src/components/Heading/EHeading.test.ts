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

  test("attributes fall through to the wrapper", async () => {
    const { container } = await render(EHeading, {
      attrs: { "data-testid": "h", class: "mine" },
      slots: { default: "Visit" },
    });
    const el = container.querySelector(".e-heading")!;
    expect(el.getAttribute("data-testid")).toBe("h");
    expect(el.classList.contains("mine")).toBe(true);
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
